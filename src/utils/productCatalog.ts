import { CBDCategory, CBDProduct, cbdGuideData, PANGAIA_PRODUCTS, SOUCANNABIS_PRODUCTS } from '../data/cbdGuide';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

/**
 * Cleanly merges base code catalog, local admin store, and cloud Firestore catalog
 * ensuring all medications (both default and custom added) are present without duplication.
 */
export function slugifyBrandName(manufacturer?: string): string {
  const clean = (manufacturer || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'marca_personalizada';
}

export function buildCustomBrandCategory(
  categoryId: string,
  manufacturerName: string,
  origin: string = 'Nacional',
  initialProducts: CBDProduct[] = []
): CBDCategory {
  const cleanBrand = (manufacturerName || 'Marca Cadastrada').trim();
  const isImported = (origin || '').toLowerCase().includes('importado');
  return {
    id: categoryId,
    title: `${cleanBrand.toUpperCase()} — CATÁLOGO DE MEDICAMENTOS (${isImported ? 'IMPORTADO • RDC 660' : 'ASSOCIAÇÃO / NACIONAL'})`,
    description: `Catálogo oficial de medicamentos e formulações da marca/associação ${cleanBrand}. Todos os produtos desta marca ficam agrupados nesta aba para facilitar a consulta clínica e a prescrição médica.`,
    indicationsList: [
      'Dor Crônica & Fibromialgia',
      'Ansiedade, Estresse & Insônia',
      'Modulação do Sistema Endocanabinoide',
      'Prescrição Médica Individualizada'
    ],
    dosageGuidance: 'Administração e titulação individualizada conforme prescrição médica ("Start Low, Go Slow").',
    products: initialProducts
  };
}

/**
 * Cleanly merges base code catalog, local admin store, and cloud Firestore catalog
 * ensuring all medications (both default and custom added) are present without duplication
 * and grouping manually added products into their respective Brand Tabs.
 */
export function mergeProductCatalogs(
  baseCategories: CBDCategory[] = cbdGuideData,
  storeCategories?: CBDCategory[],
  cloudCategories?: CBDCategory[]
): CBDCategory[] {
  const categoryMap = new Map<string, CBDCategory>();
  const baseProductNames = new Set<string>();

  // 1. Initialize with base categories from code
  baseCategories.forEach(cat => {
    cat.products.forEach(p => {
      if (p && p.name) {
        baseProductNames.add(p.name.trim().toLowerCase());
      }
    });
    categoryMap.set(cat.id, {
      ...cat,
      products: [...cat.products]
    });
  });

  // Helper to insert or update a product inside a target category in categoryMap
  const upsertProductInCategory = (targetCatId: string, prod: CBDProduct, fallbackCatMeta?: Partial<CBDCategory>) => {
    if (!prod || !prod.name) return;
    const cleanName = prod.name.trim().toLowerCase();

    if (!categoryMap.has(targetCatId)) {
      const built = buildCustomBrandCategory(
        targetCatId,
        prod.manufacturer || fallbackCatMeta?.title || 'Marca Cadastrada',
        prod.origin || 'Nacional',
        []
      );
      categoryMap.set(targetCatId, {
        ...built,
        ...(fallbackCatMeta?.description ? { description: fallbackCatMeta.description } : {}),
        ...(fallbackCatMeta?.indicationsList ? { indicationsList: fallbackCatMeta.indicationsList } : {}),
        ...(fallbackCatMeta?.dosageGuidance ? { dosageGuidance: fallbackCatMeta.dosageGuidance } : {}),
        title:
          fallbackCatMeta?.title && fallbackCatMeta.title !== 'Produtos Cadastrados'
            ? fallbackCatMeta.title
            : built.title,
        products: []
      });
    }

    const target = categoryMap.get(targetCatId)!;
    const existingIdx = target.products.findIndex(ep => (ep.name || '').trim().toLowerCase() === cleanName);
    if (existingIdx === -1) {
      target.products.unshift({ ...prod });
    } else {
      target.products[existingIdx] = { ...target.products[existingIdx], ...prod };
    }
  };

  // Helper to merge a list of categories
  const mergeList = (categoriesToMerge?: CBDCategory[]) => {
    if (!categoriesToMerge || !Array.isArray(categoriesToMerge)) return;

    categoriesToMerge.forEach(sourceCat => {
      if (!sourceCat || !sourceCat.id) return;

      const isGenericLooseCategory =
        sourceCat.title === 'Produtos Cadastrados' ||
        sourceCat.id === 'produtos_cadastrados' ||
        sourceCat.id === 'custom_products';

      if (categoryMap.has(sourceCat.id) && !isGenericLooseCategory) {
        const target = categoryMap.get(sourceCat.id)!;

        // Merge products
        if (Array.isArray(sourceCat.products)) {
          sourceCat.products.forEach(p => {
            if (!p || !p.name) return;
            const cleanName = p.name.trim().toLowerCase();
            const isBaseProd = baseProductNames.has(cleanName);
            const bestBrandCatId = getBestCategoryIdForProduct(p.origin, p.manufacturer);

            // If this is a manually added product with a custom brand (or a different official brand than where it was accidentally dropped),
            // make sure it is ALSO present in its proper Brand Tab so it never stays loose!
            if (!isBaseProd && bestBrandCatId && bestBrandCatId !== sourceCat.id) {
              upsertProductInCategory(bestBrandCatId, p);
              // If sourceCat was a brand category that doesn't match the product's manufacturer (e.g. default 'soucannabis_oficial' when user typed another brand),
              // don't pollute SouCannabis with a different brand's product
              const isSourceOfficialBrand = [
                'soucannabis_oficial',
                'pangaia_oficial',
                'abrace_oficial',
                'abecmed_oficial',
                'flowermed_oficial',
                'greenbudz_oficial'
              ].includes(sourceCat.id);
              if (isSourceOfficialBrand) {
                return;
              }
            }

            upsertProductInCategory(sourceCat.id, p, sourceCat);
          });
        }

        // Merge indicationsList
        if (Array.isArray(sourceCat.indicationsList)) {
          const combinedIndications = new Set([...(target.indicationsList || []), ...sourceCat.indicationsList]);
          target.indicationsList = Array.from(combinedIndications);
        }
      } else {
        // Either a custom brand category (`brand_*`) or a legacy loose category (`Produtos Cadastrados`)
        if (Array.isArray(sourceCat.products)) {
          sourceCat.products.forEach(p => {
            if (!p || !p.name) return;
            const targetId = isGenericLooseCategory
              ? getBestCategoryIdForProduct(p.origin, p.manufacturer)
              : sourceCat.id;
            upsertProductInCategory(targetId, p, isGenericLooseCategory ? undefined : sourceCat);
          });
        }
      }
    });
  };

  // 2. Merge local admin store categories
  mergeList(storeCategories);

  // 3. Merge cloud Firestore categories
  mergeList(cloudCategories);

  // 4. Guarantee all 20 Pangaia products and all SouCannabis products are fully present and enriched with all clinical properties
  const pangaiaCat = categoryMap.get('pangaia_oficial');
  if (pangaiaCat) {
    const existingNames = new Set(pangaiaCat.products.map(p => (p.name || '').trim().toLowerCase()));
    PANGAIA_PRODUCTS.forEach(baseProd => {
      const bName = baseProd.name.trim().toLowerCase();
      if (!existingNames.has(bName)) {
        pangaiaCat.products.push({ ...baseProd });
        existingNames.add(bName);
      } else {
        const pIdx = pangaiaCat.products.findIndex(p => (p.name || '').trim().toLowerCase() === bName);
        if (pIdx !== -1) {
          pangaiaCat.products[pIdx] = { ...baseProd, ...pangaiaCat.products[pIdx] };
        }
      }
    });
  }

  const souCat = categoryMap.get('soucannabis_oficial');
  if (souCat) {
    const existingNames = new Set(souCat.products.map(p => (p.name || '').trim().toLowerCase()));
    SOUCANNABIS_PRODUCTS.forEach(baseProd => {
      const bName = baseProd.name.trim().toLowerCase();
      if (!existingNames.has(bName)) {
        souCat.products.push({ ...baseProd });
        existingNames.add(bName);
      } else {
        const pIdx = souCat.products.findIndex(p => (p.name || '').trim().toLowerCase() === bName);
        if (pIdx !== -1) {
          souCat.products[pIdx] = { ...baseProd, ...souCat.products[pIdx] };
        }
      }
    });
  }

  // 5. Filter out all products deleted by the doctor across all categories
  const deletedSet = getDeletedProductNames();
  categoryMap.forEach((cat, key) => {
    cat.products = cat.products.filter(p => !deletedSet.has((p.name || '').trim().toLowerCase()));
    // Remove empty custom brand categories if all their products were deleted
    if (key.startsWith('brand_') && cat.products.length === 0) {
      categoryMap.delete(key);
    }
  });

  // 6. Merge doctor-saved custom Bula overrides from localStorage
  if (typeof window !== 'undefined') {
    try {
      categoryMap.forEach(cat => {
        cat.products = cat.products.map(p => {
          if (!p || !p.name) return p;
          return applyCustomBulaToProduct(p);
        });
      });
    } catch {
      // ignore
    }
  }

  // Order categories so custom brand tabs (`brand_*`) and official brand tabs appear prominently at the top
  const allCats = Array.from(categoryMap.values());
  const customBrandCats = allCats.filter(c => c.id.startsWith('brand_'));
  const otherCats = allCats.filter(c => !c.id.startsWith('brand_'));
  return [...customBrandCats, ...otherCats];
}

/**
 * Retrieves custom Bula overrides for a product by name or object
 */
export function getCustomBulaData(productOrName: string | any): any | null {
  if (typeof window === 'undefined' || !productOrName) return null;
  try {
    const rawName = typeof productOrName === 'string' ? productOrName : (productOrName.name || productOrName.id || '');
    if (!rawName && typeof productOrName !== 'object') return null;

    if (rawName) {
      const cleanKey = `mecura_bula_custom_${String(rawName).trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const savedRaw = localStorage.getItem(cleanKey);
      if (savedRaw) {
        return JSON.parse(savedRaw);
      }
    }

    // Also try checking by id if an object was provided
    if (typeof productOrName === 'object' && productOrName.id) {
      const idKey = `mecura_bula_custom_${String(productOrName.id).trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const idSavedRaw = localStorage.getItem(idKey);
      if (idSavedRaw) {
        return JSON.parse(idSavedRaw);
      }
    }

    // Also try checking if productOrName is object with name
    if (typeof productOrName === 'object' && productOrName.name) {
      const nameKey = `mecura_bula_custom_${String(productOrName.name).trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const nameSaved = localStorage.getItem(nameKey);
      if (nameSaved) {
        return JSON.parse(nameSaved);
      }
    }

    // Resilient fallback: scan localStorage keys starting with mecura_bula_custom_
    const targetNameClean = (typeof productOrName === 'string' ? productOrName : (productOrName.name || '')).trim().toLowerCase();
    const targetIdClean = (typeof productOrName === 'object' && productOrName.id ? String(productOrName.id) : '').trim().toLowerCase();

    if (targetNameClean || targetIdClean) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mecura_bula_custom_')) {
          try {
            const itemRaw = localStorage.getItem(k);
            if (itemRaw) {
              const parsed = JSON.parse(itemRaw);
              const pName = (parsed.name || '').trim().toLowerCase();
              const pId = (parsed.id || '').trim().toLowerCase();
              if (targetNameClean && (pName === targetNameClean || pName.includes(targetNameClean) || targetNameClean.includes(pName))) {
                return parsed;
              }
              if (targetIdClean && (pId === targetIdClean || k.includes(targetIdClean))) {
                return parsed;
              }
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    console.warn("Error reading custom bula:", e);
  }
  return null;
}

/**
 * Applies all custom fields saved from the Bula modal onto a product object
 */
export function applyCustomBulaToProduct<T extends { name: string }>(product: T): T {
  if (!product || !product.name) return product;
  const custom = getCustomBulaData(product);
  if (!custom) return product;

  const anyP = product as any;
  const cleanConcentration = (custom.concentration || custom.activeIngredients || anyP.concentration || '').trim();
  const cleanActive = (custom.activeIngredients || cleanConcentration || anyP.activeIngredients || '').trim();
  const cleanPosology = (custom.posologyDetails || custom.usageInstructions || anyP.posologyDetails || anyP.usageInstructions || '').trim();

  return {
    ...product,
    name: custom.name && custom.name.trim() ? custom.name.trim() : product.name,
    manufacturer: custom.manufacturer && custom.manufacturer.trim() ? custom.manufacturer.trim() : anyP.manufacturer,
    origin: custom.origin || anyP.origin,
    type: custom.type || anyP.type,
    concentration: cleanConcentration,
    activeIngredients: cleanActive,
    pharmaceuticalForm: custom.pharmaceuticalForm || anyP.pharmaceuticalForm,
    quantity: custom.quantity || anyP.quantity,
    administrationRoute: custom.administrationRoute || anyP.administrationRoute,
    carrierVehicle: custom.carrierVehicle || anyP.carrierVehicle,
    posologyDetails: cleanPosology,
    usageInstructions: cleanPosology,
    prescriptionExample: custom.prescriptionExample || anyP.prescriptionExample,
    indications: custom.indications || anyP.indications,
    description: custom.description || anyP.description,
    priceBRL: custom.priceBRL !== undefined && custom.priceBRL !== '' ? Number(String(custom.priceBRL).replace(/[^0-9.]/g, '')) : anyP.priceBRL,
    priceUSD: custom.priceUSD !== undefined && custom.priceUSD !== '' ? Number(String(custom.priceUSD).replace(/[^0-9.]/g, '')) : anyP.priceUSD,
    dropsPerMl: custom.dropsPerMl !== undefined && custom.dropsPerMl !== '' ? (Number(custom.dropsPerMl) || custom.dropsPerMl) : anyP.dropsPerMl,
    mgPerDropCBD: custom.mgPerDropCBD !== undefined && custom.mgPerDropCBD !== '' ? (Number(custom.mgPerDropCBD) || custom.mgPerDropCBD) : anyP.mgPerDropCBD,
    mgPerDropTHC: custom.mgPerDropTHC !== undefined && custom.mgPerDropTHC !== '' ? (Number(custom.mgPerDropTHC) || custom.mgPerDropTHC) : anyP.mgPerDropTHC,
    mgPerDropDelta8: custom.mgPerDropDelta8 !== undefined && custom.mgPerDropDelta8 !== '' ? (Number(custom.mgPerDropDelta8) || custom.mgPerDropDelta8) : anyP.mgPerDropDelta8,
    ratio: custom.ratio || anyP.ratio,
    details: [
      cleanConcentration,
      custom.pharmaceuticalForm || anyP.pharmaceuticalForm,
      custom.quantity || anyP.quantity,
      custom.administrationRoute || anyP.administrationRoute,
      custom.carrierVehicle || anyP.carrierVehicle
    ].filter(Boolean) as string[]
  };
}

/**
 * Returns a Set of lowercase product names that the doctor deleted
 */
export function getDeletedProductNames(): Set<string> {
  const set = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mecura_deleted_products');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((item: string) => {
            if (typeof item === 'string' && item.trim()) {
              set.add(item.trim().toLowerCase());
            }
          });
        }
      }
    } catch (e) {
      console.warn("Error reading deleted products:", e);
    }
  }
  return set;
}

/**
 * Marks a product as deleted in localStorage and Firestore so it disappears permanently from the catalog
 */
export function markProductAsDeleted(productName: string): void {
  if (typeof window === 'undefined' || !productName) return;
  try {
    const clean = productName.trim().toLowerCase();
    const existing = getDeletedProductNames();
    existing.add(clean);
    const arr = Array.from(existing);
    localStorage.setItem('mecura_deleted_products', JSON.stringify(arr));

    // Also remove any saved bula overrides from localStorage
    const storageKey = `mecura_bula_custom_${clean.replace(/[^a-z0-9]/g, '_')}`;
    localStorage.removeItem(storageKey);

    const docRef = doc(db, 'settings', 'productCatalog');
    setDoc(docRef, {
      deletedProductNames: arr,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(console.warn);
  } catch (e) {
    console.warn("Error marking product as deleted:", e);
  }
}

/**
 * Unmarks a product as deleted (e.g. if doctor re-creates or restores a product)
 */
export function unmarkProductAsDeleted(productName: string): void {
  if (typeof window === 'undefined' || !productName) return;
  try {
    const clean = productName.trim().toLowerCase();
    const existing = getDeletedProductNames();
    existing.delete(clean);
    const arr = Array.from(existing);
    localStorage.setItem('mecura_deleted_products', JSON.stringify(arr));

    const docRef = doc(db, 'settings', 'productCatalog');
    setDoc(docRef, {
      deletedProductNames: arr,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(console.warn);
  } catch (e) {
    console.warn("Error unmarking product as deleted:", e);
  }
}

/**
 * Returns a deduplicated, sorted list of all diseases/pathologies across categories and products
 */
export function extractAllDiseases(categories: CBDCategory[]): string[] {
  const diseaseSet = new Set<string>();

  categories.forEach(cat => {
    if (cat.indicationsList && Array.isArray(cat.indicationsList)) {
      cat.indicationsList.forEach(ind => {
        if (ind && typeof ind === 'string' && ind.trim()) {
          diseaseSet.add(ind.trim());
        }
      });
    }

    if (cat.products && Array.isArray(cat.products)) {
      cat.products.forEach(p => {
        if (p.indications && typeof p.indications === 'string') {
          p.indications.split(/[,;•\n]/).forEach(chunk => {
            const trimmed = chunk.trim();
            if (trimmed.length > 2 && trimmed.length < 50) {
              diseaseSet.add(trimmed);
            }
          });
        }
      });
    }
  });

  // Always include key medical cannabis clinical indications
  const coreDiseases = [
    "Ansiedade e Pânico",
    "Dor Crônica",
    "Insônia e Distúrbios do Sono",
    "Epilepsia e Convulsões",
    "Fibromialgia",
    "Autismo (TEA)",
    "TDAH",
    "Parkinson",
    "Alzheimer",
    "Enxaqueca",
    "Inflamação Crônica",
    "Doença de Crohn",
    "Esclerose Múltipla e Espasticidade",
    "Síndrome Metabólica e Obesidade",
    "Cuidados Paliativos"
  ];

  coreDiseases.forEach(d => diseaseSet.add(d));

  return Array.from(diseaseSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Returns a deduplicated, sorted list of all brands / manufacturers across all products
 */
export function extractAllBrands(categories: CBDCategory[]): string[] {
  const brandSet = new Set<string>();

  categories.forEach(cat => {
    if (cat.products && Array.isArray(cat.products)) {
      cat.products.forEach(p => {
        if (p.manufacturer && typeof p.manufacturer === 'string' && p.manufacturer.trim()) {
          brandSet.add(p.manufacturer.trim());
        }
      });
    }
  });

  return Array.from(brandSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Returns a deduplicated, sorted list of all product types / forms
 */
export function extractAllTypes(categories: CBDCategory[]): string[] {
  const typeSet = new Set<string>();

  categories.forEach(cat => {
    if (cat.products && Array.isArray(cat.products)) {
      cat.products.forEach(p => {
        if (p.type && typeof p.type === 'string' && p.type.trim()) {
          typeSet.add(p.type.trim());
        }
      });
    }
  });

  return Array.from(typeSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Saves product categories to Firestore so any client (Doctor, Admin, Patient) sees newly added medications
 */
export async function syncCatalogToFirestore(categories: CBDCategory[]): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'productCatalog');
    const deletedList = Array.from(getDeletedProductNames());
    await setDoc(docRef, {
      categories,
      deletedProductNames: deletedList,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Failed to sync catalog to Firestore:", err);
  }
}

/**
 * Subscribes to product catalog changes in Firestore
 */
export function subscribeToFirestoreCatalog(onUpdate: (categories: CBDCategory[]) => void): () => void {
  try {
    const docRef = doc(db, 'settings', 'productCatalog');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.deletedProductNames)) {
          try {
            const currentDeleted = getDeletedProductNames();
            data.deletedProductNames.forEach((name: string) => {
              if (typeof name === 'string' && name.trim()) {
                currentDeleted.add(name.trim().toLowerCase());
              }
            });
            localStorage.setItem('mecura_deleted_products', JSON.stringify(Array.from(currentDeleted)));
          } catch (e) {
            console.warn("Error updating local deleted products from firestore:", e);
          }
        }
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          onUpdate(data.categories);
        }
      }
    }, (err) => {
      console.warn("Error listening to Firestore product catalog:", err);
    });
  } catch (err) {
    console.warn("Failed to subscribe to Firestore product catalog:", err);
    return () => {};
  }
}

/**
 * Returns the best matching category ID for a given product origin and manufacturer/brand name.
 * For any custom brand name not matching the built-in brands, returns `brand_<slug>` so the brand gets its own dedicated tab.
 */
export function getBestCategoryIdForProduct(origin?: string, manufacturer?: string): string {
  const cleanM = (manufacturer || '').toLowerCase().trim();
  if (!cleanM) {
    return origin === 'Importado' ? 'pangaia_oficial' : 'associacoes_nacionais';
  }
  if (cleanM.includes('soucannabis') || cleanM.includes('sou cannabis')) return 'soucannabis_oficial';
  if (cleanM.includes('abrace')) return 'abrace_oficial';
  if (cleanM.includes('abec')) return 'abecmed_oficial';
  if (cleanM.includes('pangaia') || cleanM.includes('maná') || cleanM.includes('taio') || cleanM.includes('táio')) return 'pangaia_oficial';
  if (cleanM.includes('flowermed')) return 'flowermed_oficial';
  if (cleanM.includes('greenbudz') || cleanM.includes('green budz')) return 'greenbudz_oficial';
  if (cleanM.includes('flores in natura') || cleanM.includes('flores & extrações') || cleanM.includes('folheto')) return 'flores_extracoes';
  if (
    cleanM === 'associação nacional' ||
    cleanM === 'associacao nacional' ||
    cleanM === 'associação brasileira' ||
    cleanM === 'associacao brasileira' ||
    cleanM === 'associação brasileira (nacional)' ||
    cleanM === 'associação nacional (brasil)' ||
    cleanM === 'associações nacionais' ||
    cleanM === 'associação / laboratório'
  ) {
    return 'associacoes_nacionais';
  }

  return `brand_${slugifyBrandName(manufacturer)}`;
}

export interface BrandTabItem {
  categoryId: string;
  brandName: string;
  badge: string;
  emoji: string;
  origin: 'Nacional' | 'Importado';
  isCustomBrand: boolean;
  productCount: number;
  theme: 'emerald' | 'cyan' | 'neon' | 'sky' | 'purple' | 'amber';
}

/**
 * Extracts all Brand Tabs (both official brands and user-created custom brands) from the merged product categories
 */
export function getBrandTabsFromCategories(categories: CBDCategory[] = []): BrandTabItem[] {
  const catById = new Map<string, CBDCategory>();
  categories.forEach(c => catById.set(c.id, c));

  const officialTabs: BrandTabItem[] = [
    {
      categoryId: 'soucannabis_oficial',
      brandName: 'SouCannabis',
      badge: 'Associação Nacional',
      emoji: '🌱',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('soucannabis_oficial')?.products.length || 0,
      theme: 'emerald'
    },
    {
      categoryId: 'pangaia_oficial',
      brandName: 'Pangaia Biopharma',
      badge: 'EUA • RDC 660',
      emoji: '🌐',
      origin: 'Importado',
      isCustomBrand: false,
      productCount: catById.get('pangaia_oficial')?.products.length || 0,
      theme: 'cyan'
    },
    {
      categoryId: 'abrace_oficial',
      brandName: 'ABRACE Esperança',
      badge: 'Associação',
      emoji: '🌿',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('abrace_oficial')?.products.length || 0,
      theme: 'neon'
    },
    {
      categoryId: 'abecmed_oficial',
      brandName: 'ABECMED',
      badge: 'Associação',
      emoji: '🏢',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('abecmed_oficial')?.products.length || 0,
      theme: 'neon'
    },
    {
      categoryId: 'flowermed_oficial',
      brandName: 'Flowermed',
      badge: 'EUA • FDA',
      emoji: '🌸',
      origin: 'Importado',
      isCustomBrand: false,
      productCount: catById.get('flowermed_oficial')?.products.length || 0,
      theme: 'sky'
    },
    {
      categoryId: 'greenbudz_oficial',
      brandName: 'GreenBudzCBD',
      badge: 'EUA • RDC 660',
      emoji: '💎',
      origin: 'Importado',
      isCustomBrand: false,
      productCount: catById.get('greenbudz_oficial')?.products.length || 0,
      theme: 'purple'
    },
    {
      categoryId: 'flores_extracoes',
      brandName: 'Flores In Natura & Extrações',
      badge: '14g / Extrações',
      emoji: '🍃',
      origin: 'Importado',
      isCustomBrand: false,
      productCount: catById.get('flores_extracoes')?.products.length || 0,
      theme: 'emerald'
    },
    {
      categoryId: 'associacoes_nacionais',
      brandName: 'Associações Nacionais',
      badge: 'Brasil',
      emoji: '🇧🇷',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('associacoes_nacionais')?.products.length || 0,
      theme: 'emerald'
    }
  ];

  const customTabs: BrandTabItem[] = [];
  categories.forEach(cat => {
    if (cat.id.startsWith('brand_')) {
      const firstProd = cat.products[0];
      const rawBrandName =
        firstProd?.manufacturer ||
        cat.title.split('—')[0]?.trim() ||
        cat.id.replace(/^brand_/, '').replace(/_/g, ' ');
      const isImp =
        (firstProd?.origin || '').toLowerCase().includes('importado') ||
        cat.title.toLowerCase().includes('importado');
      customTabs.push({
        categoryId: cat.id,
        brandName: rawBrandName,
        badge: isImp ? 'Importado • RDC 660' : 'Marca / Associação',
        emoji: isImp ? '🌐' : '🏷️',
        origin: isImp ? 'Importado' : 'Nacional',
        isCustomBrand: true,
        productCount: cat.products.length,
        theme: isImp ? 'cyan' : 'amber'
      });
    }
  });

  // Put custom brands right at the start of the tabs bar so the doctor immediately sees any brand they created!
  return [...customTabs, ...officialTabs];
}

export interface RegisteredManufacturerInfo {
  id: string;
  name: string;
  shortName: string;
  origin: 'Nacional' | 'Importado';
  badgeText: string;
  description: string;
  highlights: string[];
  nationalCode?: 'soucannabis' | 'abrace' | 'abecmed' | 'all';
  importedCode?: 'pangaia' | 'flowermed' | 'greenbudz' | 'all';
  productCount: number;
}

/**
 * Returns the 6 official curated Associations (Nacionais) and Imported Companies (Importadas)
 * plus any custom brands registered by the doctor.
 */
export function getRegisteredManufacturers(categories: CBDCategory[] = []): RegisteredManufacturerInfo[] {
  const baseList: RegisteredManufacturerInfo[] = [
    // Associações Brasileiras (Nacionais)
    {
      id: 'soucannabis',
      name: 'SouCannabis',
      shortName: 'SouCannabis',
      origin: 'Nacional',
      badgeText: 'Associação Nacional • Laudos HPLC',
      description: 'Óleos Sublinguais em MCT (Azul, Lilás, Rosa, Laranja e Branco 0% THC), Extrações 60%/80%, Sprays e Flores.',
      highlights: ['Laudo HPLC', 'Óleos MCT', 'Extrações & Flores'],
      nationalCode: 'soucannabis',
      productCount: 28
    },
    {
      id: 'abecmed',
      name: 'ABECMED',
      shortName: 'ABECMED',
      origin: 'Nacional',
      badgeText: 'Associação Nacional • Extração RSO',
      description: 'Óleos Full Spectrum RSO em MCT, Extrações Sem Solvente e Inflorescências Medicinais Autorizadas.',
      highlights: ['Full Spectrum RSO', 'Sem Solvente', 'Inflorescências'],
      nationalCode: 'abecmed',
      productCount: 18
    },
    {
      id: 'abrace',
      name: 'ABRACE',
      shortName: 'ABRACE',
      origin: 'Nacional',
      badgeText: 'Associação Nacional • Pioneira no Brasil',
      description: 'Óleos Laranja, Vermelho, Preto, Azul e Roxo, Gomas Terapêuticas, Pomadas 100g, Spray Resgate e Flores.',
      highlights: ['Pioneira Nacional', 'Óleos & Pomadas', 'Spray Resgate'],
      nationalCode: 'abrace',
      productCount: 16
    },
    // Empresas Importadas (EUA • ANVISA RDC 660)
    {
      id: 'flowermed',
      name: 'FlowerMed',
      shortName: 'FlowerMed',
      origin: 'Importado',
      badgeText: 'Importado EUA • FDA & RDC 660',
      description: 'Hemp Oil 3000mg/6000mg, Linha Sphera Broad Spectrum, Óleos CBG, CBN, THCV, Gummies e Flores.',
      highlights: ['Padrão FDA', 'Óleos 3000/6000mg', 'Gummies & Flores'],
      importedCode: 'flowermed',
      productCount: 19
    },
    {
      id: 'pangaia',
      name: 'Pangaia',
      shortName: 'Pangaia',
      origin: 'Importado',
      badgeText: 'Importado EUA • ANVISA RDC 660',
      description: 'Óleos Full Spectrum 5%, 10% e 20%, Óleo Maná com Copaíba, Pomada Táio, Softgels, Gummies e Live Rosin.',
      highlights: ['RDC 660 ANVISA', 'Linha Maná & Táio', 'Live Rosin'],
      importedCode: 'pangaia',
      productCount: 18
    },
    {
      id: 'greenbudz',
      name: 'GreenBudz',
      shortName: 'GreenBudz',
      origin: 'Importado',
      badgeText: 'Importado EUA • ANVISA RDC 660',
      description: 'Calm Vibe 6000mg, Full Balance 3000mg, Isolate CBD 0% THC, Gomas Veganas Live Rosin e Flores THCa.',
      highlights: ['RDC 660 ANVISA', 'Calm Vibe 6000mg', 'Drops Live Rosin'],
      importedCode: 'greenbudz',
      productCount: 12
    }
  ];

  const customBrands: RegisteredManufacturerInfo[] = [];
  categories.forEach(cat => {
    if (cat.id.startsWith('brand_') && cat.products.length > 0) {
      const firstProd = cat.products[0];
      const brandName = firstProd?.manufacturer || cat.title.split('—')[0]?.trim() || 'Marca Personalizada';
      const isImp = (firstProd?.origin || '').toLowerCase().includes('importado');
      customBrands.push({
        id: cat.id,
        name: brandName,
        shortName: brandName,
        origin: isImp ? 'Importado' : 'Nacional',
        badgeText: isImp ? 'Importado • Marca Cadastrada' : 'Associação / Marca Nacional',
        description: cat.description || `Catálogo personalizado da marca ${brandName} com ${cat.products.length} medicamento(s).`,
        highlights: ['Aba Exclusiva', `${cat.products.length} Medicamento(s)`],
        nationalCode: isImp ? undefined : 'all',
        importedCode: isImp ? 'all' : undefined,
        productCount: cat.products.length
      });
    }
  });

  return [...customBrands, ...baseList];
}




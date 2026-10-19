import { CBDCategory, CBDProduct, cbdGuideData, PANGAIA_PRODUCTS, SOUCANNABIS_PRODUCTS } from '../data/cbdGuide';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

/**
 * Cleanly merges base code catalog, local admin store, and cloud Firestore catalog
 * ensuring all medications (both default and custom added) are present without duplication.
 */
export function mergeProductCatalogs(
  baseCategories: CBDCategory[] = cbdGuideData,
  storeCategories?: CBDCategory[],
  cloudCategories?: CBDCategory[]
): CBDCategory[] {
  const categoryMap = new Map<string, CBDCategory>();

  // 1. Initialize with base categories from code
  baseCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      products: [...cat.products]
    });
  });

  // Helper to merge a list of categories
  const mergeList = (categoriesToMerge?: CBDCategory[]) => {
    if (!categoriesToMerge || !Array.isArray(categoriesToMerge)) return;

    categoriesToMerge.forEach(sourceCat => {
      if (!sourceCat || !sourceCat.id) return;

      if (categoryMap.has(sourceCat.id)) {
        const target = categoryMap.get(sourceCat.id)!;
        const targetProductNames = new Set(target.products.map(p => (p.name || '').trim().toLowerCase()));

        // Merge products
        if (Array.isArray(sourceCat.products)) {
          sourceCat.products.forEach(p => {
            if (!p || !p.name) return;
            const cleanName = p.name.trim().toLowerCase();

            if (!targetProductNames.has(cleanName)) {
              target.products.unshift({ ...p });
              targetProductNames.add(cleanName);
            } else {
              // Update existing product with newer properties without erasing rich base fields
              const idx = target.products.findIndex(ep => (ep.name || '').trim().toLowerCase() === cleanName);
              if (idx !== -1) {
                target.products[idx] = { ...target.products[idx], ...p };
              }
            }
          });
        }

        // Merge indicationsList
        if (Array.isArray(sourceCat.indicationsList)) {
          const combinedIndications = new Set([...(target.indicationsList || []), ...sourceCat.indicationsList]);
          target.indicationsList = Array.from(combinedIndications);
        }
      } else {
        // Brand new category created dynamically
        categoryMap.set(sourceCat.id, {
          ...sourceCat,
          products: Array.isArray(sourceCat.products) ? [...sourceCat.products] : []
        });
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
  categoryMap.forEach(cat => {
    cat.products = cat.products.filter(p => !deletedSet.has((p.name || '').trim().toLowerCase()));
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

  return Array.from(categoryMap.values());
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
 * Returns the best matching category ID for a given product origin and manufacturer/brand name
 */
export function getBestCategoryIdForProduct(origin?: string, manufacturer?: string): string {
  const cleanM = (manufacturer || '').toLowerCase().trim();
  if (cleanM.includes('soucannabis') || cleanM.includes('sou cannabis')) return 'soucannabis_oficial';
  if (cleanM.includes('abrace')) return 'abrace_oficial';
  if (cleanM.includes('abec')) return 'abecmed_oficial';
  if (cleanM.includes('pangaia') || cleanM.includes('maná')) return 'pangaia_oficial';
  if (cleanM.includes('flowermed')) return 'flowermed_oficial';
  if (cleanM.includes('flor') || cleanM.includes('extração') || cleanM.includes('folheto')) return 'flores_extracoes';

  if (origin === 'Importado') return 'pangaia_oficial';
  return 'associacoes_nacionais';
}


import { CBDCategory, CBDProduct, cbdGuideData, PANGAIA_PRODUCTS, SOUCANNABIS_PRODUCTS, SANTA_GAIA_PRODUCTS, ACAFLOR_PRODUCTS } from '../data/cbdGuide';
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

let cachedCloudCategories: CBDCategory[] = [];
let cachedCloudCustomProducts: CBDProduct[] = [];
const sessionRestoredProductNames = new Set<string>();
const sessionRestoredCategoryIds = new Set<string>();

const BASE_PRODUCT_MAP = new Map<string, string>();
cbdGuideData.forEach(cat => {
  cat.products.forEach(p => {
    if (p && p.name) {
      BASE_PRODUCT_MAP.set(p.name.trim().toLowerCase(), (p.manufacturer || '').trim().toLowerCase());
    }
  });
});

export function isCustomAddedProduct(p?: CBDProduct | null): boolean {
  if (!p || !p.name) return false;
  if ((p as any).isCustom) return true;
  const cleanName = p.name.trim().toLowerCase();
  if (!BASE_PRODUCT_MAP.has(cleanName)) return true;
  const baseMfr = BASE_PRODUCT_MAP.get(cleanName) || '';
  const currentMfr = (p.manufacturer || '').trim().toLowerCase();
  if (currentMfr && baseMfr && currentMfr !== baseMfr) return true;
  if (/--+|\bfrascos?\/|\bembalagen|\bcontinuo\b/i.test(cleanName)) return true;
  return false;
}

export function getCustomAddedProducts(categories?: CBDCategory[]): CBDProduct[] {
  const cats = categories && categories.length > 0 ? categories : mergeProductCatalogs(cbdGuideData);
  const deletedSet = getDeletedProductNames();
  const seen = new Set<string>();
  const result: CBDProduct[] = [];

  cats.forEach(cat => {
    (cat.products || []).forEach(p => {
      if (!p || !p.name) return;
      const key = p.name.trim().toLowerCase();
      if (!key || deletedSet.has(key) || seen.has(key)) return;
      if (isCustomAddedProduct(p)) {
        seen.add(key);
        result.push(applyCustomBulaToProduct({ ...p, isCustom: true } as any));
      }
    });
  });

  return result;
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
  const effectiveCloudCategories =
    cloudCategories && cloudCategories.length > 0 ? cloudCategories : cachedCloudCategories;
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

  // Helper to hydrate compacted product fields
  const hydrateProduct = (prod: CBDProduct): CBDProduct => {
    const posology = prod.posologyDetails || prod.usageInstructions || '';
    const usage = prod.usageInstructions || prod.posologyDetails || '';
    const active = prod.activeIngredients || prod.concentration || '';
    const conc = prod.concentration || prod.activeIngredients || '';
    const details =
      Array.isArray(prod.details) && prod.details.length > 0
        ? prod.details
        : ([
            conc,
            prod.pharmaceuticalForm,
            prod.quantity,
            prod.administrationRoute
          ].filter(Boolean) as string[]);
    const customFlag = isCustomAddedProduct(prod);
    return {
      ...prod,
      ...(active ? { activeIngredients: active } : {}),
      ...(conc ? { concentration: conc } : {}),
      ...(posology ? { posologyDetails: posology, usageInstructions: usage } : {}),
      details,
      ...(customFlag ? { isCustom: true } : {})
    } as CBDProduct;
  };

  // Helper to insert or update a product inside a target category in categoryMap
  const upsertProductInCategory = (targetCatId: string, rawProd: CBDProduct, fallbackCatMeta?: Partial<CBDCategory>) => {
    if (!rawProd || !rawProd.name) return;
    const prod = hydrateProduct(rawProd);
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
      const existingProd = target.products[existingIdx];
      const isBase = baseProductNames.has(cleanName) && !isCustomAddedProduct(prod);
      target.products[existingIdx] = {
        ...existingProd,
        ...prod,
        priceBRL: isBase && existingProd.priceBRL ? existingProd.priceBRL : (prod.priceBRL ?? existingProd.priceBRL),
        priceUSD: isBase && existingProd.priceUSD ? existingProd.priceUSD : (prod.priceUSD ?? existingProd.priceUSD),
      };
    }
  };

  const normalizeCategoryId = (rawId: string, rawTitle?: string): string => {
    const rawIdLower = (rawId || '').toLowerCase();
    const rawTitleLower = (rawTitle || '').toLowerCase();
    if (rawIdLower.includes('santa_gaia') || rawIdLower.includes('santagaia') || rawTitleLower.includes('santa gaia')) {
      return 'santa_gaia_oficial';
    }
    if (rawIdLower.includes('acaflor') || rawIdLower.includes('açaflor') || rawTitleLower.includes('acaflor') || rawTitleLower.includes('açaflor')) {
      return 'acaflor_oficial';
    }
    if (rawIdLower.startsWith('brand_ascamed')) {
      return 'brand_ascamed_associacao';
    }
    if (rawIdLower.startsWith('brand_sequoia')) {
      return 'brand_sequoia_nacional';
    }
    if (rawIdLower === 'associacoes-nacionais') {
      return 'associacoes_nacionais';
    }
    if (rawIdLower === 'concentrados' || rawIdLower === 'bem_estar') {
      return 'greenbudz_oficial';
    }
    return rawId;
  };

  // Helper to merge a list of categories
  const mergeList = (categoriesToMerge?: CBDCategory[]) => {
    if (!categoriesToMerge || !Array.isArray(categoriesToMerge)) return;

    categoriesToMerge.forEach(sourceCat => {
      if (!sourceCat || !sourceCat.id) return;

      const normalizedCatId = normalizeCategoryId(sourceCat.id, sourceCat.title);

      const isGenericLooseCategory =
        sourceCat.title === 'Produtos Cadastrados' ||
        normalizedCatId === 'produtos_cadastrados' ||
        normalizedCatId === 'custom_products';

      if (categoryMap.has(normalizedCatId) && !isGenericLooseCategory) {
        const target = categoryMap.get(normalizedCatId)!;

        // Merge products
        if (Array.isArray(sourceCat.products)) {
          sourceCat.products.forEach(p => {
            if (!p || !p.name) return;
            const isCustom = isCustomAddedProduct(p);
            const bestBrandCatId = getBestCategoryIdForProduct(p.origin, p.manufacturer, p.name);

            // Ensure any custom or brand-modified product is always present in its proper Brand Tab
            if (isCustom && bestBrandCatId && bestBrandCatId !== normalizedCatId) {
              upsertProductInCategory(bestBrandCatId, p);
              // Do not pollute associacoes_nacionais with products that have their own dedicated brand tab
              if (normalizedCatId === 'associacoes_nacionais' && bestBrandCatId !== 'associacoes_nacionais') {
                return;
              }
            }

            upsertProductInCategory(normalizedCatId, p, sourceCat);
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
            const bestBrandCatId = getBestCategoryIdForProduct(p.origin, p.manufacturer, p.name);
            const targetId = isGenericLooseCategory ? bestBrandCatId : normalizedCatId;
            upsertProductInCategory(targetId, p, isGenericLooseCategory ? undefined : sourceCat);
            if (bestBrandCatId && bestBrandCatId !== targetId) {
              upsertProductInCategory(bestBrandCatId, p);
            }
          });
        }
      }
    });
  };

  // 2. Merge local admin store categories
  mergeList(storeCategories);

  // 3. Merge cloud Firestore categories & additive cloud customProducts
  mergeList(effectiveCloudCategories);
  if (Array.isArray(cachedCloudCustomProducts) && cachedCloudCustomProducts.length > 0) {
    cachedCloudCustomProducts.forEach(p => {
      if (!p || !p.name) return;
      const targetCatId = getBestCategoryIdForProduct(p.origin, p.manufacturer, p.name);
      upsertProductInCategory(targetCatId, p);
    });
  }

  // 3b. Scan localStorage for any doctor-saved custom products, custom bulas, programmed prescriptions, and saved prescriptions
  if (typeof window !== 'undefined') {
    try {
      // A. Recover from dedicated custom catalog backup (`mecura_custom_catalog_v2`)
      const rawCustomBackup = localStorage.getItem('mecura_custom_catalog_v2');
      if (rawCustomBackup) {
        const parsedBackup = JSON.parse(rawCustomBackup);
        if (Array.isArray(parsedBackup)) {
          parsedBackup.forEach((p: any) => {
            if (!p || !p.name) return;
            const targetCatId = getBestCategoryIdForProduct(p.origin, p.manufacturer, p.name);
            upsertProductInCategory(targetCatId, p);
          });
        }
      }

      // B. Recover from all `mecura_bula_custom_*` keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mecura_bula_custom_')) {
          try {
            const rawBula = localStorage.getItem(key);
            if (!rawBula) continue;
            const bula = JSON.parse(rawBula);
            if (!bula || !bula.name || typeof bula.name !== 'string') continue;
            const cleanName = bula.name.trim();
            if (!cleanName) continue;

            const isBase = baseProductNames.has(cleanName.toLowerCase());
            const combinedLower = `${cleanName} ${bula.manufacturer || ''}`.toLowerCase();
            const isSantaGaiaOrAcaflor =
              combinedLower.includes('santa gaia') ||
              combinedLower.includes('santagaia') ||
              combinedLower.includes('acaflor') ||
              combinedLower.includes('açaflor');

            if (!isBase || isSantaGaiaOrAcaflor) {
              const inferredManufacturer =
                (combinedLower.includes('santa gaia') || combinedLower.includes('santagaia')) &&
                (!bula.manufacturer || /soucannabis|associação brasileira|associação nacional/i.test(bula.manufacturer))
                  ? 'Associação Santa Gaia'
                  : (combinedLower.includes('acaflor') || combinedLower.includes('açaflor')) &&
                    (!bula.manufacturer || /soucannabis|associação brasileira|associação nacional/i.test(bula.manufacturer))
                    ? 'Associação Acaflor'
                    : (bula.manufacturer || 'Associação Nacional');

              const customProd: CBDProduct = {
                name: cleanName,
                manufacturer: inferredManufacturer,
                origin: bula.origin || 'Nacional',
                type: bula.type || 'Óleo Full Spectrum',
                activeIngredients: bula.activeIngredients || bula.concentration || 'Fitocanabinoides Full Spectrum',
                concentration: bula.concentration || bula.activeIngredients || 'Concentração Padronizada',
                pharmaceuticalForm: bula.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
                quantity: bula.quantity || '01 Frasco de 30 mL',
                administrationRoute: bula.administrationRoute || 'Via Sublingual / Oral',
                usageInstructions: bula.posologyDetails || bula.usageInstructions || '',
                posologyDetails: bula.posologyDetails || bula.usageInstructions || '',
                indications: bula.indications || 'Dor Crônica, Ansiedade, Insônia',
                description: bula.description || `Medicamento cadastrado pelo médico (${inferredManufacturer}).`,
                priceBRL: bula.priceBRL ? Number(String(bula.priceBRL).replace(/[^0-9.]/g, '')) : undefined,
                priceUSD: bula.priceUSD ? Number(String(bula.priceUSD).replace(/[^0-9.]/g, '')) : undefined,
                details: [
                  bula.concentration || bula.activeIngredients,
                  bula.pharmaceuticalForm,
                  bula.quantity,
                  inferredManufacturer
                ].filter(Boolean) as string[]
              };
              const targetCatId = getBestCategoryIdForProduct(customProd.origin, customProd.manufacturer, customProd.name);
              upsertProductInCategory(targetCatId, customProd);
            }
          } catch {
            // ignore malformed entry
          }
        }
      }

      // Helper to convert a prescription item from programmed profiles or saved prescriptions into a catalog product if custom
      const ingestPrescriptionItemIfCustom = (item: any, profileTitleHint?: string) => {
        if (!item || !item.name || typeof item.name !== 'string') return;
        const cleanName = item.name.trim();
        if (!cleanName) return;

        const isBase = baseProductNames.has(cleanName.toLowerCase());
        const rawBrand = (item.brand || item.manufacturer || '').trim();
        const combinedText = `${cleanName} ${rawBrand} ${profileTitleHint || ''}`.toLowerCase();

        const isSantaGaia = combinedText.includes('santa gaia') || combinedText.includes('santagaia');
        const isAcaflor = combinedText.includes('acaflor') || combinedText.includes('açaflor');
        const hasCustomBrand =
          rawBrand &&
          !/^(associação nacional|associação brasileira|associação brasileira \(nacional\)|associação nacional \(brasil\))$/i.test(rawBrand);

        if (!isBase || isSantaGaia || isAcaflor || hasCustomBrand) {
          const resolvedBrand = isSantaGaia
            ? 'Associação Santa Gaia'
            : isAcaflor
              ? 'Associação Acaflor'
              : (rawBrand || 'Associação Nacional');
          const resolvedOrigin = item.origin || (isSantaGaia || isAcaflor ? 'Nacional' : 'Nacional');
          const dosageStr = Array.isArray(item.dosage) ? item.dosage.join('\n') : (item.dosage || '');

          const prodFromItem: CBDProduct = {
            name: cleanName,
            manufacturer: resolvedBrand,
            origin: resolvedOrigin,
            type: item.type || item.pharmaceuticalForm || 'Óleo Full Spectrum',
            activeIngredients: item.activeIngredients || 'Fitocanabinoides Full Spectrum',
            concentration: item.concentration || '',
            pharmaceuticalForm: item.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
            quantity: item.quantity || '01 Frasco de 30 mL',
            administrationRoute: item.administrationRoute || 'Via Sublingual / Oral',
            usageInstructions: dosageStr,
            posologyDetails: dosageStr,
            description: item.description || `Medicamento salvo pelo médico (${resolvedBrand}).`,
            priceBRL: item.priceBRL,
            priceUSD: item.priceUSD,
            details: [
              item.concentration,
              item.pharmaceuticalForm,
              item.quantity,
              resolvedBrand
            ].filter(Boolean) as string[]
          };

          const targetCatId = getBestCategoryIdForProduct(resolvedOrigin, resolvedBrand, cleanName);
          upsertProductInCategory(targetCatId, prodFromItem);
        }
      };

      // C. Recover from `mecura_programmed_prescriptions` and `mecura_doctor_custom_prescription_model`
      const rawProfiles = localStorage.getItem('mecura_programmed_prescriptions');
      if (rawProfiles) {
        const profiles = JSON.parse(rawProfiles);
        if (Array.isArray(profiles)) {
          profiles.forEach((prof: any) => {
            if (prof && Array.isArray(prof.items)) {
              prof.items.forEach((it: any) => ingestPrescriptionItemIfCustom(it, prof.name));
            }
          });
        }
      }

      const rawDoctorModel = localStorage.getItem('mecura_doctor_custom_prescription_model');
      if (rawDoctorModel) {
        const docModel = JSON.parse(rawDoctorModel);
        if (docModel && Array.isArray(docModel.items)) {
          docModel.items.forEach((it: any) => ingestPrescriptionItemIfCustom(it, docModel.name));
        }
      }

      // D. Recover from `mecura_saved_prescriptions_v2`
      const rawSavedPrescs = localStorage.getItem('mecura_saved_prescriptions_v2');
      if (rawSavedPrescs) {
        const savedPrescs = JSON.parse(rawSavedPrescs);
        if (savedPrescs && typeof savedPrescs === 'object') {
          Object.values(savedPrescs).forEach((presc: any) => {
            if (presc && Array.isArray(presc.items)) {
              presc.items.forEach((it: any) => ingestPrescriptionItemIfCustom(it));
            }
          });
        }
      }
    } catch {
      // ignore localStorage read errors
    }
  }

  // 4. Guarantee all Pangaia, SouCannabis, Santa Gaia, and Acaflor products are fully present
  const ensureOfficialProducts = (catId: string, officialList: CBDProduct[]) => {
    const cat = categoryMap.get(catId);
    if (!cat) return;
    const existingNames = new Set(cat.products.map(p => (p.name || '').trim().toLowerCase()));
    officialList.forEach(baseProd => {
      const bName = baseProd.name.trim().toLowerCase();
      if (!existingNames.has(bName)) {
        cat.products.push({ ...baseProd });
        existingNames.add(bName);
      } else {
        const pIdx = cat.products.findIndex(p => (p.name || '').trim().toLowerCase() === bName);
        if (pIdx !== -1) {
          cat.products[pIdx] = {
            ...baseProd,
            ...cat.products[pIdx],
            priceBRL: cat.products[pIdx].priceBRL ?? baseProd.priceBRL,
            priceUSD: cat.products[pIdx].priceUSD ?? baseProd.priceUSD
          };
        }
      }
    });
  };

  ensureOfficialProducts('pangaia_oficial', PANGAIA_PRODUCTS);
  ensureOfficialProducts('soucannabis_oficial', SOUCANNABIS_PRODUCTS);
  ensureOfficialProducts('santa_gaia_oficial', SANTA_GAIA_PRODUCTS);
  ensureOfficialProducts('acaflor_oficial', ACAFLOR_PRODUCTS);

  // 5. Filter out all categories and products deleted by the doctor
  const deletedCategoriesSet = getDeletedCategoryIds();
  const deletedSet = getDeletedProductNames();
  categoryMap.forEach((cat, key) => {
    if (deletedCategoriesSet.has(key)) {
      categoryMap.delete(key);
      return;
    }
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
    sessionRestoredProductNames.add(clean);
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
 * Returns a Set of category IDs (brand tabs) that the doctor deleted
 */
export function getDeletedCategoryIds(): Set<string> {
  const set = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mecura_deleted_categories');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((item: string) => {
            if (typeof item === 'string' && item.trim()) {
              set.add(item.trim());
            }
          });
        }
      }
    } catch (e) {
      console.warn("Error reading deleted categories:", e);
    }
  }
  return set;
}

/**
 * Marks an entire category / brand tab as deleted in localStorage and Firestore
 */
export function markCategoryAsDeleted(categoryId: string, productNamesToAlsoDelete?: string[]): void {
  if (typeof window === 'undefined' || !categoryId) return;
  try {
    const cleanId = categoryId.trim();
    sessionRestoredCategoryIds.delete(cleanId);
    const existingCats = getDeletedCategoryIds();
    existingCats.add(cleanId);
    const catArr = Array.from(existingCats);
    localStorage.setItem('mecura_deleted_categories', JSON.stringify(catArr));

    // If custom brand tab or product names provided for custom brand, also mark custom products as deleted
    if (cleanId.startsWith('brand_') && Array.isArray(productNamesToAlsoDelete) && productNamesToAlsoDelete.length > 0) {
      const existingProds = getDeletedProductNames();
      productNamesToAlsoDelete.forEach(pName => {
        if (pName && pName.trim()) {
          const cleanP = pName.trim().toLowerCase();
          existingProds.add(cleanP);
          const storageKey = `mecura_bula_custom_${cleanP.replace(/[^a-z0-9]/g, '_')}`;
          localStorage.removeItem(storageKey);
        }
      });
      localStorage.setItem('mecura_deleted_products', JSON.stringify(Array.from(existingProds)));
    }

    const docRef = doc(db, 'settings', 'productCatalog');
    setDoc(docRef, {
      deletedCategoryIds: catArr,
      deletedProductNames: Array.from(getDeletedProductNames()),
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(console.warn);

    window.dispatchEvent(new Event('mecura_bula_updated'));
  } catch (e) {
    console.warn("Error marking category as deleted:", e);
  }
}

/**
 * Unmarks a category / brand tab as deleted (e.g. when the doctor recreates the tab or adds a product to it)
 */
export function unmarkCategoryAsDeleted(categoryId: string): void {
  if (typeof window === 'undefined' || !categoryId) return;
  try {
    const cleanId = categoryId.trim();
    sessionRestoredCategoryIds.add(cleanId);
    const existingCats = getDeletedCategoryIds();
    if (!existingCats.has(cleanId)) return;
    existingCats.delete(cleanId);
    const catArr = Array.from(existingCats);
    localStorage.setItem('mecura_deleted_categories', JSON.stringify(catArr));

    const docRef = doc(db, 'settings', 'productCatalog');
    setDoc(docRef, {
      deletedCategoryIds: catArr,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(console.warn);
  } catch (e) {
    console.warn("Error unmarking category as deleted:", e);
  }
}

/**
 * Restores all deleted brand tabs
 */
export function restoreAllDeletedCategories(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('mecura_deleted_categories', JSON.stringify([]));
    const docRef = doc(db, 'settings', 'productCatalog');
    setDoc(docRef, {
      deletedCategoryIds: [],
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(console.warn);
    window.dispatchEvent(new Event('mecura_bula_updated'));
  } catch (e) {
    console.warn("Error restoring deleted categories:", e);
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
 * Compacts a product object by removing duplicate fields so Firestore documents stay well under 1 MiB
 */
export function compactProductForStorage(p: CBDProduct): any {
  const copy: any = { ...p };
  if (copy.usageInstructions && copy.posologyDetails && copy.usageInstructions === copy.posologyDetails) {
    delete copy.usageInstructions;
  }
  delete copy.details;
  Object.keys(copy).forEach(k => {
    if (copy[k] === undefined || copy[k] === '') {
      delete copy[k];
    }
  });
  return copy;
}

/**
 * Compacts categories before persisting to Firestore or localStorage to stay well below the 1 MiB Firestore limit
 */
export function compactCategoriesForStorage(categories: CBDCategory[]): CBDCategory[] {
  const diseaseCatIds = new Set([
    'ansiedade',
    'dor_cronica',
    'insonia',
    'energia_foco',
    'saude_mulher',
    'gastro',
    'neurodegenerativas',
    'epilepsia',
    'autismo',
    'dermatologia',
    'vicios',
    'oncologia',
    'concentrados',
    'bem_estar',
    'associacoes-nacionais'
  ]);

  return categories.map(cat => {
    let prods = Array.isArray(cat.products) ? cat.products : [];
    if (cat.id === 'associacoes_nacionais') {
      // Do not duplicate products that belong to their own official brand tab inside associacoes_nacionais
      prods = prods.filter(p => {
        if (!p || !p.name) return false;
        const bestId = getBestCategoryIdForProduct(p.origin, p.manufacturer, p.name);
        return bestId === 'associacoes_nacionais' || !isCustomAddedProduct(p);
      });
    } else if (diseaseCatIds.has(cat.id)) {
      // For clinical disease categories, only store custom/modified products in cloud storage (base products come from cbdGuideData)
      prods = prods.filter(p => isCustomAddedProduct(p));
    }

    return {
      id: cat.id,
      title: cat.title,
      description: cat.description,
      indicationsList: cat.indicationsList,
      dosageGuidance: cat.dosageGuidance,
      products: prods.map(compactProductForStorage)
    };
  });
}

/**
 * Saves product categories to Firestore so any client (Doctor, Admin, Patient) sees newly added medications
 */
export async function syncCatalogToFirestore(categories: CBDCategory[]): Promise<void> {
  try {
    const deletedSet = getDeletedProductNames();
    const customMap = new Map<string, any>();

    // Preserve any existing cloud customProducts that aren't deleted
    cachedCloudCustomProducts.forEach(p => {
      if (!p || !p.name) return;
      const key = p.name.trim().toLowerCase();
      if (!deletedSet.has(key)) {
        customMap.set(key, compactProductForStorage({ ...p, isCustom: true } as any));
      }
    });

    // Collect all custom/modified products from current categories
    categories.forEach(c => {
      (c.products || []).forEach(p => {
        if (!p || !p.name) return;
        const key = p.name.trim().toLowerCase();
        if (!deletedSet.has(key) && isCustomAddedProduct(p)) {
          customMap.set(key, compactProductForStorage({ ...p, isCustom: true } as any));
        }
      });
    });

    const customProds = Array.from(customMap.values());
    cachedCloudCustomProducts = customProds;

    // 1. Save custom products backup to localStorage so doctor-added products never disappear
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mecura_custom_catalog_v2', JSON.stringify(customProds));
      } catch {
        // ignore localStorage quota errors
      }
    }

    // 2. Compact categories and sanitize `undefined` values so Firestore document stays ~200 KB (< 1 MiB limit)
    const compactedCategories = compactCategoriesForStorage(categories);
    const sanitizedCategories = JSON.parse(JSON.stringify(compactedCategories));
    const sanitizedCustomProds = JSON.parse(JSON.stringify(customProds));
    cachedCloudCategories = sanitizedCategories;

    const docRef = doc(db, 'settings', 'productCatalog');
    const deletedList = Array.from(deletedSet);
    const deletedCatsList = Array.from(getDeletedCategoryIds());
    await setDoc(docRef, {
      categories: sanitizedCategories,
      customProducts: sanitizedCustomProds,
      deletedProductNames: deletedList,
      deletedCategoryIds: deletedCatsList,
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
                const clean = name.trim().toLowerCase();
                if (!sessionRestoredProductNames.has(clean)) {
                  currentDeleted.add(clean);
                }
              }
            });
            localStorage.setItem('mecura_deleted_products', JSON.stringify(Array.from(currentDeleted)));
          } catch (e) {
            console.warn("Error updating local deleted products from firestore:", e);
          }
        }
        if (data && Array.isArray(data.deletedCategoryIds)) {
          try {
            const filteredCats = data.deletedCategoryIds.filter(
              (id: string) => typeof id === 'string' && !sessionRestoredCategoryIds.has(id.trim())
            );
            localStorage.setItem('mecura_deleted_categories', JSON.stringify(filteredCats));
          } catch (e) {
            console.warn("Error updating local deleted categories from firestore:", e);
          }
        }
        if (data && Array.isArray(data.customProducts)) {
          cachedCloudCustomProducts = data.customProducts;
          try {
            const localRaw = localStorage.getItem('mecura_custom_catalog_v2');
            const localArr = localRaw ? JSON.parse(localRaw) : [];
            const unionMap = new Map<string, any>();
            if (Array.isArray(localArr)) {
              localArr.forEach((p: any) => {
                if (p?.name) unionMap.set(p.name.trim().toLowerCase(), p);
              });
            }
            data.customProducts.forEach((p: any) => {
              if (p?.name) unionMap.set(p.name.trim().toLowerCase(), p);
            });
            localStorage.setItem('mecura_custom_catalog_v2', JSON.stringify(Array.from(unionMap.values())));
          } catch {}
        }
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          cachedCloudCategories = data.categories;
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
export function getBestCategoryIdForProduct(origin?: string, manufacturer?: string, productName?: string): string {
  const cleanM = (manufacturer || '').toLowerCase().trim();
  const cleanP = (productName || '').toLowerCase().trim();
  const combined = `${cleanM} ${cleanP}`;

  if (combined.includes('santa gaia') || combined.includes('santagaia') || combined.includes('santa_gaia')) return 'santa_gaia_oficial';
  if (combined.includes('acaflor') || combined.includes('açaflor')) return 'acaflor_oficial';
  if (combined.includes('ascamed')) return 'brand_ascamed_associacao';
  if (combined.includes('sequoia') && !cleanM.includes('soucannabis')) return 'brand_sequoia_nacional';

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
    cleanM === 'nacional' ||
    cleanM === 'associação' ||
    cleanM === 'associacao' ||
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
  const deletedCategoriesSet = getDeletedCategoryIds();
  const catById = new Map<string, CBDCategory>();
  categories.forEach(c => catById.set(c.id, c));

  const allOfficialTabs: BrandTabItem[] = [
    {
      categoryId: 'santa_gaia_oficial',
      brandName: 'Santa Gaia',
      badge: 'Associação Nacional',
      emoji: '🌱',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('santa_gaia_oficial')?.products.length || 0,
      theme: 'emerald'
    },
    {
      categoryId: 'acaflor_oficial',
      brandName: 'Acaflor',
      badge: 'Associação Nacional',
      emoji: '🌿',
      origin: 'Nacional',
      isCustomBrand: false,
      productCount: catById.get('acaflor_oficial')?.products.length || 0,
      theme: 'emerald'
    },
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
  const officialTabs = allOfficialTabs.filter(tab => !deletedCategoriesSet.has(tab.categoryId));

  const customTabs: BrandTabItem[] = [];
  categories.forEach(cat => {
    if (cat.id.startsWith('brand_') && !deletedCategoriesSet.has(cat.id)) {
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
  nationalCode?: 'soucannabis' | 'abrace' | 'abecmed' | 'santa_gaia' | 'acaflor' | 'all';
  importedCode?: 'pangaia' | 'flowermed' | 'greenbudz' | 'all';
  productCount: number;
}

/**
 * Returns the official curated Associations (Nacionais) and Imported Companies (Importadas)
 * plus any custom brands registered by the doctor.
 */
export function getRegisteredManufacturers(categories: CBDCategory[] = []): RegisteredManufacturerInfo[] {
  const baseList: RegisteredManufacturerInfo[] = [
    // Associações Brasileiras (Nacionais)
    {
      id: 'santa_gaia',
      name: 'Associação Santa Gaia',
      shortName: 'Santa Gaia',
      origin: 'Nacional',
      badgeText: 'Associação Nacional • Fitoterapia Integral',
      description: 'Óleos Full Spectrum artesanais padronizados (Rico em CBD 50/100mg/mL, Equilibrado 1:1, Rico em THC) e Pomada Terapêutica.',
      highlights: ['Full Spectrum', 'Óleos 1:1 & CBD', 'Pomada Tópica'],
      nationalCode: 'santa_gaia',
      productCount: categories.find(c => c.id === 'santa_gaia_oficial')?.products.length || 6
    },
    {
      id: 'acaflor',
      name: 'Associação Acaflor',
      shortName: 'Acaflor',
      origin: 'Nacional',
      badgeText: 'Associação Nacional • Acaflor PB/Brasil',
      description: 'Óleos Full Spectrum padronizados (CBD 30/50/100mg/mL, Equilibrado 1:1, THC), Pomada Canábica e Inflorescências Associativas.',
      highlights: ['Acaflor Oficial', 'Óleos & Pomadas', 'Inflorescências'],
      nationalCode: 'acaflor',
      productCount: categories.find(c => c.id === 'acaflor_oficial')?.products.length || 7
    },
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




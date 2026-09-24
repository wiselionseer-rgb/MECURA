import { CBDCategory, CBDProduct, cbdGuideData } from '../data/cbdGuide';
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
              target.products.push({ ...p });
              targetProductNames.add(cleanName);
            } else {
              // Update existing product with newer properties
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

  return Array.from(categoryMap.values());
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
    await setDoc(docRef, {
      categories,
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

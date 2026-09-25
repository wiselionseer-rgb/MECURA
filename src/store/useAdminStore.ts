import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mergeProductCatalogs, syncCatalogToFirestore } from '../utils/productCatalog';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';

export interface Doctor {
  id: string;
  name: string;
  crm: string;
  password?: string;
  email: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  active: boolean;
  quantity?: number;
  usedCount?: number;
  usedBy?: string[];
  ownerId?: string; // ID of the patient who owns this referral coupon
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
}

interface AdminState {
  doctors: Doctor[];
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;

  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  useCoupon: (id: string, userId: string, userEmail?: string) => Promise<void>;

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;

  promotionsText: string;
  setPromotionsText: (text: string) => void;
  catalogUrl: string;
  catalogUrlNacional: string;
  setCatalogUrl: (url: string) => void;
  setCatalogUrlNacional: (url: string) => void;
  productCategories: CBDCategory[];
  setProductCategories: (categories: CBDCategory[]) => void;
  addProduct: (categoryId: string, product: CBDProduct) => void;
  updateProduct: (categoryId: string, productName: string, product: Partial<CBDProduct>) => void;
  deleteProduct: (categoryId: string, productName: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      doctors: [
        {
          id: '1',
          name: 'Dr. Guilherme Taveira Dias',
          crm: '12345/SP',
          email: 'guilherme@mecura.com',
          password: '123' // Default password for testing
        }
      ],
      addDoctor: (doctor) => set((state) => ({ doctors: [...state.doctors, doctor] })),
      updateDoctor: (id, data) => set((state) => ({
        doctors: state.doctors.map((d) => (d.id === id ? { ...d, ...data } : d))
      })),
      deleteDoctor: (id) => set((state) => ({
        doctors: state.doctors.filter((d) => d.id !== id)
      })),

      coupons: [],
      addCoupon: async (coupon) => {
        set((state) => ({ coupons: [...state.coupons.filter(c => c.id !== coupon.id), coupon] }));
        try {
          await setDoc(doc(db, 'coupons', coupon.id), coupon, { merge: true });
        } catch (e) {
          console.warn("Erro ao salvar cupom no Firestore:", e);
        }
      },
      updateCoupon: async (id, data) => {
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c))
        }));
        try {
          await updateDoc(doc(db, 'coupons', id), data);
        } catch (e) {
          console.warn("Erro ao atualizar cupom no Firestore:", e);
        }
      },
      deleteCoupon: async (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id)
        }));
        try {
          await deleteDoc(doc(db, 'coupons', id));
        } catch (e) {
          console.warn("Erro ao excluir cupom no Firestore:", e);
        }
      },
      useCoupon: async (id, userId, userEmail) => {
        const identifiers = [userId, userEmail].filter(Boolean) as string[];
        set((state) => ({
          coupons: state.coupons.map((c) => {
            if (c.id === id) {
              const currentUsedBy = c.usedBy || [];
              const newUsedBy = Array.from(new Set([...currentUsedBy, ...identifiers]));
              return { 
                ...c, 
                usedCount: (c.usedCount || 0) + 1, 
                usedBy: newUsedBy 
              };
            }
            return c;
          })
        }));

        try {
          await setDoc(doc(db, 'coupons', id), {
            usedCount: increment(1),
            usedBy: arrayUnion(...identifiers)
          }, { merge: true });
        } catch (e) {
          console.warn("Erro ao registrar uso do cupom no Firestore:", e);
        }
      },

      notifications: [],
      addNotification: (notification) => set((state) => {
        if (state.notifications.some(n => n.id === notification.id)) return state;
        return { notifications: [...state.notifications, notification] };
      }),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      promotionsText: '🔥 PROMOÇÕES ATIVAS 🔥\n\n• Drops Day&Night: 15% OFF (NIGHTSHADE + FORMULA ONE).\n• Combo para Dormir bem: Compre 2x óleos Deep Vibe e ganhe uma NIGHTSHADE.\n• Combo para ser Produtivo: Compre 2x óleos Super Vibe e ganhe uma FORMULA ONE.\n• Linha vibe na sua rotina: 15% OFF no combo SUPER e DEEP vibe.\n• Foco mental com THCV: 15% OFF no SLIM VIBE.\n• Formula de 40 Servings: Leve outra de 10 Servings com 50% OFF.\n• 2x Formulas da mesma Strain: Leve a segunda com 20% OFF (10 ou 40 Servings).\n• 2x Dried Formula da Strain BM: De 40 servings, leve a segunda com 30% OFF.',
      setPromotionsText: (text) => set({ promotionsText: text }),
      catalogUrl: 'https://drive.google.com/file/d/1X5dDlzrVQ5bENVFd8He96OB-TT39gA8Z/preview',
      catalogUrlNacional: 'https://drive.google.com/file/d/1RkfK1c76aaiyLnSeVxSsFif8WAEi3aU_/preview',
      setCatalogUrl: (url) => set({ catalogUrl: url }),
      setCatalogUrlNacional: (url) => set({ catalogUrlNacional: url }),
      productCategories: cbdGuideData,
      setProductCategories: (categories) => {
        const merged = mergeProductCatalogs(cbdGuideData, categories);
        set({ productCategories: merged });
        syncCatalogToFirestore(merged);
      },
      addProduct: (categoryId, product) => {
        set((state) => {
          let updated = state.productCategories.map(c => 
            c.id === categoryId ? { ...c, products: [...c.products, product] } : c
          );
          // If category was not found in state, add product to first category or create one
          if (!updated.some(c => c.id === categoryId)) {
            if (updated.length > 0) {
              updated[0] = { ...updated[0], products: [...updated[0].products, product] };
            }
          }
          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
      updateProduct: (categoryId, productName, productData) => {
        set((state) => {
          const updated = state.productCategories.map(c => 
            c.id === categoryId ? { 
              ...c, 
              products: c.products.map(p => p.name === productName ? { ...p, ...productData } : p) 
            } : c
          );
          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
      deleteProduct: (categoryId, productName) => {
        set((state) => {
          const updated = state.productCategories.map(c => 
            c.id === categoryId ? { 
              ...c, 
              products: c.products.filter(p => p.name !== productName) 
            } : c
          );
          syncCatalogToFirestore(updated);
          return { productCategories: updated };
        });
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);

// Realtime Firestore synchronization for Coupons across all users and devices
if (typeof window !== 'undefined') {
  try {
    let initialized = false;
    onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const cloudCoupons: Coupon[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        cloudCoupons.push({
          id: docSnap.id,
          code: data.code || docSnap.id,
          discount: Number(data.discount) || 0,
          discountType: data.discountType || 'percentage',
          active: data.active !== undefined ? data.active : true,
          quantity: data.quantity !== undefined ? Number(data.quantity) : 0,
          usedCount: Number(data.usedCount) || 0,
          usedBy: Array.isArray(data.usedBy) ? data.usedBy : [],
          ownerId: data.ownerId || undefined,
        });
      });

      const currentLocal = useAdminStore.getState().coupons;

      if (cloudCoupons.length > 0) {
        useAdminStore.setState({ coupons: cloudCoupons });
      } else if (!initialized && currentLocal.length > 0) {
        // First run seed: upload existing local coupons to Firestore
        currentLocal.forEach(c => {
          setDoc(doc(db, 'coupons', c.id), c, { merge: true }).catch(console.error);
        });
      }
      initialized = true;
    }, (error) => {
      console.warn("Coupons firestore listener warning:", error);
    });
  } catch (err) {
    console.warn("Failed to attach coupons listener:", err);
  }
}

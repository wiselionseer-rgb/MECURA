import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mergeProductCatalogs, syncCatalogToFirestore, subscribeToFirestoreCatalog, markProductAsDeleted, unmarkProductAsDeleted, markCategoryAsDeleted, unmarkCategoryAsDeleted, restoreAllDeletedCategories, buildCustomBrandCategory, getBestCategoryIdForProduct, compactCategoriesForStorage } from '../utils/productCatalog';
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

export interface CouponUsageLog {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  userCpf?: string;
  planName?: string;
  planKey?: string;
  price?: number;
  originalPrice?: number;
  discountApplied?: number;
  commissionPercentage?: number;
  commissionValue?: number;
  commissionPaid?: boolean;
  viaLink?: boolean;
  paymentId?: string;
  usedAt?: string;
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
  usageLogs?: CouponUsageLog[];
  ownerId?: string; // ID of the patient who owns this referral coupon
  affiliateName?: string; // Nome do responsável / parceiro do cupom e link
  affiliatePixOrPhone?: string; // WhatsApp ou Chave PIX do responsável
  commissionPercentage?: number; // % de comissão para o responsável sobre o valor pago
  linkClicks?: number; // Quantidade de acessos via link rastreável
  targetPlan?: 'all' | 'basic' | 'premium' | 'complete' | 'psychologist';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface PharmacyOrderItem {
  id: string;
  name: string;
  brand: string;
  origin: 'Nacional' | 'Importado' | string;
  type?: string;
  activeIngredients?: string;
  concentration?: string;
  pharmaceuticalForm?: string;
  quantitySpec?: string;
  administrationRoute?: string;
  dosage: string[];
  unitQuantity: number;
  unitPriceBRL: number;
  priceUSD?: number;
  image?: string;
  prescribedByDoctor?: boolean;
}

export interface PharmacyPreparedOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientCpf?: string;
  patientPhone?: string;
  doctorName?: string;
  doctorCrm?: string;
  items: PharmacyOrderItem[];
  subtotalBRL: number;
  shippingBRL: number;
  discountBRL: number;
  totalBRL: number;
  showPricesToPatient?: boolean;
  notes?: string;
  whatsappNumber?: string;
  status: 'draft' | 'approved' | 'requested' | 'completed';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  requestedAt?: string;
  deliveryAddress?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
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
  incrementCouponLinkClick: (code: string) => Promise<void>;
  toggleCouponCommissionPaid: (couponId: string, logIndex: number) => Promise<void>;
  useCoupon: (
    id: string, 
    userId: string, 
    userEmail?: string, 
    planDetails?: {
      planName?: string;
      planKey?: string;
      price?: number;
      originalPrice?: number;
      discountApplied?: number;
      isPremium?: boolean;
      userName?: string;
      userPhone?: string;
      userCpf?: string;
      viaLink?: boolean;
      paymentId?: string;
    }
  ) => Promise<void>;

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;

  pharmacyOrders: PharmacyPreparedOrder[];
  savePharmacyOrder: (order: PharmacyPreparedOrder) => Promise<void>;
  updatePharmacyOrderStatus: (orderId: string, status: PharmacyPreparedOrder['status'], extra?: Partial<PharmacyPreparedOrder>) => Promise<void>;
  deletePharmacyOrder: (orderId: string) => Promise<void>;

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
  deleteCategory: (categoryId: string) => void;
  restoreDeletedCategories: () => void;
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
          password: 'jesus102030@'
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
        const cleanData: Record<string, any> = {};
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined) cleanData[k] = v;
        });
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...cleanData } : c))
        }));
        try {
          await setDoc(doc(db, 'coupons', id), cleanData, { merge: true });
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
      incrementCouponLinkClick: async (code) => {
        const cleanCode = (code || '').trim().toUpperCase();
        if (!cleanCode) return;
        const currentCoupons = useAdminStore.getState().coupons;
        const target = currentCoupons.find(
          c => c.code.trim().toUpperCase() === cleanCode || c.id.trim().toUpperCase() === cleanCode
        );
        if (!target) return;

        set((state) => ({
          coupons: state.coupons.map(c =>
            c.id === target.id ? { ...c, linkClicks: (c.linkClicks || 0) + 1 } : c
          )
        }));

        try {
          await setDoc(doc(db, 'coupons', target.id), {
            linkClicks: increment(1),
            lastLinkClickAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Erro ao incrementar clique do link de cupom:", e);
        }
      },
      toggleCouponCommissionPaid: async (couponId, logIndex) => {
        const currentCoupons = useAdminStore.getState().coupons;
        const target = currentCoupons.find(c => c.id === couponId);
        if (!target || !Array.isArray(target.usageLogs) || !target.usageLogs[logIndex]) return;

        const updatedLogs = target.usageLogs.map((log, idx) =>
          idx === logIndex ? { ...log, commissionPaid: !log.commissionPaid } : log
        );

        set((state) => ({
          coupons: state.coupons.map(c =>
            c.id === couponId ? { ...c, usageLogs: updatedLogs } : c
          )
        }));

        try {
          await setDoc(doc(db, 'coupons', couponId), {
            usageLogs: updatedLogs
          }, { merge: true });
        } catch (e) {
          console.warn("Erro ao atualizar status de comissão:", e);
        }
      },
      useCoupon: async (id, userId, userEmail, planDetails) => {
        const primaryIdent = (userEmail && userEmail.trim().includes('@')) ? userEmail.trim() : (userId || ('paciente_' + Date.now().toString(36)));

        const currentCoupons = useAdminStore.getState().coupons;
        const target = currentCoupons.find(
          c => c.id === id || c.code.trim().toUpperCase() === id.trim().toUpperCase()
        );
        const resolvedId = target?.id || id;
        const resolvedCode = target?.code || id.toUpperCase();

        // Check if this exact paymentId was already logged on this coupon to prevent duplicates
        if (planDetails?.paymentId && target?.usageLogs?.some(l => l.paymentId && String(l.paymentId) === String(planDetails.paymentId))) {
          return;
        }

        const paidPrice = planDetails?.price !== undefined ? Number(planDetails.price) : (planDetails?.isPremium ? 249.90 : 49.90);
        const commPct = Number(target?.commissionPercentage || 0);
        const commVal = commPct > 0 ? Number(((paidPrice * commPct) / 100).toFixed(2)) : 0;
        const viaLinkFlag = planDetails?.viaLink !== undefined
          ? Boolean(planDetails.viaLink)
          : (typeof window !== 'undefined' && (
              localStorage.getItem('mecura_referral_via_link') === 'true' &&
              (localStorage.getItem('mecura_referral_coupon_code') || '').trim().toUpperCase() === resolvedCode.trim().toUpperCase()
            ));

        const newLog: CouponUsageLog = {
          ...(userId ? { userId } : {}),
          ...(userEmail ? { userEmail } : {}),
          ...(planDetails?.userName ? { userName: planDetails.userName } : {}),
          ...(planDetails?.userPhone ? { userPhone: planDetails.userPhone } : {}),
          ...(planDetails?.userCpf ? { userCpf: planDetails.userCpf } : {}),
          planName: planDetails?.planName || (planDetails?.isPremium ? 'Premium' : 'Essencial'),
          ...(planDetails?.planKey ? { planKey: planDetails.planKey } : {}),
          price: paidPrice,
          ...(planDetails?.originalPrice !== undefined ? { originalPrice: Number(planDetails.originalPrice) } : {}),
          ...(planDetails?.discountApplied !== undefined ? { discountApplied: Number(planDetails.discountApplied) } : {}),
          commissionPercentage: commPct,
          commissionValue: commVal,
          commissionPaid: false,
          viaLink: viaLinkFlag,
          ...(planDetails?.paymentId ? { paymentId: String(planDetails.paymentId) } : {}),
          usedAt: new Date().toISOString()
        };

        set((state) => ({
          coupons: state.coupons.map((c) => {
            if (c.id === resolvedId || c.code.trim().toUpperCase() === resolvedCode.trim().toUpperCase()) {
              const currentUsedBy = c.usedBy || [];
              const currentLogs = c.usageLogs || [];
              const newUsedBy = Array.from(new Set([...currentUsedBy, primaryIdent]));
              return { 
                ...c, 
                usedCount: (c.usedCount || 0) + 1, 
                usedBy: newUsedBy,
                usageLogs: [...currentLogs, newLog]
              };
            }
            return c;
          })
        }));

        try {
          await setDoc(doc(db, 'coupons', resolvedId), {
            code: resolvedCode,
            usedCount: increment(1),
            usedBy: arrayUnion(primaryIdent),
            usageLogs: arrayUnion(newLog),
            lastUsedAt: new Date().toISOString()
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

      pharmacyOrders: [],
      savePharmacyOrder: async (order) => {
        const cleanOrder: PharmacyPreparedOrder = {
          ...order,
          updatedAt: new Date().toISOString()
        };
        set((state) => {
          const filtered = (state.pharmacyOrders || []).filter(
            o => o.id !== cleanOrder.id && o.patientId !== cleanOrder.patientId
          );
          return { pharmacyOrders: [cleanOrder, ...filtered] };
        });

        try {
          await setDoc(doc(db, 'pharmacy_orders', cleanOrder.id), cleanOrder, { merge: true });
          if (cleanOrder.patientId) {
            await setDoc(doc(db, 'users', cleanOrder.patientId), {
              approvedPharmacyOrder: cleanOrder,
              hasApprovedPharmacyOrder: cleanOrder.status === 'approved' || cleanOrder.status === 'requested',
              lastUpdated: new Date().toISOString()
            }, { merge: true }).catch(() => {});

            await setDoc(doc(db, 'queue', cleanOrder.patientId), {
              approvedPharmacyOrder: cleanOrder,
              lastUpdated: new Date().toISOString()
            }, { merge: true }).catch(() => {});

            await setDoc(doc(db, 'active_consultations', cleanOrder.patientId), {
              approvedPharmacyOrder: cleanOrder,
              lastUpdated: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          }
        } catch (e) {
          console.warn("Erro ao salvar pedido de farmácia no Firestore:", e);
        }
      },
      updatePharmacyOrderStatus: async (orderId, status, extra) => {
        const nowIso = new Date().toISOString();
        let targetOrder: PharmacyPreparedOrder | null = null;

        set((state) => {
          const updated = (state.pharmacyOrders || []).map((o) => {
            if (o.id === orderId || o.patientId === orderId) {
              const merged: PharmacyPreparedOrder = {
                ...o,
                ...(extra || {}),
                status,
                updatedAt: nowIso,
                ...(status === 'approved' ? { approvedAt: nowIso } : {}),
                ...(status === 'requested' ? { requestedAt: nowIso } : {})
              };
              targetOrder = merged;
              return merged;
            }
            return o;
          });
          return { pharmacyOrders: updated };
        });

        try {
          const resolvedId = targetOrder ? (targetOrder as PharmacyPreparedOrder).id : orderId;
          const payload = {
            ...(extra || {}),
            status,
            updatedAt: nowIso,
            ...(status === 'approved' ? { approvedAt: nowIso } : {}),
            ...(status === 'requested' ? { requestedAt: nowIso } : {})
          };
          await setDoc(doc(db, 'pharmacy_orders', resolvedId), payload, { merge: true });
          const pId = (targetOrder as PharmacyPreparedOrder | null)?.patientId || extra?.patientId;
          if (pId && targetOrder) {
            await setDoc(doc(db, 'users', pId), {
              approvedPharmacyOrder: targetOrder,
              hasApprovedPharmacyOrder: status === 'approved' || status === 'requested',
              lastUpdated: nowIso
            }, { merge: true }).catch(() => {});
            await setDoc(doc(db, 'active_consultations', pId), {
              approvedPharmacyOrder: targetOrder,
              lastUpdated: nowIso
            }, { merge: true }).catch(() => {});
          }
        } catch (e) {
          console.warn("Erro ao atualizar status do pedido de farmácia no Firestore:", e);
        }
      },
      deletePharmacyOrder: async (orderId) => {
        const existing = (useAdminStore.getState().pharmacyOrders || []).find(o => o.id === orderId || o.patientId === orderId);
        set((state) => ({
          pharmacyOrders: (state.pharmacyOrders || []).filter(o => o.id !== orderId && o.patientId !== orderId)
        }));
        try {
          await deleteDoc(doc(db, 'pharmacy_orders', orderId)).catch(() => {});
          if (existing?.patientId) {
            await setDoc(doc(db, 'users', existing.patientId), {
              approvedPharmacyOrder: null,
              hasApprovedPharmacyOrder: false
            }, { merge: true }).catch(() => {});
          }
        } catch (e) {
          console.warn("Erro ao excluir pedido de farmácia:", e);
        }
      },

      promotionsText: '🔥 PROMOÇÕES ATIVAS 🔥\n\n• Drops Day&Night: 15% OFF (NIGHTSHADE + FORMULA ONE).\n• Combo para Dormir bem: Compre 2x óleos Deep Vibe e ganhe uma NIGHTSHADE.\n• Combo para ser Produtivo: Compre 2x óleos Super Vibe e ganhe uma FORMULA ONE.\n• Linha vibe na sua rotina: 15% OFF no combo SUPER e DEEP vibe.\n• Foco mental com THCV: 15% OFF no SLIM VIBE.\n• Formula de 40 Servings: Leve outra de 10 Servings com 50% OFF.\n• 2x Formulas da mesma Strain: Leve a segunda com 20% OFF (10 ou 40 Servings).\n• 2x Dried Formula da Strain BM: De 40 servings, leve a segunda com 30% OFF.',
      setPromotionsText: (text) => {
        set({ promotionsText: text });
        if (typeof window !== 'undefined') {
          setDoc(doc(db, 'settings', 'adminSettings'), { promotionsText: text, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);
        }
      },
      catalogUrl: 'https://drive.google.com/file/d/1X5dDlzrVQ5bENVFd8He96OB-TT39gA8Z/preview',
      catalogUrlNacional: 'https://drive.google.com/file/d/1RkfK1c76aaiyLnSeVxSsFif8WAEi3aU_/preview',
      setCatalogUrl: (url) => {
        set({ catalogUrl: url });
        if (typeof window !== 'undefined') {
          setDoc(doc(db, 'settings', 'adminSettings'), { catalogUrl: url, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);
        }
      },
      setCatalogUrlNacional: (url) => {
        set({ catalogUrlNacional: url });
        if (typeof window !== 'undefined') {
          setDoc(doc(db, 'settings', 'adminSettings'), { catalogUrlNacional: url, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);
        }
      },
      productCategories: cbdGuideData,
      setProductCategories: (categories) => {
        const merged = mergeProductCatalogs(cbdGuideData, categories);
        set({ productCategories: merged });
        syncCatalogToFirestore(merged);
      },
      addProduct: (categoryId, product) => {
        const customProduct: CBDProduct = { ...product, isCustom: true } as any;
        unmarkProductAsDeleted(customProduct.name);
        set((state) => {
          const brandCategoryId = getBestCategoryIdForProduct(customProduct.origin, customProduct.manufacturer, customProduct.name);
          const targetCategoryIds = new Set<string>();
          if (brandCategoryId) {
            targetCategoryIds.add(brandCategoryId);
            unmarkCategoryAsDeleted(brandCategoryId);
          }
          if (categoryId && categoryId !== 'all' && categoryId !== 'auto_brand') {
            targetCategoryIds.add(categoryId);
            unmarkCategoryAsDeleted(categoryId);
          }

          let updated = [...state.productCategories];
          const cleanP = (customProduct.name || '').trim().toLowerCase();

          targetCategoryIds.forEach(targetId => {
            const existingIdx = updated.findIndex(c => c.id === targetId);
            if (existingIdx !== -1) {
              const cat = updated[existingIdx];
              const filtered = cat.products.filter(p => (p.name || '').trim().toLowerCase() !== cleanP);
              updated[existingIdx] = { ...cat, products: [customProduct, ...filtered] };
            } else {
              const newCat = buildCustomBrandCategory(
                targetId,
                customProduct.manufacturer || 'Marca Cadastrada',
                customProduct.origin || 'Nacional',
                [customProduct]
              );
              updated = [newCat, ...updated];
            }
          });

          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          if (typeof window !== 'undefined') {
            setTimeout(() => window.dispatchEvent(new Event('mecura_bula_updated')), 10);
          }
          return { productCategories: merged };
        });
      },
      updateProduct: (categoryId, productName, productData) => {
        const oldClean = (productName || '').trim().toLowerCase();
        const newClean = (productData.name || '').trim().toLowerCase();
        if (newClean && newClean !== oldClean) {
          markProductAsDeleted(productName);
          unmarkProductAsDeleted(productData.name);
        }
        set((state) => {
          let found = false;
          let updatedProductFull: CBDProduct | null = null;
          let updated = state.productCategories.map(c => {
            const isTargetCat = !categoryId || categoryId === 'all' || c.id === categoryId;
            const hasProd = c.products.some(p => (p.name || '').trim().toLowerCase() === oldClean);
            if (isTargetCat || hasProd) {
              const updatedProds = c.products.map(p => {
                if ((p.name || '').trim().toLowerCase() === oldClean) {
                  found = true;
                  const mergedProd = { ...p, ...productData, isCustom: true } as any;
                  updatedProductFull = mergedProd;
                  return mergedProd;
                }
                return p;
              });
              return { 
                ...c, 
                products: updatedProds
              };
            }
            return c;
          });

          const fullProd: CBDProduct = updatedProductFull || ({
            name: productData.name || productName,
            manufacturer: productData.manufacturer || 'Associação Brasileira',
            type: productData.type || 'Óleo Sublingual',
            origin: productData.origin || 'Nacional',
            ...productData,
            isCustom: true
          } as any);

          const brandCatId = getBestCategoryIdForProduct(fullProd.origin, fullProd.manufacturer, fullProd.name);
          if (brandCatId) {
            unmarkCategoryAsDeleted(brandCatId);
            const bIdx = updated.findIndex(c => c.id === brandCatId);
            const targetClean = (fullProd.name || '').trim().toLowerCase();
            if (bIdx !== -1) {
              const hasInBrand = updated[bIdx].products.some(p => (p.name || '').trim().toLowerCase() === targetClean);
              if (!hasInBrand) {
                updated[bIdx] = {
                  ...updated[bIdx],
                  products: [fullProd, ...updated[bIdx].products.filter(p => (p.name || '').trim().toLowerCase() !== oldClean)]
                };
              }
            } else {
              const newCat = buildCustomBrandCategory(brandCatId, fullProd.manufacturer, fullProd.origin, [fullProd]);
              updated = [newCat, ...updated];
            }
          } else if (!found && updated.length > 0) {
            updated[0] = {
              ...updated[0],
              products: [fullProd, ...updated[0].products.filter(p => (p.name || '').trim().toLowerCase() !== oldClean)]
            };
          }

          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
      deleteProduct: (categoryId, productName) => {
        markProductAsDeleted(productName);
        set((state) => {
          const updated = state.productCategories.map(c => ({
            ...c,
            products: c.products.filter(p => (p.name || '').trim().toLowerCase() !== productName.trim().toLowerCase())
          }));
          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
      deleteCategory: (categoryId) => {
        set((state) => {
          const targetCat = state.productCategories.find(c => c.id === categoryId);
          const prodNames = targetCat ? targetCat.products.map(p => p.name) : [];
          markCategoryAsDeleted(categoryId, prodNames);
          const updated = state.productCategories.filter(c => c.id !== categoryId);
          const merged = mergeProductCatalogs(cbdGuideData, updated);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
      restoreDeletedCategories: () => {
        restoreAllDeletedCategories();
        set((state) => {
          const merged = mergeProductCatalogs(cbdGuideData, state.productCategories);
          syncCatalogToFirestore(merged);
          return { productCategories: merged };
        });
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        ...state,
        productCategories: compactCategoriesForStorage(state.productCategories || [])
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.productCategories = mergeProductCatalogs(cbdGuideData, state.productCategories);
        }
      },
    }
  )
);

// Realtime Firestore synchronization for Pharmacy Orders across all users and devices
if (typeof window !== 'undefined') {
  try {
    onSnapshot(collection(db, 'pharmacy_orders'), (snapshot) => {
      const cloudOrders: PharmacyPreparedOrder[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.patientId && Array.isArray(data.items)) {
          cloudOrders.push({
            id: docSnap.id,
            patientId: data.patientId,
            patientName: data.patientName || 'Paciente',
            patientEmail: data.patientEmail || '',
            patientCpf: data.patientCpf || '',
            patientPhone: data.patientPhone || '',
            doctorName: data.doctorName || 'Dr. Guilherme Taveira Dias',
            doctorCrm: data.doctorCrm || 'CRM/MT 17259',
            items: data.items,
            subtotalBRL: Number(data.subtotalBRL) || 0,
            shippingBRL: Number(data.shippingBRL) || 0,
            discountBRL: Number(data.discountBRL) || 0,
            totalBRL: Number(data.totalBRL) || 0,
            showPricesToPatient: data.showPricesToPatient !== undefined ? Boolean(data.showPricesToPatient) : true,
            notes: data.notes || '',
            whatsappNumber: data.whatsappNumber || '5566996280883',
            status: data.status || 'approved',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            approvedAt: data.approvedAt || undefined,
            requestedAt: data.requestedAt || undefined,
            deliveryAddress: data.deliveryAddress || undefined,
          });
        }
      });

      if (cloudOrders.length > 0) {
        const currentLocal = useAdminStore.getState().pharmacyOrders || [];
        const map = new Map<string, PharmacyPreparedOrder>();
        currentLocal.forEach(o => map.set(o.id, o));
        cloudOrders.forEach(o => {
          const existing = map.get(o.id);
          if (!existing || new Date(o.updatedAt || 0).getTime() >= new Date(existing.updatedAt || 0).getTime()) {
            map.set(o.id, o);
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
        useAdminStore.setState({ pharmacyOrders: merged });
      }
    }, (err) => {
      console.warn("Pharmacy orders listener warning:", err);
    });
  } catch (err) {
    console.warn("Failed to attach pharmacy orders listener:", err);
  }
}

// Realtime Firestore synchronization for Product Catalog across all users and devices
if (typeof window !== 'undefined') {
  try {
    subscribeToFirestoreCatalog((cloudCats) => {
      if (cloudCats && Array.isArray(cloudCats) && cloudCats.length > 0) {
        const currentLocal = useAdminStore.getState().productCategories;
        const merged = mergeProductCatalogs(cbdGuideData, currentLocal, cloudCats);
        useAdminStore.setState({ productCategories: merged });
      }
    });
  } catch (err) {
    console.warn("Failed to attach catalog listener:", err);
  }
}

// Realtime Firestore synchronization for Admin Settings (Promotions, PDF Catalog links)
if (typeof window !== 'undefined') {
  try {
    const adminSettingsRef = doc(db, 'settings', 'adminSettings');
    onSnapshot(adminSettingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const updates: Partial<AdminState> = {};
        if (data.promotionsText && typeof data.promotionsText === 'string') {
          updates.promotionsText = data.promotionsText;
        }
        if (data.catalogUrl && typeof data.catalogUrl === 'string') {
          updates.catalogUrl = data.catalogUrl;
        }
        if (data.catalogUrlNacional && typeof data.catalogUrlNacional === 'string') {
          updates.catalogUrlNacional = data.catalogUrlNacional;
        }
        if (Object.keys(updates).length > 0) {
          useAdminStore.setState(updates);
        }
      }
    }, (err) => {
      console.warn("Admin settings listener warning:", err);
    });
  } catch (err) {
    console.warn("Failed to attach admin settings listener:", err);
  }
}

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
          usageLogs: Array.isArray(data.usageLogs) ? data.usageLogs : [],
          ownerId: data.ownerId || undefined,
          affiliateName: data.affiliateName || undefined,
          affiliatePixOrPhone: data.affiliatePixOrPhone || undefined,
          commissionPercentage: data.commissionPercentage !== undefined ? Number(data.commissionPercentage) : undefined,
          linkClicks: data.linkClicks !== undefined ? Number(data.linkClicks) : 0,
          targetPlan: data.targetPlan || 'all',
        });
      });

      const currentLocal = useAdminStore.getState().coupons;

      if (cloudCoupons.length > 0 || initialized) {
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

import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  useCoupon: (id: string, userId: string) => void;

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
      addCoupon: (coupon) => set((state) => ({ coupons: [...state.coupons, coupon] })),
      updateCoupon: (id, data) => set((state) => ({
        coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c))
      })),
      deleteCoupon: (id) => set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id)
      })),
      useCoupon: (id, userId) => set((state) => ({
        coupons: state.coupons.map((c) => {
          if (c.id === id) {
            const currentUsedBy = c.usedBy || [];
            if (!currentUsedBy.includes(userId)) {
              return { ...c, usedCount: (c.usedCount || 0) + 1, usedBy: [...currentUsedBy, userId] };
            }
          }
          return c;
        })
      })),

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
      setProductCategories: (categories) => set({ productCategories: categories }),
      addProduct: (categoryId, product) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { ...c, products: [...c.products, product] } : c
        )
      })),
      updateProduct: (categoryId, productName, productData) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { 
            ...c, 
            products: c.products.map(p => p.name === productName ? { ...p, ...productData } : p) 
          } : c
        )
      })),
      deleteProduct: (categoryId, productName) => set((state) => ({
        productCategories: state.productCategories.map(c => 
          c.id === categoryId ? { 
            ...c, 
            products: c.products.filter(p => p.name !== productName) 
          } : c
        )
      })),
    }),
    {
      name: 'admin-storage',
    }
  )
);

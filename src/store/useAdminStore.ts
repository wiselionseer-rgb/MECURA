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
  setCatalogUrl: (url: string) => void;
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

      promotionsText: '🔥 PROMOÇÕES ATIVAS 🔥\n\n• Linha Vibe (Óleos): Desconto progressivo por volume (10% / 20% / 30% OFF ao comprar 2, 4 ou 6 unidades).\n• Chill Vibe Gummy: Desconto ao comprar 10 unidades ($350 vs $390 avulso).\n• Drops by GreenBudz Gummies: Todos os sabores com promoção de 2 pacotes por $49,90 (contra $54 no total avulso).\n• Ignite (Queima de estoque): Leve 3, pague 2 em todos os 4 óleos.',
      setPromotionsText: (text) => set({ promotionsText: text }),
      catalogUrl: 'https://drive.google.com/file/d/1QvJjJlj6gLaljo4-Jp0XhStUbwn_yYBA/preview?usp=drive_link',
      setCatalogUrl: (url) => set({ catalogUrl: url }),
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

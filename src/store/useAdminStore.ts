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
  active: boolean;
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

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;

  promotionsText: string;
  setPromotionsText: (text: string) => void;
  catalogUrl: string;
  setCatalogUrl: (url: string) => void;
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

      notifications: [],
      addNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      promotionsText: '🔥 PROMOÇÕES ATIVAS 🔥\n\n• Linha Vibe (Óleos): Desconto progressivo por volume (10% / 20% / 30% OFF ao comprar 2, 4 ou 6 unidades).\n• Chill Vibe Gummy: Desconto ao comprar 10 unidades ($350 vs $390 avulso).\n• Drops by GreenBudz Gummies: Todos os sabores com promoção de 2 pacotes por $49,90 (contra $54 no total avulso).\n• Ignite (Queima de estoque): Leve 3, pague 2 em todos os 4 óleos.',
      setPromotionsText: (text) => set({ promotionsText: text }),
      catalogUrl: 'https://drive.google.com/file/d/1QvJjJlj6gLaljo4-JpOXhStUbwn_yYBA/preview?usp=drive_link',
      setCatalogUrl: (url) => set({ catalogUrl: url }),
    }),
    {
      name: 'admin-storage',
    }
  )
);

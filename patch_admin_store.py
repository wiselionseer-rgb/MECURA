import re

with open("src/store/useAdminStore.ts", "r") as f:
    code = f.read()

# Update Coupon interface
old_coupon = """export interface Coupon {
  id: string;
  code: string;
  discount: number;
  active: boolean;
  ownerId?: string; // ID of the patient who owns this referral coupon
}"""

new_coupon = """export interface Coupon {
  id: string;
  code: string;
  discount: number;
  active: boolean;
  quantity?: number;
  usedCount?: number;
  usedBy?: string[];
  ownerId?: string; // ID of the patient who owns this referral coupon
}"""
code = code.replace(old_coupon, new_coupon)

# Add useCoupon to AdminState
old_state_iface = """  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;"""

new_state_iface = """  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  useCoupon: (id: string, userId: string) => void;"""
code = code.replace(old_state_iface, new_state_iface)

# Implement useCoupon in zustand
old_impl = """      updateCoupon: (id, data) => set((state) => ({
        coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c))
      })),
      deleteCoupon: (id) => set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id)
      })),"""

new_impl = """      updateCoupon: (id, data) => set((state) => ({
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
      })),"""
code = code.replace(old_impl, new_impl)

with open("src/store/useAdminStore.ts", "w") as f:
    f.write(code)

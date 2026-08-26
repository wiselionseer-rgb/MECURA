with open("src/components/ReferralModal.tsx", "r") as f:
    code = f.read()

# Make sure we use updateCoupon
code = code.replace("const { addCoupon, coupons } = useAdminStore();", "const { addCoupon, updateCoupon, coupons } = useAdminStore();")

# Update the quantity logic
old_logic = """    if (hasBonus) {
      const existingBonus = coupons.find(c => c.code === bonusCode);
      if (!existingBonus) {
        addCoupon({
          id: `bonus_${Date.now()}_${currentUserId}`,
          code: bonusCode,
          discount: 50,
          discountType: 'fixed',
          active: true,
          quantity: Math.floor(invited / 3),
          ownerId: currentUserId
        });
      } else if (existingBonus.quantity !== Math.floor(invited / 3)) {
         // Optionally update quantity if they invite 6, 9, etc.
         // but we can't call updateCoupon here easily unless we import it.
      }
    }"""
new_logic = """    if (hasBonus) {
      const existingBonus = coupons.find(c => c.code === bonusCode);
      const earnedQuantity = Math.floor(invited / 3);
      if (!existingBonus) {
        addCoupon({
          id: `bonus_${Date.now()}_${currentUserId}`,
          code: bonusCode,
          discount: 50,
          discountType: 'fixed',
          active: true,
          quantity: earnedQuantity,
          ownerId: currentUserId
        });
      } else if (existingBonus.quantity !== earnedQuantity) {
        updateCoupon(existingBonus.id, { quantity: earnedQuantity });
      }
    }"""
code = code.replace(old_logic, new_logic)

with open("src/components/ReferralModal.tsx", "w") as f:
    f.write(code)

with open("src/screens/CheckoutScreen.tsx", "r") as f:
    code = f.read()

old_price = "const finalPrice = appliedCoupon ? basePrice * (1 - appliedCoupon.discount / 100) : basePrice;"
new_price = """  let finalPrice = basePrice;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'fixed') {
      finalPrice = Math.max(0, basePrice - appliedCoupon.discount);
    } else {
      finalPrice = basePrice * (1 - appliedCoupon.discount / 100);
    }
  }"""
code = code.replace(old_price, new_price)

old_text = "Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)"
new_text = "Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discountType === 'fixed' ? `R$ ${appliedCoupon.discount}` : `${appliedCoupon.discount}%`})"
code = code.replace(old_text, new_text)

with open("src/screens/CheckoutScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

old_price = "const finalPrice = appliedCoupon ? basePrice * (1 - appliedCoupon.discount / 100) : basePrice;"
code = code.replace(old_price, new_price)
code = code.replace(old_text, new_text)

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)

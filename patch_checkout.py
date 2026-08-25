import re

with open("src/screens/CheckoutScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;", "const basePrice = selectedOffer === 'basic' ? 2.00 : 2.00; // TESTE")

with open("src/screens/CheckoutScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code2 = f.read()

code2 = code2.replace("const basePrice = 250.00;", "const basePrice = 2.00; // TESTE")

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code2)

print("Patched prices.")

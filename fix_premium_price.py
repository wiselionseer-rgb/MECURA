import re
with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("const basePrice = 2.00; // TESTE", "const basePrice = 250.00;")

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)
print("Fixed premium price")

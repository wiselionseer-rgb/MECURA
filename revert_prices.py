import re

for filename in ["src/screens/CheckoutScreen.tsx", "src/screens/PremiumCheckoutScreen.tsx"]:
    try:
        with open(filename, "r") as f:
            code = f.read()
            
        if "CheckoutScreen.tsx" in filename:
            code = code.replace("const basePrice = selectedOffer === 'basic' ? 2.00 : 2.00; // TESTE", "const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;")
        elif "PremiumCheckoutScreen.tsx" in filename:
            code = code.replace("const basePrice = 2.00; // TESTE", "const basePrice = 250.00;")
            
        with open(filename, "w") as f:
            f.write(code)
        print(f"Reverted prices in {filename}")
    except Exception as e:
        print(f"Error in {filename}: {e}")

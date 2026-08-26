import re
with open("src/screens/CheckoutScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("49.90", "50.00")

with open("src/screens/CheckoutScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/DashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("49.90", "50.00")

with open("src/screens/DashboardScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/WelcomeScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("49.90", "50.00")

with open("src/screens/WelcomeScreen.tsx", "w") as f:
    f.write(code)

print("Prices updated to 50.00")

import re

with open("src/screens/DoctorDashboardScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the specific option text
old_option = "Evitar ingerir alimentos ou líquidos logo após&#10;"
code = code.replace(old_option, "")

with open("src/screens/DoctorDashboardScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)

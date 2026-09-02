import re

with open("src/screens/DoctorDashboardScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the dosage string
old_full = "const fullDosage = `${dosageString}\\n\\n${adminInstructions}\\n\\nBLOCO IMPORTANTE:\\nUso sob orientação de profissional de saúde. Pode causar sonolência. Evitar dirigir ou operar máquinas. Manter fora do alcance de crianças.`;"
new_full = "const fullDosage = adminInstructions ? `${dosageString}\\n\\n${adminInstructions}` : dosageString;"
code = code.replace(old_full, new_full)

with open("src/screens/DoctorDashboardScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)

with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("onClick={handleGenerateMedicalReport}", "onClick={() => handleGenerateMedicalReport('inicial')}")
code = code.replace("handleGenerateMedicalReport();", "handleGenerateMedicalReport('inicial');")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

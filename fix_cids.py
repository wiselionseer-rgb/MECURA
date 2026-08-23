with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("CID-10 Principal: [INSERIR CID]", "CID-10 Principal: ${cidPrincipal}")
code = code.replace("CIDs Secundários: [INSERIR SE HOUVER]", "CIDs Secundários: ${cidsSecundarios}")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Fixed!")

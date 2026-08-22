with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("flex-1 flex flex-col bg-[#0A0A0F] relative h-full min-h-0 w-full", "flex-1 flex flex-col bg-[#0A0A0F] relative h-full min-h-0 min-w-0")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

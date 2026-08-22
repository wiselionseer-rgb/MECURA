with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("w-full md:w-96 bg-[#0A0A0F] border-t md:border-t-0 md:border-l border-mecura-elevated", "w-full md:w-80 bg-[#0A0A0F] border-t md:border-t-0 md:border-l border-mecura-elevated")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

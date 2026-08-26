with open("src/screens/ChatScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("? null :\n            ) : msg.type", "? null\n            : msg.type")

with open("src/screens/ChatScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("? null :\n                  ) : msg.type", "? null\n                  : msg.type")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

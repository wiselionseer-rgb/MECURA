with open("src/store/useStore.ts", "r") as f:
    code = f.read()

code = code.replace("status: 'pending' as const", "status: appointment.status || 'pending'")

with open("src/store/useStore.ts", "w") as f:
    f.write(code)

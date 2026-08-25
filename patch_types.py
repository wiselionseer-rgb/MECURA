import re
with open("src/store/useStore.ts", "r") as f:
    code = f.read()

code = code.replace("joinQueue: (patient?: { id: string; patientName: string; email: string; answers?: any; birthDate?: string; cpf?: string; phone?: string }) => void;", "joinQueue: (patient?: { id: string; patientName: string; email: string; answers?: any; birthDate?: string; cpf?: string; phone?: string }) => Promise<void>;")

with open("src/store/useStore.ts", "w") as f:
    f.write(code)
print("Type patched")

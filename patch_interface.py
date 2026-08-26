import re
with open("src/store/useStore.ts", "r") as f:
    code = f.read()

code = code.replace("addAppointment: (appointment: { patientName: string; date: string; time: string; type: string }) => void;", "addAppointment: (appointment: { patientName: string; date: string; time: string; type: string; status?: 'pending' | 'confirmed' | 'cancelled' }) => void;")

with open("src/store/useStore.ts", "w") as f:
    f.write(code)

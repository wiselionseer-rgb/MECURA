import re
with open("src/store/useStore.ts", "r") as f:
    code = f.read()

old_code = """      set((state) => ({
        allAppointments: [...state.allAppointments, { ...appointment, id: docRef.id, status: appointment.status || 'pending' }]
      }));"""

new_code = """      // Let onSnapshot handle state update to avoid duplicates
      // We don't manually append it here."""

code = code.replace(old_code, new_code)

with open("src/store/useStore.ts", "w") as f:
    f.write(code)

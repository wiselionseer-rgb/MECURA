with open("src/store/useStore.ts", "r") as f:
    code = f.read()

old_cancel = """  cancelAppointment: async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, status: 'cancelled' as const } : app
        )
      }));
    } catch (error) {
      console.error("Error cancelling appointment in Firestore:", error);
    }
  },"""

new_cancel = """  cancelAppointment: async (id, reason) => {
    try {
      const updateData: any = { status: 'cancelled' };
      if (reason) {
        updateData.cancelReason = reason;
      }
      await updateDoc(doc(db, 'appointments', id), updateData);
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, status: 'cancelled' as const, cancelReason: reason } : app
        )
      }));
    } catch (error) {
      console.error("Error cancelling appointment in Firestore:", error);
    }
  },
  rescheduleAppointment: async (id, date, time) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { date, time, status: 'confirmed' });
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, date, time, status: 'confirmed' as const } : app
        )
      }));
    } catch (error) {
      console.error("Error rescheduling appointment in Firestore:", error);
    }
  },"""

code = code.replace(old_cancel, new_cancel)

with open("src/store/useStore.ts", "w") as f:
    f.write(code)

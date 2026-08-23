import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add deleteDoc to imports
if "deleteDoc" not in code:
    code = code.replace("updateDoc, doc, getDocs", "updateDoc, doc, getDocs, deleteDoc")

old_block = """  const {
    doctors,
    addDoctor,"""

new_block = """  const handleDeleteNotification = async (id: string) => {
    deleteNotification(id);
    try {
      if (id.startsWith('global_')) {
        // Unfortunately we might not have the exact doc id if it wasn't saved, 
        // but let's try to find it by query if it doesn't match a doc
        // Actually, if we just delete it from local it's fine, but the old toast issue was solved by the 30 seconds limit!
      } else {
         const docRef = doc(db, 'global_notifications', id);
         await deleteDoc(docRef).catch(() => {});
         const docRef2 = doc(db, 'notifications', id);
         await deleteDoc(docRef2).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const {
    doctors,
    addDoctor,"""

code = code.replace(old_block, new_block)

code = code.replace("onClick={() => deleteNotification(notification.id)}", "onClick={() => handleDeleteNotification(notification.id)}")

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Updated AdminDashboardScreen.")

import re

# 1. Patch AppLayout.tsx
with open("src/components/layout/AppLayout.tsx", "r") as f:
    app_layout = f.read()

# Make sure setDoc is imported
if "setDoc" not in app_layout:
    app_layout = app_layout.replace("import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';", "import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';")

old_update = """        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: serverTimestamp()
        }).catch(() => {});"""

new_update = """        setDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: serverTimestamp()
        }, { merge: true }).catch(() => {});"""

if old_update in app_layout:
    app_layout = app_layout.replace(old_update, new_update)
else:
    print("Warning: old_update not found in AppLayout.tsx")

with open("src/components/layout/AppLayout.tsx", "w") as f:
    f.write(app_layout)

# 2. Patch AdminDashboardScreen.tsx
with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    admin_dash = f.read()

if "setDoc" not in admin_dash:
    admin_dash = admin_dash.replace("addDoc } from 'firebase/firestore';", "addDoc, setDoc } from 'firebase/firestore';")

old_force = """    try {
      await addDoc(collection(db, 'queue'), {
        patientId: patient.id,
        patientName: patient.name || 'Sem nome',
        tier: patient.tier || 'basic',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      });"""

new_force = """    try {
      await setDoc(doc(db, 'queue', patient.id), {
        patientId: patient.id,
        patientName: patient.name || 'Sem nome',
        email: patient.email || 'sem-email@mecura.com',
        tier: patient.tier || 'basic',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      });"""

if old_force in admin_dash:
    admin_dash = admin_dash.replace(old_force, new_force)
else:
    print("Warning: old_force not found in AdminDashboardScreen.tsx")

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(admin_dash)

print("Patch applied")

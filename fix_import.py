import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

if "import { collection, query" in code:
    old_import = "import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';"
    new_import = "import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc, addDoc, setDoc } from 'firebase/firestore';"
    code = code.replace(old_import, new_import)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)


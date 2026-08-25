with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';", "import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';")

# Fix jsPDF orientation type
code = code.replace("orientation: 'portrait'", "orientation: 'portrait' as const")

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Done")

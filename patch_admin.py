import re
with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add state for payments
if "const [payments, setPayments]" not in code:
    code = code.replace("const [queueCount, setQueueCount] = useState(0);", "const [queueCount, setQueueCount] = useState(0);\n  const [payments, setPayments] = useState<any[]>([]);")

# Add fetch for payments
fetch_code = """    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });

    const qPayments = query(collection(db, 'payments'));
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });"""

if "qPayments" not in code:
    code = code.replace("""    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });""", fetch_code)
    
    code = code.replace("unsubscribeQueue();", "unsubscribeQueue();\n      unsubscribePayments();")

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)

print("Added payments fetch to AdminDashboard")

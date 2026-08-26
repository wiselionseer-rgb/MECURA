import re

for filename in ["src/screens/CheckoutScreen.tsx", "src/screens/PremiumCheckoutScreen.tsx"]:
    with open(filename, "r") as f:
        code = f.read()

    # Make sure we import addDoc, collection and db if not already imported
    if "import { db" not in code:
        code = "import { db } from '../firebase';\n" + code
    if "import { collection, addDoc" not in code:
        code = code.replace("import { useState", "import { collection, addDoc } from 'firebase/firestore';\nimport { useState")

    old_poll = """            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              handleSuccess();
            }"""

    new_poll_basic = """            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                await addDoc(collection(db, 'payments'), {
                  mpId: pixData.id,
                  type: selectedOffer === 'basic' ? 'Consulta Básica' : 'Consulta Premium',
                  value: finalPrice,
                  date: new Date().toISOString()
                });
              } catch(err) { console.error(err); }
              handleSuccess();
            }"""
            
    new_poll_premium = """            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                await addDoc(collection(db, 'payments'), {
                  mpId: pixData.id,
                  type: 'Consulta Premium',
                  value: finalPrice,
                  date: new Date().toISOString()
                });
              } catch(err) { console.error(err); }
              handleSuccess();
            }"""

    if "CheckoutScreen.tsx" in filename:
        code = code.replace(old_poll, new_poll_basic)
    else:
        code = code.replace(old_poll, new_poll_premium)

    with open(filename, "w") as f:
        f.write(code)

print("Patched CheckoutScreens for payments.")

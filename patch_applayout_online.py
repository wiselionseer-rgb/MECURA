import re

with open("src/components/layout/AppLayout.tsx", "r") as f:
    code = f.read()

import_statement = "import { db } from '../../firebase';\nimport { doc, updateDoc, serverTimestamp } from 'firebase/firestore';"
if "updateDoc" not in code:
    code = code.replace("import { auth } from '../../firebase';", "import { auth, db } from '../../firebase';\nimport { doc, updateDoc, serverTimestamp } from 'firebase/firestore';")

old_handle = """    const handleActivity = () => {
      resetTimeout();
    };"""

new_handle = """    let lastUpdate = 0;
    const handleActivity = () => {
      resetTimeout();
      const now = Date.now();
      if (now - lastUpdate > 60000 && auth.currentUser) {
        lastUpdate = now;
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: serverTimestamp()
        }).catch(() => {});
      }
    };"""

code = code.replace(old_handle, new_handle)

with open("src/components/layout/AppLayout.tsx", "w") as f:
    f.write(code)

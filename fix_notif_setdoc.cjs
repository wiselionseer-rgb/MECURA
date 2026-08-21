const fs = require('fs');
let code = fs.readFileSync('src/utils/notifications.ts', 'utf8');
code = code.replace("await updateDoc(doc(db, 'users', userId), {", "await setDoc(doc(db, 'users', userId), {\n      pushSubscription: JSON.parse(JSON.stringify(subscription))\n    }, { merge: true });\n    //");
fs.writeFileSync('src/utils/notifications.ts', code, 'utf8');

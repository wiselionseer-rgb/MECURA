const fs = require('fs');
const path = 'src/components/NotificationToast.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {`,
`    let isInitial = true;
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {`
);

fs.writeFileSync(path, content, 'utf8');
console.log('patched');

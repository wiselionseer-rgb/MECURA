const fs = require('fs');

let content = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Replace timestamp parsing logic in subscribeToMessages
content = content.replace(
  'timestamp: new Date(doc.data().timestamp)',
  'timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)'
);

fs.writeFileSync('src/store/useStore.ts', content, 'utf8');
console.log('Fixed timestamp parsing');

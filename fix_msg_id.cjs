const fs = require('fs');
const storePath = 'src/store/useStore.ts';
let storeCode = fs.readFileSync(storePath, 'utf8');

const targetCode = `  addMessage: async (msg) => {
    const state = get();
    const newMessage = { ...msg, id: Date.now().toString(), timestamp: new Date() };`;

const newCode = `  addMessage: async (msg) => {
    const state = get();
    // Add a random suffix to Date.now() to prevent duplicate keys if messages are added in the same millisecond
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    const newMessage = { ...msg, id: uniqueId, timestamp: new Date() };`;

if(storeCode.includes(targetCode)) {
  storeCode = storeCode.replace(targetCode, newCode);
  fs.writeFileSync(storePath, storeCode);
  console.log("Success store update");
} else {
  console.log("Target store code not found");
}


const fs = require('fs');
let code = fs.readFileSync('src/store/useAdminStore.ts', 'utf8');

const oldAdd = `addNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),`;
const newAdd = `addNotification: (notification) => set((state) => {
        if (state.notifications.some(n => n.id === notification.id)) return state;
        return { notifications: [...state.notifications, notification] };
      }),`;

if (code.includes(oldAdd)) {
  code = code.replace(oldAdd, newAdd);
  fs.writeFileSync('src/store/useAdminStore.ts', code, 'utf8');
  console.log('Fixed addNotification to prevent duplicates.');
} else {
  console.log('Could not find addNotification line.');
}

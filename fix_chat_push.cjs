const fs = require('fs');

// Fix ChatScreen.tsx
let chat = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf8');
if (!chat.includes('subscribeToBackgroundNotifications')) {
  chat = chat.replace("import { requestNotificationPermission } from '../utils/notifications';", "import { requestNotificationPermission, subscribeToBackgroundNotifications } from '../utils/notifications';");
  chat = chat.replace("requestNotificationPermission();", `requestNotificationPermission().then(granted => {
      if (granted && patientId) {
        subscribeToBackgroundNotifications(patientId);
      }
    });`);
  fs.writeFileSync('src/screens/ChatScreen.tsx', chat, 'utf8');
}

// Fix DoctorDashboardScreen.tsx
let doc = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');
if (!doc.includes('subscribeToBackgroundNotifications')) {
  doc = doc.replace("showNativeNotification } from '../utils/notifications';", "showNativeNotification, subscribeToBackgroundNotifications } from '../utils/notifications';");
  doc = doc.replace("requestNotificationPermission();", `requestNotificationPermission().then(granted => {
      if (granted && adminId) {
        subscribeToBackgroundNotifications(adminId);
      }
    });`);
  // Get adminId from auth.currentUser in DoctorDashboardScreen.tsx
  if (doc.includes('const user = auth.currentUser;')) {
     doc = doc.replace('const user = auth.currentUser;', 'const user = auth.currentUser;\n  const adminId = user?.uid;');
  } else {
     doc = doc.replace('export function DoctorDashboardScreen() {', 'export function DoctorDashboardScreen() {\n  const adminId = auth.currentUser?.uid;');
  }
  fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', doc, 'utf8');
}

console.log('Push subscription added to screens');

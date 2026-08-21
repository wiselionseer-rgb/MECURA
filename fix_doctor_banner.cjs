const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

if (!code.includes('EnableNotificationsBanner')) {
  code = code.replace("import { NotificationToast } from '../components/NotificationToast';", "import { NotificationToast } from '../components/NotificationToast';\nimport { EnableNotificationsBanner } from '../components/EnableNotificationsBanner';");
  
  code = code.replace('<NotificationToast />', '<EnableNotificationsBanner userId={adminId} role="admin" />\n      <NotificationToast />');
  
  fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
}

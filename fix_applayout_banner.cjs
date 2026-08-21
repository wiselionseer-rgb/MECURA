const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf8');

if (!code.includes('EnableNotificationsBanner')) {
  code = code.replace("import { NotificationToast } from '../NotificationToast';", "import { NotificationToast } from '../NotificationToast';\nimport { EnableNotificationsBanner } from '../EnableNotificationsBanner';");
  
  code = code.replace('<NotificationToast />', '<EnableNotificationsBanner userId={auth.currentUser?.uid || userName} />\n        <NotificationToast />');
  
  fs.writeFileSync('src/components/layout/AppLayout.tsx', code, 'utf8');
}

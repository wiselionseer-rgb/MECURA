const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationToast.tsx', 'utf-8');

if (!code.includes("useLocation")) {
    code = code.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { useLocation } from 'react-router-dom';");
}

const targetUseEffect = `  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (!seenNotifications.has(latestNotification.id)) {
        setVisibleNotification(latestNotification);
        setSeenNotifications(prev => new Set(prev).add(latestNotification.id));
        
        // Auto-hide after 8 seconds for better readability
        const timer = setTimeout(() => {
          setVisibleNotification(null);
        }, 8000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, seenNotifications]);`;

const replacementUseEffect = `  const location = useLocation();

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (!seenNotifications.has(latestNotification.id)) {
        setSeenNotifications(prev => new Set(prev).add(latestNotification.id));
        
        const isDoctorRoute = location.pathname.includes('/doctor') || location.pathname.includes('/admin');
        const isDoctorNotification = latestNotification.title.includes('Novo Paciente') || latestNotification.title.includes('Nova Mensagem');
        
        // Only show doctor-specific notifications if the user is currently on the doctor/admin route
        if (isDoctorNotification && !isDoctorRoute) {
           return;
        }

        setVisibleNotification(latestNotification);
        
        // Auto-hide after 8 seconds for better readability
        const timer = setTimeout(() => {
          setVisibleNotification(null);
        }, 8000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, seenNotifications, location.pathname]);`;

code = code.replace(targetUseEffect, replacementUseEffect);
fs.writeFileSync('src/components/NotificationToast.tsx', code);

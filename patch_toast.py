import re

with open("src/components/NotificationToast.tsx", "r") as f:
    code = f.read()

old_block = """  useEffect(() => {
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

        setVisibleNotification(latestNotification);"""

new_block = """  useEffect(() => {
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

        // Do not show toasts for notifications older than 1 hour on app reload
        const notifDate = new Date(latestNotification.date).getTime();
        const now = Date.now();
        if (now - notifDate > 60 * 60 * 1000) {
            return;
        }

        setVisibleNotification(latestNotification);"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/components/NotificationToast.tsx", "w") as f:
        f.write(code)
    print("Replaced successfully.")
else:
    print("Could not find block.")

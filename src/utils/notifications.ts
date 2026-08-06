export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações de desktop');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNativeNotification = (title: string, message?: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: message,
        icon: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=100&auto=format&fit=crop', // Temporary icon
      });

      notification.onclick = function() {
        window.focus();
        this.close();
      };
    } catch (e) {
      console.warn('Falha ao enviar notificação nativa', e);
    }
  }
};

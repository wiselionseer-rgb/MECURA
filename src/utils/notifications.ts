export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    registerServiceWorker();
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      registerServiceWorker();
      return true;
    }
  }
  
  return false;
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration.scope);
      return registration;
    } catch (error) {
      console.warn('Falha ao registrar Service Worker:', error);
    }
  }
  return null;
};

export const showNativeNotification = async (title: string, message?: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: message,
            icon: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=192&auto=format&fit=crop',
            badge: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=96&auto=format&fit=crop',
            tag: 'mecura-alert',
            renotify: true
          } as any);
          return;
        }
      }

      // Fallback to standard Notification API
      const notification = new Notification(title, {
        body: message,
        icon: 'https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=100&auto=format&fit=crop',
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

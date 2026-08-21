import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { playNotificationSound } from './sound';

let swRegistration: ServiceWorkerRegistration | null = null;

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = registration;
    return registration;
  } catch (error) {
    console.warn('Falha ao registrar Service Worker:', error);
    return null;
  }
};

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Notificações não são suportadas neste navegador/dispositivo.');
    return false;
  }

  // Ensure service worker is registered
  await registerServiceWorker();

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Erro ao solicitar permissão de notificação:', e);
    }
  }

  return false;
};

export const showNativeNotification = async (title: string, message?: string, url: string = '/doctor') => {
  // Always trigger sound & haptic vibration
  playNotificationSound();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      // 1. Send to active Service Worker controller if available
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body: message,
          tag: 'mecura-' + Date.now(),
          url
        });
      }

      // 2. Try ServiceWorker Registration directly (Essential for mobile PWA lockscreen & background)
      if ('serviceWorker' in navigator) {
        const registration = swRegistration || (await navigator.serviceWorker.ready);
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: message || 'Nova notificação no consultório.',
            icon: '/logo-192.png?v=6',
            badge: '/logo-192.png?v=6',
            tag: 'mecura-' + Date.now(),
            renotify: true,
            data: { url }
          } as any);
          return;
        }
      }

      // 3. Fallback to standard window.Notification constructor
      const notification = new Notification(title, {
        body: message,
        icon: '/logo-192.png?v=6',
      });

      notification.onclick = function() {
        window.focus();
        this.close();
      };
    } catch (e) {
      console.warn('Falha ao disparar notificação do sistema:', e);
    }
  }
};

export const testNotification = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    await showNativeNotification(
      '🔔 Teste de Notificação Mecura',
      'Notificações e alertas sonoros ativos com sucesso no seu dispositivo!',
      '/doctor'
    );
    return true;
  }
  return false;
};


export const subscribeToBackgroundNotifications = async (userId: string) => {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return false;
    
    const response = await fetch('/api/vapid-public-key');
    const vapidPublicKey = await response.text();
    
    // Convert VAPID key to Uint8Array
    const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
    const base64 = (vapidPublicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: outputArray
    });
    
    // Save to Firestore user doc
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    await setDoc(doc(db, 'users', userId), {
      pushSubscription: JSON.parse(JSON.stringify(subscription))
    }, { merge: true });
    
    console.log('Background push notifications subscribed!');
    return true;
  } catch (error) {
    console.warn('Failed to subscribe to background push:', error);
    return false;
  }
};

export const triggerBackgroundPush = async (userId: string, title: string, body: string, url: string = '/dashboard') => {
  if (!userId) return;
  try {
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url })
    });
    const data = await res.json();
    console.log('Push response:', data);
  } catch (error) {
    console.error('Failed to trigger background push', error);
  }
};

export const triggerAdminBackgroundPush = async (title: string, body: string, url: string = '/doctor') => {
  try {
    await fetch('/api/send-admin-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url })
    });
  } catch (error) {
    console.error('Failed to trigger admin background push', error);
  }
};

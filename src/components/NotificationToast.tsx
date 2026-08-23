import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { Bell, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { showNativeNotification } from '../utils/notifications';
import { playNotificationSound } from '../utils/sound';
import { AnimatePresence, motion } from 'motion/react';

export function NotificationToast() {
  const { notifications, addNotification } = useAdminStore();
  const { patientId } = useStore();
  const [visibleNotification, setVisibleNotification] = useState<any>(null);
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set());

  // Listen to personal notifications
  useEffect(() => {
    const currentId = auth.currentUser?.uid || patientId;
    if (!currentId) return;

    let isInitial = true;
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (change.doc.id === currentId) {
            const notifTitle = data.type === 'next' ? 'Sua vez chegou!' : 'Aviso do Médico';
            const notifMessage = data.text;
            addNotification({
              id: change.doc.id + '_' + Date.now(),
              title: notifTitle,
              message: notifMessage,
              date: new Date(data.timestamp).toISOString()
            });
            showNativeNotification(notifTitle, notifMessage);
            
          }
        }
      });
    });

    return () => unsubscribe();
  }, [addNotification, patientId]);

  // Listen to global admin notifications broadcasted to all users
  useEffect(() => {
    let isInitial = true;
    const q = query(collection(db, 'global_notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as any;
          if (data && data.title && data.message) {
            addNotification({
              id: data.id || ('global_' + Date.now()),
              title: data.title,
              message: data.message,
              date: data.date || new Date().toISOString()
            });
            showNativeNotification(data.title, data.message);
            
          }
        }
      });
    });

    return () => unsubscribe();
  }, [addNotification]);

  const location = useLocation();

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

        // Do not show toasts for notifications older than 1 hour on app reload
        const notifDate = new Date(latestNotification.date).getTime();
        const now = Date.now();
        if (now - notifDate > 30 * 1000) {
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
  }, [notifications, seenNotifications, location.pathname]);

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-6 left-0 right-0 mx-auto z-[9999] w-[92%] max-w-[420px]"
        >
          <div className="bg-[#12121A]/85 backdrop-blur-3xl border border-[#A6FF00]/40 rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-start gap-4 relative overflow-hidden">
            {/* Subtle glow effect behind the toast */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/10 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="w-12 h-12 rounded-[20px] bg-[#A6FF00]/10 border border-[#A6FF00]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(166,255,0,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#A6FF00]/20 animate-pulse" />
              <Bell className="w-6 h-6 text-[#A6FF00] relative z-10" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 pt-0.5 relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[16px] text-white font-bold tracking-tight leading-none">{visibleNotification.title}</h4>
              </div>
              <p className="text-[13px] text-[#8A8A9E] leading-relaxed font-medium">
                {visibleNotification.message}
              </p>
            </div>
            
            <button 
              onClick={() => setVisibleNotification(null)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-white/10 transition-colors shrink-0 relative z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

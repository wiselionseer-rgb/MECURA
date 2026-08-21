import { useState, useEffect } from 'react';
import { Bell, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestNotificationPermission, subscribeToBackgroundNotifications } from '../utils/notifications';

export function EnableNotificationsBanner({ userId, role }: { userId?: string, role?: string }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        setShow(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted && userId) {
        await subscribeToBackgroundNotifications(userId);
        if (role === 'admin') {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await setDoc(doc(db, 'users', userId), { role: 'admin' }, { merge: true });
        }
      }
      setShow(false);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[99999] bg-[#A6FF00] rounded-2xl shadow-[0_10px_30px_rgba(166,255,0,0.3)] p-4 flex flex-col gap-3"
      >
        <button onClick={() => setShow(false)} className="absolute top-2 right-2 p-1 text-black/50 hover:text-black">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-black shrink-0 mt-0.5" />
          <div>
            <h4 className="text-black font-bold text-sm">Notificações em Segundo Plano</h4>
            <p className="text-black/80 text-xs mt-1 leading-relaxed">
              Para receber avisos importantes mesmo com o app fechado (fora da tela), habilite as notificações.
            </p>
          </div>
        </div>
        <button 
          onClick={handleEnable}
          disabled={loading}
          className="bg-black text-[#A6FF00] font-bold text-sm py-2 px-4 rounded-xl hover:bg-black/80 transition-colors w-full flex items-center justify-center gap-2"
        >
          {loading ? 'Ativando...' : (
            <>
              <Bell className="w-4 h-4" />
              Ativar Agora
            </>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestNotificationPermission, subscribeToBackgroundNotifications } from '../utils/notifications';

export function EnableNotificationsBanner({ userId, role }: { userId?: string, role?: string }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Não exibir na tela de boas-vindas inicial (para manter visual limpo)
    if (location.pathname === '/' || location.pathname === '/welcome') {
      setShow(false);
      return;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const dismissed = localStorage.getItem('mecura_notif_dismissed');
        // Se dispensado nas últimas 24 horas, não incomodar
        if (dismissed && Date.now() - Number(dismissed) < 24 * 60 * 60 * 1000) {
          setShow(false);
          return;
        }
        setShow(true);
      } else {
        setShow(false);
      }
    }
  }, [location.pathname]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('mecura_notif_dismissed', Date.now().toString());
    } catch {}
    setShow(false);
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      
      const { auth } = await import('../firebase');
      const finalUserId = userId || auth.currentUser?.uid;
      if (granted && finalUserId) {
        await subscribeToBackgroundNotifications(finalUserId);
        if (role === 'admin') {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await setDoc(doc(db, 'users', finalUserId), { role: 'admin' }, { merge: true });
        }
      }
      try {
        localStorage.setItem('mecura_notif_dismissed', Date.now().toString());
      } catch {}
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
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="fixed top-3 left-3 right-3 sm:top-4 sm:left-auto sm:right-4 sm:w-[380px] z-[99999] bg-[#0E1317]/95 backdrop-blur-xl border border-mecura-neon/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(166,255,0,0.1)] p-4 flex flex-col gap-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center shrink-0 text-mecura-neon mt-0.5 shadow-[0_0_12px_rgba(166,255,0,0.2)]">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                Ativar Notificações
                <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon inline-block" />
              </h4>
              <p className="text-[#8A8A9E] text-xs mt-0.5 leading-relaxed">
                Receba aviso imediato na tela quando o médico chamar para sua consulta.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="p-1 rounded-lg text-[#8A8A9E] hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 text-xs font-semibold text-[#8A8A9E] hover:text-white transition-colors text-center"
          >
            Depois
          </button>
          <button 
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-xl bg-mecura-neon text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(166,255,0,0.3)] hover:shadow-[0_0_20px_rgba(166,255,0,0.45)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Ativando...</span>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 fill-black" />
                <span>Ativar Agora</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


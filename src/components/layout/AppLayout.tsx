import { useEffect, useRef } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { User, Store } from 'lucide-react';
import { NotificationToast } from '../NotificationToast';
import { EnableNotificationsBanner } from '../EnableNotificationsBanner';
import { subscribeToBackgroundNotifications } from '../../utils/notifications';
import { useStore } from '../../store/useStore';
import { auth } from '../../firebase';
import { motion, AnimatePresence } from 'motion/react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, patientId, resetConsultation, subscribeToQueue } = useStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show gamification header only on specific screens
  const showGamificationHeader = ['/queue', '/chat', '/prescription'].includes(location.pathname);

  // Global queue subscription
  useEffect(() => {
    const unsubscribe = subscribeToQueue();
    return () => unsubscribe();
  }, [subscribeToQueue]);

  // Auto-subscribe to notifications for anonymous patients (patientId)
  useEffect(() => {
    const checkAndSubscribe = async () => {
      const finalUserId = patientId || auth.currentUser?.uid;
      if (finalUserId && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            await subscribeToBackgroundNotifications(finalUserId);
          } catch (e) {
            console.error("Auto push subscription failed in AppLayout:", e);
          }
        }
      }
    };
    checkAndSubscribe();
  }, [patientId]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      // Inactivity timeout reached
      if (auth.currentUser) {
        navigate('/dashboard');
      } else {
        resetConsultation();
        navigate('/');
      }
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial setup
    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [navigate]);

  useEffect(() => {
    // Check if user has state or is logged in
    const isPublicRoute = location.pathname === '/' || location.pathname === '/onboarding';
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!isPublicRoute && !user && !userName) {
        // User refreshed the page and lost state, and is not logged in
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [location.pathname, userName, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center sm:p-4 perspective-[1000px]">
      <div className="w-full h-screen sm:h-[850px] sm:max-w-[400px] bg-[#0A0A0F] sm:rounded-[44px] sm:border-[8px] sm:border-[#1F1F29] overflow-hidden relative shadow-2xl flex flex-col transform-gpu">
        
        <EnableNotificationsBanner userId={patientId || auth.currentUser?.uid} />
        <NotificationToast />

        {showGamificationHeader && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center px-6 py-4 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 z-20 sticky top-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#161622] border-2 border-mecura-neon flex items-center justify-center shadow-[0_0_10px_rgba(166,255,0,0.2)] relative">
                <User className="w-5 h-5 text-mecura-neon" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-mecura-neon rounded-full border-2 border-mecura-bg animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] text-[#8A8A9E] uppercase tracking-wider font-bold">Nível Guardião</p>
                <p className="text-sm font-bold text-mecura-neon">5.200 pts</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-[#161622] px-4 py-2 rounded-full border border-white/5 hover:border-mecura-neon/30 hover:bg-[#1A1A26] transition-all"
            >
              <Store className="w-4 h-4 text-mecura-neon" />
              <span className="text-xs font-bold text-white">Painel</span>
            </button>
          </motion.div>
        )}

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full absolute inset-0 overflow-y-auto overflow-x-hidden"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

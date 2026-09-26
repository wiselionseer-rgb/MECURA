import { useEffect, useRef } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { User, Store } from 'lucide-react';
import { NotificationToast } from '../NotificationToast';
import { EnableNotificationsBanner } from '../EnableNotificationsBanner';
import { subscribeToBackgroundNotifications } from '../../utils/notifications';
import { useStore } from '../../store/useStore';
import { auth, db } from '../../firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, patientId, resetConsultation, subscribeToQueue, fetchConsultationHistory } = useStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global queue subscription
  useEffect(() => {
    const unsubscribe = subscribeToQueue();
    return () => unsubscribe();
  }, [subscribeToQueue]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const uid = patientId || user?.uid;
      if (uid) {
        fetchConsultationHistory(uid);
      }
    });
    return () => unsubscribe();
  }, [patientId, fetchConsultationHistory]);

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
    
    let lastUpdate = 0;
    const handleActivity = () => {
      resetTimeout();
      const now = Date.now();
      if (now - lastUpdate > 60000 && auth.currentUser) {
        lastUpdate = now;
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }
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
    const isPublicRoute = 
      location.pathname === '/' || 
      location.pathname === '/onboarding' ||
      location.pathname === '/legal' ||
      location.pathname === '/privacy' ||
      location.pathname === '/privacidade' ||
      location.pathname === '/termos';
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!isPublicRoute && !user && !userName) {
        // User refreshed the page and lost state, and is not logged in
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [location.pathname, userName, navigate]);

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center sm:p-4 perspective-[1000px]">
      <div className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[400px] bg-[#0A0A0F] sm:rounded-[44px] sm:border-[8px] sm:border-[#1F1F29] overflow-hidden relative shadow-2xl flex flex-col transform-gpu pt-[env(safe-area-inset-top)] sm:pt-0">
        
        <EnableNotificationsBanner userId={patientId || auth.currentUser?.uid} />
        <NotificationToast />

        <main className="flex-1 overflow-hidden relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full h-full absolute inset-0 overflow-y-auto overflow-x-hidden"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

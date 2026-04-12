import { useEffect, useRef } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { User, Flame } from 'lucide-react';
import { NotificationToast } from '../NotificationToast';
import { useStore } from '../../store/useStore';
import { auth } from '../../firebase';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, resetConsultation } = useStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show gamification header only on specific screens
  const showGamificationHeader = ['/queue', '/chat', '/prescription'].includes(location.pathname);

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
    <div className="min-h-screen bg-black flex items-center justify-center sm:p-4">
      <div className="w-full h-screen sm:h-[850px] sm:max-w-[400px] bg-mecura-bg sm:rounded-[40px] sm:border-[8px] sm:border-[#1F1F29] overflow-hidden relative shadow-2xl flex flex-col">
        
        <NotificationToast />

        {showGamificationHeader && (
          <div className="flex justify-between items-center px-6 py-4 bg-mecura-bg border-b border-mecura-elevated z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mecura-surface border-2 border-mecura-neon flex items-center justify-center shadow-[0_0_10px_rgba(166,255,0,0.2)] relative">
                <User className="w-5 h-5 text-mecura-neon" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-mecura-neon rounded-full border-2 border-mecura-bg animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] text-mecura-silver uppercase tracking-wider font-bold">Nível Guardião</p>
                <p className="text-sm font-bold text-mecura-neon">5.200 pts</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-mecura-surface px-3 py-1.5 rounded-full border border-mecura-elevated">
              <Flame className="w-4 h-4 text-mecura-neon" />
              <span className="text-xs font-bold text-mecura-pearl">3 dias</span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

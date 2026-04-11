import { useLocation, Outlet } from 'react-router-dom';
import { User, Flame } from 'lucide-react';
import { NotificationToast } from '../NotificationToast';

export function AppLayout() {
  const location = useLocation();

  // Show gamification header only on specific screens
  const showGamificationHeader = ['/queue', '/chat', '/prescription'].includes(location.pathname);

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

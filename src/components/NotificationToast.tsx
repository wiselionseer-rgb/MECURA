import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Bell, X } from 'lucide-react';

export function NotificationToast() {
  const { notifications } = useAdminStore();
  const [visibleNotification, setVisibleNotification] = useState<any>(null);
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (!seenNotifications.has(latestNotification.id)) {
        setVisibleNotification(latestNotification);
        setSeenNotifications(prev => new Set(prev).add(latestNotification.id));
        
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setVisibleNotification(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, seenNotifications]);

  if (!visibleNotification) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-[#161622] border border-mecura-neon/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(166,255,0,0.15)] flex gap-3">
        <div className="w-10 h-10 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-mecura-neon" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm mb-1">{visibleNotification.title}</h4>
          <p className="text-[#8A8A9E] text-xs leading-relaxed">{visibleNotification.message}</p>
        </div>
        <button 
          onClick={() => setVisibleNotification(null)}
          className="text-[#8A8A9E] hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

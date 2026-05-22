import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      console.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      console.error('Failed to mark all read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Error': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'Request': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Notifications</h4>
                 {unreadCount > 0 && (
                   <button 
                    onClick={markAllRead}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                   >
                     Mark all as read
                   </button>
                 )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto" />
                    <p className="text-xs font-bold text-gray-400">All clear!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={clsx(
                        "p-4 border-b border-gray-50 last:border-0 cursor-pointer transition-all flex gap-3",
                        !n.is_read ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-gray-50"
                      )}
                    >
                       <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                       <div className="space-y-1">
                          <p className={clsx("text-xs leading-snug", !n.is_read ? "font-bold text-gray-900" : "font-medium text-gray-500")}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                       </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                 <button className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest">
                    View full history
                 </button>
              </div>
            </motion.div>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowDropdown(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

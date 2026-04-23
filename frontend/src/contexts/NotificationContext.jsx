import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, Sparkles, AlertCircle, X } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = (title, message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);

    // Browser notification if permitted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      
      {/* Visual Notification Container */}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className="pointer-events-auto glass-card border-brand-primary/20 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                {n.type === 'info' ? <Sparkles className="w-4 h-4 text-brand-primary" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-xs font-black text-white uppercase tracking-widest">{n.title}</span>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}>
                <X className="w-4 h-4 text-slate-500 hover:text-white" />
              </button>
            </div>
            <p className="text-sm text-slate-300">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);

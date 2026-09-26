import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  CreditCard, 
  MessageSquare, 
  Package, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setActiveTab,
    orders,
    conversations,
    setActiveConversation
  } = useMarket();

  const [filterType, setFilterType] = useState<'all' | 'order' | 'payment' | 'message' | 'safety'>('all');

  const userNotifs = notifications.filter(n => !n.userId || n.userId === currentUser.id);
  const filteredNotifs = filterType === 'all' 
    ? userNotifs 
    : userNotifs.filter(n => n.type === filterType);

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);

    if (notif.targetTab) {
      setActiveTab(notif.targetTab as any);
      if (notif.targetTab === 'messages' && notif.targetId) {
        const targetConv = conversations.find(c => c.id === notif.targetId);
        if (targetConv) setActiveConversation(targetConv);
      }
    }
    onClose();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'safety':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div 
      id="notifications-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="notifications-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Campus Notifications</h2>
              <span className="text-[11px] text-slate-400">Order, payment & safety alerts</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {(['all', 'order', 'payment', 'message', 'safety'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] capitalize transition ${
                  filterType === t 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 ml-2 flex items-center gap-1"
            title="Mark all read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All</span>
          </button>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No notifications in this category.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex gap-3 items-start ${
                  notif.isRead 
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700' 
                    : 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-400 text-slate-900 shadow-xs'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  notif.isRead ? 'bg-slate-100' : 'bg-emerald-100'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-800' : 'text-emerald-950'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

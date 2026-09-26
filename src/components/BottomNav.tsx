import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    conversations 
  } = useMarket();

  // Total unread messages for current user
  const totalUnreadChats = conversations.reduce((acc, c) => {
    return acc + (c.unreadCountForUser[currentUser.id] || 0);
  }, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          id="nav-home-btn"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 cursor-pointer transition ${
            activeTab === 'home' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        {/* Categories */}
        <button
          id="nav-categories-btn"
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 cursor-pointer transition ${
            activeTab === 'categories' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">Categories</span>
        </button>

        {/* Sell Button - Elevated Hero Button */}
        <button
          id="nav-sell-btn"
          onClick={() => setActiveTab('sell')}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
          title="Post Item on Campus"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-hover:bg-emerald-700 transition transform group-active:scale-95">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${
            activeTab === 'sell' ? 'text-emerald-700' : 'text-slate-700'
          }`}>
            Sell
          </span>
        </button>

        {/* Messages */}
        <button
          id="nav-messages-btn"
          onClick={() => setActiveTab('messages')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 cursor-pointer transition ${
            activeTab === 'messages' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnreadChats > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {totalUnreadChats}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">Messages</span>
        </button>

        {/* Profile */}
        <button
          id="nav-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 cursor-pointer transition ${
            activeTab === 'profile' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-300">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-full h-full p-0.5 text-slate-600" />
            )}
          </div>
          <span className="text-[11px] mt-0.5">Profile</span>
        </button>

        {/* Admin Quick Access if user is admin */}
        {currentUser.role === 'admin' && (
          <button
            id="nav-admin-btn"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 cursor-pointer transition ${
              activeTab === 'admin' ? 'text-amber-700 font-bold' : 'text-amber-600 hover:text-amber-800'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Mod</span>
          </button>
        )}
      </div>
    </nav>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  ArrowLeft, 
  ShieldAlert, 
  MoreVertical, 
  ExternalLink, 
  Check, 
  CheckCheck, 
  UserX, 
  Flag,
  MessageSquare,
  ShoppingBag
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from '../utils/formatters';

const QUICK_SUGGESTIONS = [
  'Is this still available?',
  'Can we meet at the SUB?',
  'What is your last price?',
  'Can I inspect it today?'
];

export const ChatView: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    sendMessage,
    products,
    setViewProductDetail,
    showToast
  } = useMarket();

  const [inputMessage, setInputMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations that belong to current user
  const userConversations = conversations.filter(
    c => c.buyerId === currentUser.id || c.sellerId === currentUser.id
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, text);
    setInputMessage('');
  };

  const handleBlockUser = () => {
    setShowOptions(false);
    showToast('User has been blocked. You will no longer receive messages from them.');
  };

  const handleReportUser = () => {
    setShowOptions(false);
    showToast('User reported to StudentPlug NG safety moderation team.');
  };

  // If viewing active conversation
  if (activeConversation) {
    const isBuyer = activeConversation.buyerId === currentUser.id;
    const otherUserName = isBuyer ? activeConversation.sellerName : activeConversation.buyerName;
    const referencedProduct = products.find(p => p.id === activeConversation.productId);

    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-130px)] flex flex-col bg-white rounded-t-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="chat-back-to-list-btn"
              onClick={() => setActiveConversation(null)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {otherUserName.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {otherUserName}
              </h2>
              <span className="text-[10px] text-emerald-600 font-medium">Active on Campus</span>
            </div>
          </div>

          <div className="relative">
            <button
              id="chat-options-menu-btn"
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <div 
                id="chat-options-dropdown"
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
              >
                <button
                  id="chat-block-user-btn"
                  onClick={handleBlockUser}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5 text-slate-500" />
                  <span>Block User</span>
                </button>
                <button
                  id="chat-report-user-btn"
                  onClick={handleReportUser}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Report User</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Product Card Reference */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-3.5 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 truncate">
            {activeConversation.productImage ? (
              <img 
                src={activeConversation.productImage} 
                alt={activeConversation.productTitle} 
                className="w-9 h-9 rounded-md object-cover shrink-0 border border-emerald-200" 
              />
            ) : (
              <div className="w-9 h-9 rounded-md bg-emerald-200 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
              </div>
            )}
            <div className="truncate">
              <span className="text-[11px] font-semibold text-slate-900 block truncate">
                {activeConversation.productTitle}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {formatNaira(activeConversation.productPrice)}
              </span>
            </div>
          </div>

          {referencedProduct && (
            <button
              id="chat-view-item-btn"
              onClick={() => setViewProductDetail(referencedProduct)}
              className="text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 shrink-0 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View Item</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Safety Warning in Chat */}
        <div className="bg-amber-50/90 border-b border-amber-100 px-3 py-1.5 flex items-center gap-2 text-[11px] text-amber-900">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Keep transactions on campus. Inspect item in public before paying.</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {activeConversation.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-white px-3 pt-2 pb-1 border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
          {QUICK_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSend(suggestion)}
              className="whitespace-nowrap text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="chat-message-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message (negotiate price, pick meetup spot)..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition bg-slate-50 focus:bg-white text-slate-800"
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Conversations List View
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Campus Messages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct student chats without exposing phone numbers.
          </p>
        </div>
        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
          {userConversations.length} Active
        </span>
      </div>

      {userConversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No active conversations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you chat with a student seller or someone inquires about your item, messages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {userConversations.map((conv) => {
            const isBuyer = conv.buyerId === currentUser.id;
            const otherName = isBuyer ? conv.sellerName : conv.buyerName;
            const unreadCount = conv.unreadCountForUser[currentUser.id] || 0;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                onClick={() => setActiveConversation(conv)}
                className="p-3.5 sm:p-4 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3.5"
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.productImage || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80'}
                    alt={conv.productTitle}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {otherName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{conv.lastUpdated}</span>
                  </div>

                  <div className="text-xs font-semibold text-emerald-700 truncate">
                    {conv.productTitle} • {formatNaira(conv.productPrice)}
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

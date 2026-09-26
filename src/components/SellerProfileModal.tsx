import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Flag, 
  Ban, 
  Clock, 
  CheckCircle, 
  Package, 
  Building2, 
  GraduationCap, 
  Sparkles,
  Share2,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { User, Product, Review } from '../types';
import { formatNaira } from '../utils/formatters';
import { useMarket } from '../context/MarketContext';

interface SellerProfileModalProps {
  seller: User;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({ 
  seller, 
  onClose,
  onSelectProduct
}) => {
  const { 
    currentUser, 
    products, 
    reviews, 
    startOrOpenChat, 
    blockUser, 
    unblockUser, 
    isUserBlocked, 
    reportListing, 
    showToast 
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious Activity');
  const [reportNotes, setReportNotes] = useState('');

  const sellerProducts = products.filter(p => p.sellerId === seller.id && p.status !== 'removed');
  const sellerReviews = reviews.filter(r => r.sellerId === seller.id);
  const isBlocked = isUserBlocked(seller.id);

  const handleMessage = () => {
    if (seller.id === currentUser.id) {
      showToast('This is your own profile!');
      return;
    }
    const sampleProduct = sellerProducts[0];
    if (sampleProduct) {
      startOrOpenChat(sampleProduct, `Hi ${seller.fullName}! I came across your student profile on StudentPlug NG.`);
    } else {
      showToast('No active listings found to chat about.');
    }
    onClose();
  };

  const handleToggleBlock = () => {
    if (isBlocked) {
      unblockUser(seller.id);
    } else {
      blockUser(seller.id, seller.fullName);
    }
  };

  const handleReportSeller = (e: React.FormEvent) => {
    e.preventDefault();
    // Use first product or placeholder for report
    const targetListingId = sellerProducts[0]?.id || 'seller_profile';
    reportListing(targetListingId, 'Other', `[SELLER REPORT: ${seller.fullName}]: ${reportReason} - ${reportNotes}`);
    setShowReportDialog(false);
    showToast('Report submitted for moderation.');
  };

  return (
    <div 
      id="seller-profile-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="seller-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative">
              <img 
                src={seller.avatar} 
                alt={seller.fullName} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md"
              />
              {seller.isVerified && (
                <div 
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow-sm"
                  title="Verified Student Seller"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-white">{seller.fullName}</h2>
                {seller.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Student
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </div>

              <div className="text-xs text-emerald-200/90 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{seller.school}</span>
              </div>

              <div className="text-[11px] text-slate-300 mt-0.5">
                {seller.campus} {seller.department && `• ${seller.department}`} {seller.level && `(${seller.level})`}
              </div>

              {seller.bio && (
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-md italic">
                  "{seller.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{seller.rating ? seller.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Rating</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-white block">
                {seller.completedSalesCount || sellerReviews.length * 2 || 12}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Completed</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-white block">
                {sellerProducts.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Listings</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-emerald-300 block truncate">
                {seller.responseRate ? 'Fast' : 'Under 15m'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Replies</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          {currentUser.id !== seller.id && (
            <button
              onClick={handleMessage}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Seller</span>
            </button>
          )}

          <button
            onClick={handleToggleBlock}
            className={`py-2 px-3 border rounded-xl font-medium flex items-center gap-1.5 transition ${
              isBlocked 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{isBlocked ? 'Unblock' : 'Block'}</span>
          </button>

          <button
            onClick={() => setShowReportDialog(true)}
            className="py-2 px-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Report Dialog Inline */}
        {showReportDialog && (
          <form onSubmit={handleReportSeller} className="p-4 bg-red-50/70 border-b border-red-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Report Student Profile to Campus Moderators
              </span>
              <button 
                type="button" 
                onClick={() => setShowReportDialog(false)} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white border border-red-200 rounded-lg p-2 text-slate-800"
            >
              <option value="Suspicious Activity">Suspicious Activity / Scam Warning</option>
              <option value="Not a Real Student">Falsified Student Credentials</option>
              <option value="Unresponsive / Ghosting">Ghosting / Unfulfilled Orders</option>
              <option value="Offensive Content">Harassment or Offensive Conduct</option>
            </select>
            <input
              type="text"
              required
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Provide specific details for campus liaison investigation..."
              className="w-full bg-white border border-red-200 rounded-lg p-2 text-slate-800"
            />
            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              Submit Report to Safety Team
            </button>
          </form>
        )}

        {/* Tabs: Listings vs Reviews */}
        <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600 bg-white">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listings ({sellerProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Verified Reviews ({sellerReviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'listings' ? (
            sellerProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <Package className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No active listings currently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sellerProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(product);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:shadow-md transition cursor-pointer flex flex-col group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                      <img 
                        src={product.images[0] || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80'} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.isDeal && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-md">
                          DEAL
                        </span>
                      )}
                      {product.itemType === 'service' && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                          SERVICE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block truncate">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition">
                      {product.title}
                    </h4>
                    <div className="mt-auto pt-1 flex items-baseline justify-between">
                      <span className="text-xs font-black text-slate-900">
                        {formatNaira((product.isDeal && product.discountPrice) ? product.discountPrice : product.price)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {product.condition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            sellerReviews.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <Star className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No reviews received yet.</p>
                <p className="text-[11px] text-slate-400">Reviews appear here after buyers complete and rate campus orders.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellerReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={rev.buyerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} 
                          alt={rev.buyerName} 
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{rev.buyerName}</span>
                          <span className="text-[10px] text-slate-500">{rev.buyerSchool}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs">"{rev.comment}"</p>

                    {rev.productComment && (
                      <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-600">
                        <strong className="text-slate-800">Product Note:</strong> {rev.productComment}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Order: {rev.productTitle}</span>
                      <span>{rev.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

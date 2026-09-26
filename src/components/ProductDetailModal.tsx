import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageSquare, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  CheckCircle, 
  Flag, 
  Share2, 
  Truck, 
  UserCheck, 
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onOpenReportModal: (product: Product) => void;
  onOpenOrderModal?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  onOpenReportModal,
}) => {
  const { 
    currentUser, 
    isFavourite, 
    toggleFavourite, 
    startOrOpenChat,
    setCheckoutTargetProduct,
    setIsCheckoutModalOpen,
    openSellerProfile,
    toggleBoostProduct,
    showToast
  } = useMarket();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const saved = isFavourite(product.id);
  const isOwner = currentUser.id === product.sellerId;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    } else {
      showToast('Sharing item on campus!');
    }
  };

  const handleBuyNow = () => {
    setCheckoutTargetProduct(product);
    setIsCheckoutModalOpen(true);
    onClose();
  };

  const handleChat = () => {
    startOrOpenChat(product);
    onClose();
  };

  const handleViewSeller = () => {
    openSellerProfile(product.sellerId);
    onClose();
  };

  const handleBoost = () => {
    toggleBoostProduct(product.id);
    onClose();
  };

  const effectivePrice = (product.isDeal && product.discountPrice) ? product.discountPrice : product.price;

  return (
    <div 
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="product-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {product.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                product.condition === 'New'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {product.condition}
            </span>
            {product.itemType === 'service' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Service
              </span>
            )}
            {product.isDeal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-0.5">
                <Tag className="w-3 h-3" /> Deal
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="detail-fav-btn"
              onClick={() => toggleFavourite(product.id)}
              className={`p-2 rounded-full transition cursor-pointer ${
                saved ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-200/60'
              }`}
              title="Save to favourites"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Main Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Status Badge if sold */}
              {product.status === 'sold' && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                  <span className="bg-red-600 text-white font-extrabold text-sm tracking-wider px-4 py-1.5 rounded-md uppercase">
                    ITEM SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                      activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Header & Pricing */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  {formatNaira(effectivePrice)}
                </span>
                {product.isDeal && product.discountPrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    {formatNaira(product.price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Posted {product.datePosted}
                </span>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Location & School tag */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.sellerSchool}</span>
              </div>
              <div className="text-slate-500 text-xs">
                {product.locationDetails}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Description
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Delivery & Pickup Options */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Available Fulfillment / Campus Pickup:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.deliveryOptions.map((opt, i) => (
                <span 
                  key={i}
                  className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium shadow-2xs"
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>

          {/* Seller Card with Profile link */}
          <div 
            onClick={handleViewSeller}
            className="bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start justify-between gap-3 cursor-pointer transition group"
          >
            <div className="flex items-center gap-3">
              <img
                src={product.sellerAvatar}
                alt={product.sellerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition">
                    {product.sellerName}
                  </span>
                  {product.sellerVerified && (
                    <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified Student
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{product.sellerSchool}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.9 Rating
                  </span>
                  <span>• Replies fast (within 15m)</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:underline">
              View Profile <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Safety Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Student Safety Tips:</p>
              <p className="text-amber-800 leading-snug">
                Never send advance off-platform payments to private bank accounts! Always meet in broad daylight at designated campus spots like the Student Union Building, Main Library, or Faculty common rooms.
              </p>
            </div>
          </div>

          {/* Report listing trigger */}
          <div className="pt-2 flex justify-end">
            <button
              id="trigger-report-listing-btn"
              onClick={() => onOpenReportModal(product)}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
            >
              <Flag className="w-3.5 h-3.5" /> Report suspicious listing
            </button>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 sm:gap-3">
          {isOwner ? (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 text-xs text-slate-600 font-medium py-2 px-3 bg-slate-200/70 rounded-xl">
                This is your campus listing.
              </div>
              <button
                onClick={handleBoost}
                className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Promote</span>
              </button>
            </div>
          ) : (
            <>
              {/* Chat with Seller Button */}
              <button
                id="detail-chat-seller-btn"
                onClick={handleChat}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Chat Seller</span>
              </button>

              {/* Order / Buy Now Button */}
              <button
                id="detail-order-now-btn"
                onClick={handleBuyNow}
                disabled={product.status === 'sold'}
                className={`flex-1 py-2.5 px-3 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                  product.status === 'sold'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.status === 'sold' ? 'Sold Out' : 'Buy / Checkout'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

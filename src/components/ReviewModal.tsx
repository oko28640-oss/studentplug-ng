import React, { useState } from 'react';
import { X, Star, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { useMarket } from '../context/MarketContext';

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose }) => {
  const { addReview, showToast } = useMarket();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [productComment, setProductComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please write a short review regarding your experience with the seller.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addReview(order.id, rating, comment.trim(), productComment.trim() || undefined);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div 
      id="review-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="review-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Rate Seller & Product</h2>
              <span className="text-[11px] text-slate-400">Order #{order.orderNumber || order.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Order preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <img 
              src={order.productImage} 
              alt={order.productTitle} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">{order.productTitle}</h4>
              <span className="text-[11px] text-slate-500 block">Seller: {order.sellerName}</span>
            </div>
          </div>

          {/* Star rating selector */}
          <div className="text-center py-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Overall Experience</span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-slate-200'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-1 block">
              {rating === 5 && 'Outstanding! (5/5)'}
              {rating === 4 && 'Good Experience (4/5)'}
              {rating === 3 && 'Average (3/5)'}
              {rating === 2 && 'Disappointed (2/5)'}
              {rating === 1 && 'Poor (1/5)'}
            </span>
          </div>

          {/* Comment on Seller */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">
              Seller Feedback & Punctuality
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Arrived right on time at the SUB, very polite and polite studentpreneur. Would definitely buy again!"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 resize-none text-slate-800"
            />
          </div>

          {/* Product Condition Feedback */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">
              Product Performance / Condition (Optional)
            </label>
            <input
              type="text"
              value={productComment}
              onChange={(e) => setProductComment(e.target.value)}
              placeholder="e.g. Battery lasted through the entire night lecture!"
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-800"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Review...' : 'Submit Verified Campus Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

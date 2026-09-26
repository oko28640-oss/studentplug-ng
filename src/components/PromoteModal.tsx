import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Flame, CreditCard } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';
import { useMarket } from '../context/MarketContext';

interface PromoteModalProps {
  product: Product;
  onClose: () => void;
}

export const PromoteModal: React.FC<PromoteModalProps> = ({ product, onClose }) => {
  const { promoteListing, showToast } = useMarket();
  const [selectedDuration, setSelectedDuration] = useState<'24h' | '3d' | '7d'>('3d');
  const [isProcessing, setIsProcessing] = useState(false);

  const promotionTiers = [
    {
      id: '24h' as const,
      name: '24 Hours Spotlight',
      fee: 500,
      description: 'Top placement in campus search & category feed for 1 full day.',
      badge: 'Quick Boost',
    },
    {
      id: '3d' as const,
      name: '3 Days Featured',
      fee: 1200,
      description: 'Pinned to homepage "Featured Campus Finds" section. Best value for quick sales.',
      badge: 'Most Popular',
      popular: true,
    },
    {
      id: '7d' as const,
      name: '7 Days Campus Mega Boost',
      fee: 2500,
      description: 'Maximum reach across entire university feed, instant push alert to followers.',
      badge: 'Maximum Reach',
    }
  ];

  const currentTier = promotionTiers.find(t => t.id === selectedDuration)!;

  const handlePromote = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockRef = `PSTK_PROMO_${Date.now()}`;
      promoteListing(product.id, selectedDuration, currentTier.fee, mockRef);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div 
      id="promote-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="promote-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Promote Listing</h2>
              <span className="text-[11px] text-amber-100">Get 5x more views and faster student buyers</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Target Product */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <img 
              src={product.images[0] || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80'} 
              alt={product.title} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
              <span className="text-xs font-black text-slate-900">{formatNaira(product.price)}</span>
            </div>
          </div>

          {/* Promotion Options */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-900 block">
              Select Promotion Duration:
            </label>

            {promotionTiers.map((tier) => (
              <label 
                key={tier.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedDuration === tier.id 
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="radio"
                  name="promo_tier"
                  value={tier.id}
                  checked={selectedDuration === tier.id}
                  onChange={() => setSelectedDuration(tier.id)}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                    <span className="text-xs font-black text-amber-700">{formatNaira(tier.fee)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{tier.description}</p>
                  {tier.popular && (
                    <span className="inline-block mt-1 text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                      ★ Highly Recommended
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Paystack Test Gateway Info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Payment Gateway:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Paystack Sandbox Checkout
            </span>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePromote}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isProcessing 
                ? 'Processing Paystack...' 
                : `Pay ${formatNaira(currentTier.fee)} & Boost Listing`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

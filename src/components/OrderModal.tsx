import React, { useState } from 'react';
import { X, ShoppingBag, MapPin, CheckCircle, ShieldCheck, Clock, Truck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const { currentUser, placeOrder, setActiveTab, showToast } = useMarket();

  const [deliveryOption, setDeliveryOption] = useState<string>(product.deliveryOptions[0] || 'Meet at SUB');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState(currentUser.phone);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetupLocation.trim()) {
      setErrorMsg('Please specify a pickup or hostel delivery spot.');
      return;
    }

    try {
      placeOrder(product.id, deliveryOption, meetupLocation.trim(), notes.trim());
      onClose();
      setActiveTab('profile'); // takes them to orders tab in profile
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order');
    }
  };

  return (
    <div 
      id="order-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="order-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Request Campus Meetup / Order
            </h2>
          </div>
          <button
            id="order-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Form */}
        <form onSubmit={handlePlaceOrder} className="p-5 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Product Summary */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 truncate">{product.title}</h4>
              <p className="text-xs text-slate-500 truncate">{product.sellerSchool}</p>
              <div className="text-emerald-700 font-extrabold text-sm mt-0.5">
                {formatNaira(product.price)}
              </div>
            </div>
          </div>

          {/* Delivery / Meetup Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Pickup / Delivery Preference *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.deliveryOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDeliveryOption(opt)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    deliveryOption === opt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {deliveryOption === opt && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Exact Meeting Spot */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Preferred Meetup Location / Hostel Room *
            </label>
            <input
              id="order-location-input"
              type="text"
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              placeholder="e.g. SUB Fountain, Library Ground Floor, or New Hall B Block"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition text-slate-800"
              required
            />
          </div>

          {/* Contact Phone (Shared only with seller for meetup confirmation) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Contact Phone (For Meetup Coordination)
            </label>
            <input
              id="order-phone-input"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Only revealed to this seller once they confirm the order.
            </span>
          </div>

          {/* Note to Seller */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Note to Seller (Optional)
            </label>
            <textarea
              id="order-note-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Free after 2pm lecture; please bring original packaging."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition text-slate-800"
            />
          </div>

          {/* Safe Cash/Transfer Notice */}
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Pay on Inspection:</strong> No advance payment required. Inspect the item physically on campus, then pay the seller in cash or instant bank transfer.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-place-order-btn"
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Confirm Campus Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

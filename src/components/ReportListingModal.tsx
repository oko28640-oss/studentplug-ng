import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Product, ListingReport } from '../types';
import { useMarket } from '../context/MarketContext';

interface ReportListingModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({ product, onClose }) => {
  const { reportListing } = useMarket();

  const [reason, setReason] = useState<ListingReport['reason']>('Scam / Suspicious');
  const [details, setDetails] = useState('');

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportListing(product.id, reason, details.trim() || 'No additional details provided.');
    onClose();
  };

  return (
    <div 
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="report-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2 text-rose-700">
            <Flag className="w-4 h-4" />
            <h3 className="font-bold text-sm">Report Campus Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
            <span className="font-semibold block text-slate-900 truncate">
              {product.title}
            </span>
            <span className="text-[11px] text-slate-500">
              Seller: {product.sellerName} ({product.sellerSchool})
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 text-[11px]">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ListingReport['reason'])}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-rose-600 outline-hidden bg-white text-slate-800"
            >
              <option value="Scam / Suspicious">Scam / Suspicious Item or Advance Fee Request</option>
              <option value="Counterfeit Item">Counterfeit / Fake Product</option>
              <option value="Inappropriate Content">Inappropriate / Banned Campus Item</option>
              <option value="Extortionate Price">Extortionate or Misleading Price</option>
              <option value="Wrong Category">Wrong Category or False Description</option>
              <option value="Other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 text-[11px]">
              Additional Details *
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please describe what makes this listing suspicious or harmful to students..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-rose-600 outline-hidden text-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

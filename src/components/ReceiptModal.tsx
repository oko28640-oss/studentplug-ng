import React from 'react';
import { 
  X, 
  CheckCircle, 
  Copy, 
  Download, 
  Printer, 
  ShieldCheck, 
  Store, 
  Building2, 
  Calendar, 
  Hash, 
  CreditCard 
} from 'lucide-react';
import { PaymentReceipt } from '../types';
import { formatNaira } from '../utils/formatters';
import { useMarket } from '../context/MarketContext';

interface ReceiptModalProps {
  receipt: PaymentReceipt;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { showToast } = useMarket();

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(receipt.transactionRef);
      showToast('Transaction reference copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="receipt-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest font-mono uppercase text-emerald-300">OFFICIAL RECEIPT</span>
              <h2 className="text-base font-black text-white">StudentPlug NG</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Status Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-center">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-1.5 shadow-sm">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-emerald-900 block">Payment Verified & Order Confirmed</span>
          <span className="text-[11px] text-emerald-700 font-medium">Funds held securely in campus escrow</span>
        </div>

        {/* Receipt Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Amount Paid Big Display */}
          <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Paid</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatNaira(receipt.totalPaid)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Provider: {receipt.paymentMethod === 'paystack' ? 'Paystack Sandbox' : receipt.paymentMethod}
            </span>
          </div>

          {/* Reference & Order Details */}
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-900">{receipt.orderNumber}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-mono text-slate-700">{receipt.receiptNumber}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-500">Transaction Ref:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] font-semibold text-slate-800">{receipt.transactionRef}</span>
                <button 
                  onClick={handleCopyRef}
                  className="text-emerald-700 hover:text-emerald-900 p-1"
                  title="Copy Ref"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-500">Date & Time:</span>
              <span className="text-slate-700">{receipt.paidAt}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <span className="font-bold text-slate-900 block">{receipt.productTitle}</span>
                <span className="text-[10px] text-slate-500">Seller: {receipt.sellerName}</span>
              </div>
              <span className="font-semibold text-slate-900">{formatNaira(receipt.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Campus Delivery / Meetup Fee:</span>
              <span className="font-medium text-slate-800">
                {receipt.deliveryFee === 0 ? 'Free' : formatNaira(receipt.deliveryFee)}
              </span>
            </div>
          </div>

          {/* Parties involved */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{receipt.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-700">{receipt.buyerEmail}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handleCopyRef}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Reference</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

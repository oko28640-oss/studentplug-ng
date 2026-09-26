import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  ChevronRight, 
  Lock, 
  Copy, 
  ArrowLeft,
  Info,
  Clock,
  ExternalLink,
  Sparkles,
  Check
} from 'lucide-react';
import { Product, Order, PaymentReceipt, PaymentRecord } from '../types';
import { formatNaira } from '../utils/formatters';
import { useMarket } from '../context/MarketContext';
import { CAMPUS_MEETUP_POINTS, INSTITUTIONS } from '../data/mockData';
import { paymentService } from '../services/paymentService';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onSuccessOrder?: (order: Order, receipt?: PaymentReceipt) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  product, 
  onClose,
  onSuccessOrder
}) => {
  const { currentUser, showToast, completeCheckoutOrder } = useMarket();

  // Step management: 'details' -> 'paystack_sandbox' -> 'confirmation'
  const [step, setStep] = useState<'details' | 'paystack_sandbox' | 'confirmation'>('details');

  // Delivery & Pickup State
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedMeetupPoint, setSelectedMeetupPoint] = useState<string>(
    CAMPUS_MEETUP_POINTS[0].name
  );
  const [customMeetupNote, setCustomMeetupNote] = useState('');
  const [hostelRoomAddress, setHostelRoomAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.phone || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'pay_on_inspection'>('paystack');

  // Paystack Sandbox State
  const [sandboxTab, setSandboxTab] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('4084 0841 0000 0000');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('408');
  const [cardPin, setCardPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Resulting Order and Receipt
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<PaymentReceipt | null>(null);

  // Calculate pricing
  const effectiveProductPrice = (product.isDeal && product.discountPrice) ? product.discountPrice : product.price;
  const deliveryFee = fulfillmentType === 'delivery' ? 500 : 0;
  const totalAmount = effectiveProductPrice + deliveryFee;

  // Selected school meetup points
  const institution = INSTITUTIONS.find(inst => inst.name === (product.sellerSchool || currentUser.school));
  const availableMeetups = institution?.meetupPoints || CAMPUS_MEETUP_POINTS.map(p => p.name);

  // Handle Proceed from Details
  const handleProceedToPayment = () => {
    if (!buyerPhone.trim()) {
      showToast('Please provide a contact phone number for delivery coordination.');
      return;
    }
    if (fulfillmentType === 'delivery' && !hostelRoomAddress.trim()) {
      showToast('Please enter your hostel name and room number for delivery.');
      return;
    }

    if (paymentMethod === 'pay_on_inspection') {
      // Direct Cash/Transfer on Meetup Order
      finalizeOrder(null, 'Pending');
    } else {
      // Launch Paystack Test Sandbox
      setStep('paystack_sandbox');
    }
  };

  // Finalize order creation via MarketContext
  const finalizeOrder = (ref: string | null, payStatus: 'Successful' | 'Pending') => {
    setIsProcessing(true);
    setPaymentError(null);

    const transactionRef = ref || `PSTK_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryLocation = fulfillmentType === 'pickup' 
      ? `${selectedMeetupPoint}${customMeetupNote ? ` (${customMeetupNote})` : ''}`
      : `Hostel Delivery: ${hostelRoomAddress}`;

    setTimeout(() => {
      try {
        const orderData: Partial<Order> = {
          productId: product.id,
          productTitle: product.title,
          productPrice: effectiveProductPrice,
          productImage: product.images[0] || '',
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          sellerSchool: product.sellerSchool,
          buyerId: currentUser.id,
          buyerName: currentUser.fullName,
          buyerSchool: currentUser.school,
          buyerPhone: buyerPhone,
          fulfillmentType: fulfillmentType,
          deliveryOption: fulfillmentType === 'pickup' ? 'Campus Safe Meetup' : 'Hostel Room Delivery',
          meetupLocation: deliveryLocation,
          deliveryFee: deliveryFee,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          paymentStatus: payStatus,
          transactionRef: transactionRef,
          notes: orderNotes,
          status: payStatus === 'Successful' ? 'Confirmed' : 'Pending',
        };

        const paymentData: Partial<PaymentRecord> = {
          orderId: '', // Filled in completeCheckoutOrder
          orderNumber: '',
          productTitle: product.title,
          userId: currentUser.id,
          userName: currentUser.fullName,
          amount: effectiveProductPrice,
          deliveryFee: deliveryFee,
          totalAmount: totalAmount,
          currency: 'NGN',
          provider: 'paystack',
          status: payStatus,
          reference: transactionRef,
          channel: sandboxTab,
        };

        const result = completeCheckoutOrder(orderData, paymentData);
        setCreatedOrder(result.order);
        setCreatedReceipt(result.receipt);
        setStep('confirmation');
        setIsProcessing(false);

        if (onSuccessOrder) {
          onSuccessOrder(result.order, result.receipt);
        }
      } catch (err: any) {
        setIsProcessing(false);
        setPaymentError(err.message || 'Unable to complete order. Please retry.');
      }
    }, 800);
  };

  const handleSimulatePaystackSuccess = () => {
    setIsProcessing(true);
    setPaymentError(null);
    const mockRef = `PSTK_SANDBOX_${Date.now()}_OK`;
    finalizeOrder(mockRef, 'Successful');
  };

  const handleSimulatePaystackFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentError('Payment declined by card issuer: Insufficient test funds or 3DS timeout.');
    }, 600);
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {step !== 'details' && step !== 'confirmation' && (
              <button 
                onClick={() => setStep('details')}
                className="text-slate-400 hover:text-white p-1 rounded-full transition mr-1"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                {step === 'details' && 'Campus Checkout & Escrow'}
                {step === 'paystack_sandbox' && 'Paystack Sandbox Test Gateway'}
                {step === 'confirmation' && 'Order & Payment Confirmed'}
              </h2>
              <span className="text-[11px] text-slate-400">StudentPlug NG Protected Transaction</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: DETAILS & FULFILLMENT */}
        {step === 'details' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Product Summary Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3.5">
              <img 
                src={product.images[0] || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80'} 
                alt={product.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {product.category}
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate">{product.title}</h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seller: {product.sellerName}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {formatNaira(effectiveProductPrice)}
                  </span>
                  {product.isDeal && product.discountPrice && (
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery / Pickup Method */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>1. Select Delivery or Meetup Option</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    fulfillmentType === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Campus Safe Meetup</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      Free
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Meet at verified spots like the SUB, Library foyer or Gate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    fulfillmentType === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Hostel Delivery</span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      +₦500
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Direct door-to-door dispatch to your campus hostel
                  </span>
                </button>
              </div>

              {/* Pickup location options */}
              {fulfillmentType === 'pickup' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Select Campus Meetup Landmark ({institution?.shortName || 'Campus'}):
                    </label>
                    <select
                      value={selectedMeetupPoint}
                      onChange={(e) => setSelectedMeetupPoint(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-emerald-600"
                    >
                      {availableMeetups.map((spot, idx) => (
                        <option key={idx} value={spot}>{spot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Specific spot or time notes (optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Under the mango tree beside faculty entrance by 2pm"
                      value={customMeetupNote}
                      onChange={(e) => setCustomMeetupNote(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Hostel delivery options */}
              {fulfillmentType === 'delivery' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Hostel Name, Block & Room Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Moremi Hall, Block B, Room 214"
                      value={hostelRoomAddress}
                      onChange={(e) => setHostelRoomAddress(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">
                2. Your Phone Number (for WhatsApp / Call delivery updates)
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+234 812 345 6789"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-emerald-600"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>3. Choose Payment Method</span>
              </label>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'paystack'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="payment_choice"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={() => setPaymentMethod('paystack')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Pay with Paystack (Cards, Bank Transfer, USSD)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          TEST MODE
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Recommended. Secured in escrow until you verify item condition.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'pay_on_inspection'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="payment_choice"
                    value="pay_on_inspection"
                    checked={paymentMethod === 'pay_on_inspection'}
                    onChange={() => setPaymentMethod('pay_on_inspection')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Pay on Inspection (Meetup Cash / Bank Transfer)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay physically only AFTER inspecting the item at the meetup location.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Trust & Safety notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Safety Rule:</strong> Never send advance money to a personal bank account before physically verifying your product at an active campus spot.
              </span>
            </div>

            {/* Order Summary Total */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Item Subtotal:</span>
                <span>{formatNaira(effectiveProductPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Campus Delivery Fee:</span>
                <span>{deliveryFee === 0 ? 'Free (Meetup)' : formatNaira(deliveryFee)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Total Due:</span>
                <span className="text-xl font-black text-emerald-400">{formatNaira(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAYSTACK SANDBOX GATEWAY (REALISTIC TEST UI) */}
        {step === 'paystack_sandbox' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Paystack Header Banner */}
            <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    PAYSTACK TEST CHECKOUT
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">StudentPlug NG Escrow</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Amount to Pay</span>
                <span className="text-base font-black text-emerald-300">{formatNaira(totalAmount)}</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Sandbox Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setSandboxTab('card')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  sandboxTab === 'card'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Card (Test)
              </button>
              <button
                type="button"
                onClick={() => setSandboxTab('transfer')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  sandboxTab === 'transfer'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setSandboxTab('ussd')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  sandboxTab === 'ussd'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                USSD (*737#)
              </button>
            </div>

            {/* Tab: Card */}
            {sandboxTab === 'card' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Number (Paystack Test)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Use default test credentials</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Card PIN</label>
                  <input
                    type="password"
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Tab: Transfer */}
            {sandboxTab === 'transfer' && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-bold text-slate-900">Wema Bank / Paystack Titan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>9928174012</span>
                    <button 
                      onClick={() => showToast('Virtual account number copied!')}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-semibold text-slate-800">StudentPlug Escrow #{product.id.slice(-4)}</span>
                </div>
                <p className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
                  Send exact amount of {formatNaira(totalAmount)}. Account expires in 30 minutes.
                </p>
              </div>
            )}

            {/* Tab: USSD */}
            {sandboxTab === 'ussd' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2 text-xs">
                <span className="text-slate-500 block">Dial on your registered SIM:</span>
                <div className="text-lg font-mono font-black text-slate-900 py-1 bg-white rounded-xl border border-slate-200">
                  *737*000*8492#
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Follow the prompt on your phone to complete payment
                </span>
              </div>
            )}

            {/* Sandbox Simulation Quick Actions */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Sandbox Simulator Controls:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePaystackSuccess}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Simulate Success</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePaystackFailure}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Simulate Fail</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION & RECEIPT ACCESS */}
        {step === 'confirmation' && createdOrder && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                ORDER SUCCESSFUL
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {createdOrder.paymentStatus === 'Successful' 
                  ? 'Your payment was confirmed via Paystack. The seller has been notified for dispatch.'
                  : 'Your order was recorded! You will pay the seller upon physical inspection.'}
              </p>
            </div>

            {/* Order & Transaction Quick Cards */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">{createdOrder.orderNumber || createdOrder.id}</span>
              </div>
              {createdOrder.transactionRef && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-[11px] text-slate-700">{createdOrder.transactionRef}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment:</span>
                <span className="font-medium text-slate-800">{createdOrder.deliveryOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Spot:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{createdOrder.meetupLocation}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">Total Amount:</span>
                <span className="font-black text-emerald-700">{formatNaira(createdOrder.totalAmount || createdOrder.productPrice)}</span>
              </div>
            </div>

            {/* Actions: View Receipt / Done */}
            <div className="space-y-2 pt-2">
              {createdReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>View in My Orders</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* Modal Bottom Footer (Step 1 & 2 only) */}
        {step === 'details' && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Due:</span>
              <span className="text-base font-black text-slate-900">{formatNaira(totalAmount)}</span>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-sm hover:shadow"
            >
              <span>{paymentMethod === 'paystack' ? 'Proceed to Paystack' : 'Place Order'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MapPin, 
  CreditCard, 
  Receipt, 
  Star, 
  ChevronRight, 
  AlertCircle,
  Phone,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from '../utils/formatters';

export const OrdersView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    updateOrderStatus, 
    cancelOrder, 
    setReviewTargetOrder, 
    setIsReviewModalOpen,
    setReceiptTargetReceipt,
    setIsReceiptModalOpen,
    setActiveTab,
    showToast 
  } = useMarket();

  const [filterRole, setFilterRole] = useState<'buyer' | 'seller'>('buyer');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const userOrders = orders.filter(o => filterRole === 'buyer' ? o.buyerId === currentUser.id : o.sellerId === currentUser.id);

  const filteredOrders = userOrders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Confirmed':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const handleOpenReceipt = (order: Order) => {
    if (order.paymentReceipt) {
      setReceiptTargetReceipt(order.paymentReceipt);
      setIsReceiptModalOpen(true);
    } else {
      // Generate on-the-fly receipt
      const fallbackReceipt = {
        receiptNumber: `REC-${order.orderNumber || order.id}`,
        orderNumber: order.orderNumber || order.id,
        transactionRef: order.transactionRef || `REF_${order.id}`,
        productTitle: order.productTitle,
        buyerName: order.buyerName,
        buyerEmail: currentUser.email,
        sellerName: order.sellerName,
        subtotal: order.productPrice,
        deliveryFee: order.deliveryFee || 0,
        totalPaid: order.totalAmount || (order.productPrice + (order.deliveryFee || 0)),
        paymentMethod: order.paymentMethod || 'pay_on_inspection',
        paymentStatus: order.paymentStatus || 'Pending',
        paidAt: order.dateCreated,
      };
      setReceiptTargetReceipt(fallbackReceipt);
      setIsReceiptModalOpen(true);
    }
  };

  const handleRateOrder = (order: Order) => {
    setReviewTargetOrder(order);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Campus Orders & Escrow</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track student fulfillment, meetup handovers, Paystack payments, and verified reviews
          </p>
        </div>

        {/* Role Toggle: Buying vs Selling */}
        <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
          <button
            onClick={() => setFilterRole('buyer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterRole === 'buyer' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Orders (Buyer)
          </button>
          <button
            onClick={() => setFilterRole('seller')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterRole === 'seller' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Orders (Seller)
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl font-bold capitalize whitespace-nowrap transition cursor-pointer ${
              filterStatus.toLowerCase() === st.toLowerCase()
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No campus orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterRole === 'buyer' 
                ? "You haven't placed any orders yet. Browse your university marketplace to grab verified student items!"
                : "You have no incoming orders from fellow campus students yet."}
            </p>
          </div>
          {filterRole === 'buyer' && (
            <button
              onClick={() => setActiveTab('home')}
              className="mt-2 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Explore Campus Deals
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isBuyer = order.buyerId === currentUser.id;
            const isSeller = order.sellerId === currentUser.id;

            return (
              <div 
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-sm transition space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      #{order.orderNumber || order.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{order.dateCreated}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.paymentStatus === 'Successful' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      Payment: {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Product & Counterparty info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img 
                    src={order.productImage} 
                    alt={order.productTitle} 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {order.productTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{isBuyer ? `Seller: ${order.sellerName}` : `Buyer: ${order.buyerName}`}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-semibold">{order.buyerSchool}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-black text-slate-900 text-sm">
                        {formatNaira(order.totalAmount || order.productPrice)}
                      </span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {order.fulfillmentType === 'delivery' ? 'Hostel Delivery' : 'Campus Meetup'}
                      </span>
                      {order.transactionRef && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Ref: {order.transactionRef}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meetup / Delivery Details */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-700">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meetup Point / Address:</span>
                  </div>
                  <p className="text-slate-600 pl-5">
                    {order.meetupLocation} ({order.deliveryOption})
                  </p>
                  {order.notes && (
                    <p className="text-[11px] text-slate-500 pl-5 italic">
                      Note: "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReceipt(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>

                    {order.status === 'Completed' && isBuyer && !order.reviewed && (
                      <button
                        onClick={() => handleRateOrder(order)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {order.status === 'Completed' && order.reviewed && (
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                      </span>
                    )}
                  </div>

                  {/* Status Progression buttons for buyer & seller */}
                  <div className="flex items-center gap-2">
                    {isSeller && order.status === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                      >
                        Confirm Order
                      </button>
                    )}

                    {isSeller && order.status === 'Confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Shipped')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                      >
                        Ready for Handover
                      </button>
                    )}

                    {(isBuyer || isSeller) && (order.status === 'Confirmed' || order.status === 'Shipped') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Item Inspected & Received</span>
                      </button>
                    )}

                    {order.status === 'Pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

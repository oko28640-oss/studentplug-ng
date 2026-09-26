import React, { useState } from 'react';
import { 
  PlusCircle, 
  Tag, 
  TrendingUp, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Zap, 
  Eye, 
  ShoppingBag,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';

export const SellerDashboardView: React.FC = () => {
  const { 
    currentUser, 
    products, 
    orders, 
    conversations, 
    updateProduct, 
    deleteProduct, 
    markProductAsSold, 
    toggleBoostProduct, 
    setActiveTab, 
    setViewProductDetail 
  } = useMarket();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Seller's own listings
  const myListings = products.filter(p => p.sellerId === currentUser.id);
  const activeListings = myListings.filter(p => p.status === 'active');
  const soldListings = myListings.filter(p => p.status === 'sold');

  // Stats
  const totalValue = myListings.reduce((sum, p) => sum + p.price, 0);
  const completedOrders = orders.filter(o => o.sellerId === currentUser.id && o.status === 'Completed');
  const earnedRevenue = completedOrders.reduce((sum, o) => sum + o.productPrice, 0);
  const totalInquiries = conversations.filter(c => c.sellerId === currentUser.id).length;

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.price.toString());
    setEditTitle(p.title);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = parseFloat(editPrice);
    if (!isNaN(parsedPrice) && parsedPrice > 0 && editTitle.trim()) {
      updateProduct(editingProduct.id, {
        title: editTitle.trim(),
        price: parsedPrice,
      });
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seller Header & Quick Post CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Seller Hub & Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Manage your campus listings, track orders, and boost campus sales.
          </p>
        </div>
        <button
          id="seller-add-listing-btn"
          onClick={() => setActiveTab('sell')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Item</span>
        </button>
      </div>

      {/* Sales Statistics Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Items</span>
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{activeListings.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Live on campus feed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Sold Items</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{soldListings.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Marked as completed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Inventory</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 truncate">
            {formatNaira(totalValue)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Total listed value</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Student Chats</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalInquiries}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Buyer message threads</span>
        </div>
      </div>

      {/* Listings Management */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Your Campus Listings ({myListings.length})
        </h3>

        {myListings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Tag className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">You haven't listed any items yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Got a gas cylinder, mattress, old textbooks, phone, or fashion item? Post it now to sell to fellow students.
            </p>
            <button
              onClick={() => setActiveTab('sell')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Post Item Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          product.status === 'sold'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {product.status === 'sold' ? 'Sold' : 'Active'}
                      </span>
                      {product.isPromoted && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-current" /> Promoted
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {product.viewsCount} views • {product.favouritesCount} saves
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                      {product.title}
                    </h4>
                    <div className="text-sm font-extrabold text-emerald-700">
                      {formatNaira(product.price)}
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => setViewProductDetail(product)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Preview listing"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() => startEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Edit listing"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => toggleBoostProduct(product.id)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      product.isPromoted
                        ? 'text-indigo-700 bg-indigo-50'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                    title="Boost on campus"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{product.isPromoted ? 'Boosted' : 'Boost'}</span>
                  </button>

                  <button
                    onClick={() => markProductAsSold(product.id)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    {product.status === 'sold' ? 'Reactivate' : 'Mark Sold'}
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Edit Listing</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

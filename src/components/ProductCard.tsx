import React from 'react';
import { Heart, CheckCircle, MapPin, Eye, Zap, Sparkles, Tag, Wrench, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { isFavourite, toggleFavourite, setViewProductDetail, openSellerProfile } = useMarket();
  const saved = isFavourite(product.id);

  const displayPrice = (product.isDeal && product.discountPrice) ? product.discountPrice : product.price;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setViewProductDetail(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer text-left"
    >
      {/* Product Image Area */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />

        {/* Condition & Tags Chips */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
              product.condition === 'New'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {product.condition}
          </span>
          {product.isDeal && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-0.5 shadow-xs">
              <Tag className="w-2.5 h-2.5" /> DEAL
            </span>
          )}
          {product.itemType === 'service' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-0.5 shadow-xs">
              <Wrench className="w-2.5 h-2.5" /> SERVICE
            </span>
          )}
          {product.isPromoted && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 fill-current" /> BOOSTED
            </span>
          )}
        </div>

        {/* Favourite Button */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(product.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-colors z-10 cursor-pointer ${
            saved
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/85 hover:bg-white text-slate-600 hover:text-rose-500'
          }`}
          title={saved ? 'Remove from saved' : 'Save to favourites'}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Sold Overlay */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-15">
            <span className="bg-red-600 text-white font-extrabold text-xs tracking-wider px-3 py-1 rounded-sm uppercase transform -rotate-6">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-emerald-700 tracking-tight">
                {formatNaira(displayPrice)}
              </span>
              {product.isDeal && product.discountPrice && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatNaira(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {product.viewsCount}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition">
            {product.title}
          </h3>
        </div>

        {/* Campus & Seller Details */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-between text-slate-600">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openSellerProfile(product.sellerId);
              }}
              className="truncate font-bold flex items-center gap-1 text-slate-800 hover:text-emerald-700 transition cursor-pointer text-left"
            >
              <span className="truncate">{product.sellerName}</span>
              {product.sellerVerified && (
                <span title="Verified Campus Student" className="inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
            </button>
            <span className="text-[10px] text-slate-400 shrink-0">{product.datePosted}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{product.sellerSchool}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

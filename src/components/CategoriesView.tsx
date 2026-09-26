import React, { useState } from 'react';
import { 
  Shirt, 
  Footprints, 
  Sparkles, 
  Flame, 
  Utensils, 
  Tv, 
  Smartphone, 
  BookOpen, 
  Home, 
  Scissors, 
  Briefcase, 
  RefreshCw, 
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CATEGORIES_DATA } from '../data/mockData';
import { ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'Fashion & Clothing': <Shirt className="w-5 h-5" />,
  'Shoes & Bags': <Footprints className="w-5 h-5" />,
  'Beauty & Skincare': <Sparkles className="w-5 h-5" />,
  'Perfumes': <Flame className="w-5 h-5" />,
  'Food & Snacks': <Utensils className="w-5 h-5" />,
  'Electronics': <Tv className="w-5 h-5" />,
  'Phones & Accessories': <Smartphone className="w-5 h-5" />,
  'Books & School Materials': <BookOpen className="w-5 h-5" />,
  'Hostel Items': <Home className="w-5 h-5" />,
  'Hair & Wigs': <Scissors className="w-5 h-5" />,
  'Services': <Briefcase className="w-5 h-5" />,
  'Second-hand Items': <RefreshCw className="w-5 h-5" />,
  'Other': <Package className="w-5 h-5" />,
};

export const CategoriesView: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    selectedSchoolFilter 
  } = useMarket();

  const [activeSubFilter, setActiveSubFilter] = useState<'all' | 'new' | 'used'>('all');

  // Filter products by selectedCategory and optionally school and condition
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    if (selectedSchoolFilter !== 'All' && p.sellerSchool !== selectedSchoolFilter) {
      return false;
    }
    if (activeSubFilter === 'new' && p.condition !== 'New') return false;
    if (activeSubFilter === 'used' && p.condition !== 'Used') return false;
    return p.status === 'active';
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Browse Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore student essentials across Nigerian campuses.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
            selectedCategory === 'All'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className={`p-2 rounded-xl shrink-0 ${
            selectedCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs block">All Items</span>
            <span className="text-[11px] text-slate-400">{products.length} products</span>
          </div>
        </button>

        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const count = products.filter(p => p.category === cat.name).length;

          return (
            <button
              key={cat.name}
              id={`cat-btn-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {CATEGORY_ICON_MAP[cat.name] || <Package className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs block truncate leading-tight">{cat.name}</span>
                <span className="text-[11px] text-slate-400">{count} on campus</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Products under current category */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {selectedCategory === 'All' ? 'All Campus Listings' : selectedCategory}
            </h2>
            <span className="text-xs text-slate-500">
              Showing {filteredProducts.length} items
              {selectedSchoolFilter !== 'All' ? ` around ${selectedSchoolFilter}` : ''}
            </span>
          </div>

          {/* Condition Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['all', 'used', 'new'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveSubFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                  activeSubFilter === filter
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'all' ? 'All Conditions' : filter}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No items found in this category</h3>
            <p className="text-xs text-slate-500">
              Try switching your campus filter or be the first student to post an item in {selectedCategory}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CATEGORIES_DATA, INSTITUTIONS } from '../data/mockData';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    category: string;
    condition: 'All' | 'New' | 'Used';
    minPrice: string;
    maxPrice: string;
    sortBy: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    school: string;
  }) => void;
  currentFilters: {
    category: string;
    condition: 'All' | 'New' | 'Used';
    minPrice: string;
    maxPrice: string;
    sortBy: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    school: string;
  };
}

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [category, setCategory] = useState(currentFilters.category);
  const [condition, setCondition] = useState(currentFilters.condition);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);
  const [school, setSchool] = useState(currentFilters.school);

  if (!isOpen) return null;

  const handleReset = () => {
    setCategory('All');
    setCondition('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    setSchool('All');
  };

  const handleApply = () => {
    onApplyFilters({
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy,
      school,
    });
    onClose();
  };

  return (
    <div 
      id="filter-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="filter-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Filter Marketplace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* Sort Order */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[11px]">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'recent', label: 'Most Recent' },
                { id: 'popular', label: 'Most Popular' },
                { id: 'price_asc', label: 'Price: Low to High' },
                { id: 'price_desc', label: 'Price: High to Low' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                    sortBy === s.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition: All / New / Used */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[11px]">
              Item Condition
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['All', 'Used', 'New'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                    condition === c
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c === 'All' ? 'Any Condition' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range (₦) */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[11px]">
              Price Range in Naira (₦)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min Price (₦)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Price (₦)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[11px]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white"
            >
              <option value="All">All Categories</option>
              {CATEGORIES_DATA.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campus / School */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[11px]">
              Institution Location
            </label>
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white"
            >
              <option value="All">All Campuses</option>
              {INSTITUTIONS.map((inst) => (
                <option key={inst.name} value={inst.name}>
                  {inst.name} ({inst.shortName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="apply-filter-modal-btn"
            onClick={handleApply}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

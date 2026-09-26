import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  Building2, 
  X, 
  RotateCcw, 
  Briefcase, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  Layers,
  AlertCircle
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES_DATA, INSTITUTIONS } from '../data/mockData';
import { searchMarketplace, SearchFilterOptions } from '../utils/searchHelper';

export const SearchResultsView: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    executeSearch, 
    products, 
    currentUser, 
    selectedSchoolFilter, 
    setSelectedSchoolFilter,
    setActiveTab, 
    institutions 
  } = useMarket();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // Filter States
  const [category, setCategory] = useState<string>('All');
  const [school, setSchool] = useState<string>(selectedSchoolFilter !== 'All' ? selectedSchoolFilter : 'All');
  const [condition, setCondition] = useState<'All' | 'New' | 'Used'>('All');
  const [itemType, setItemType] = useState<'all' | 'product' | 'service'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevant' | 'recent' | 'price_asc' | 'price_desc' | 'popular'>('relevant');
  const [campusScope, setCampusScope] = useState<'my_campus' | 'all'>('my_campus');

  // Trigger search simulation with quick debounced loading state
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, category, school, condition, itemType, minPrice, maxPrice, sortBy, campusScope]);

  const currentInstitution = institutions.find(i => i.name === (school !== 'All' ? school : currentUser.school)) || 
    institutions.find(i => i.name === currentUser.school) || 
    institutions[0];

  const filterOptions: SearchFilterOptions = useMemo(() => ({
    category,
    school,
    condition,
    itemType,
    minPrice,
    maxPrice,
    sortBy,
    campusScope,
    userSchool: currentUser.school,
  }), [category, school, condition, itemType, minPrice, maxPrice, sortBy, campusScope, currentUser.school]);

  const searchResults = useMemo(() => {
    try {
      return searchMarketplace(searchQuery, products, filterOptions);
    } catch (e) {
      console.error('Search error:', e);
      setHasError(true);
      return [];
    }
  }, [searchQuery, products, filterOptions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== 'All') count++;
    if (school !== 'All') count++;
    if (condition !== 'All') count++;
    if (itemType !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (sortBy !== 'relevant') count++;
    if (campusScope !== 'my_campus') count++;
    return count;
  }, [category, school, condition, itemType, minPrice, maxPrice, sortBy, campusScope]);

  const handleResetFilters = () => {
    setCategory('All');
    setSchool('All');
    setCondition('All');
    setItemType('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevant');
    setCampusScope('my_campus');
  };

  const popularSuggestions = [
    'Perfume',
    'Shoes',
    'Phone',
    'Textbook',
    'Hair styling',
    'Food',
    'Laptop',
    'Graphic design'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 pb-28 space-y-4">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          id="back-to-home-btn"
          onClick={() => {
            setActiveTab('home');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-emerald-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Campus Scope Toggle (My Campus vs All Campuses) */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            id="search-scope-my-campus-btn"
            onClick={() => setCampusScope('my_campus')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              campusScope === 'my_campus'
                ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Campus:</span>
            <span>{currentInstitution?.shortName || 'My Campus'}</span>
          </button>
          <button
            id="search-scope-all-campuses-btn"
            onClick={() => setCampusScope('all')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              campusScope === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Campuses
          </button>
        </div>
      </div>

      {/* Search Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Marketplace Search</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery ? (
                <>Search results for <span className="text-emerald-700 font-black">"{searchQuery}"</span></>
              ) : (
                'All Campus Marketplace Listings'
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? (
                'Searching listings across student hubs...'
              ) : (
                <>
                  <span className="font-bold text-slate-700">{searchResults.length}</span> {searchResults.length === 1 ? 'listing' : 'listings'} found
                  {campusScope === 'my_campus' && (
                    <> directly inside <span className="font-medium text-emerald-800">{currentInstitution?.name}</span></>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              id="search-toggle-filters-btn"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                showFiltersPanel || activeFiltersCount > 0
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-emerald-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                id="search-reset-all-filters-btn"
                onClick={handleResetFilters}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Type Chips: All | Products | Services */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Type:</span>
          <button
            onClick={() => setItemType('all')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 cursor-pointer ${
              itemType === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setItemType('product')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
              itemType === 'product'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            Physical Goods
          </button>
          <button
            onClick={() => setItemType('service')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
              itemType === 'service'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            Campus Services
          </button>

          {/* Quick Condition Chips */}
          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0"></div>
          <button
            onClick={() => setCondition('All')}
            className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
              condition === 'All' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Any Condition
          </button>
          <button
            onClick={() => setCondition('New')}
            className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
              condition === 'New' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            New Only
          </button>
          <button
            onClick={() => setCondition('Used')}
            className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
              condition === 'Used' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Used Deals
          </button>
        </div>

        {/* Collapsible Detailed Filters Panel */}
        {showFiltersPanel && (
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            {/* Category */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                id="search-filter-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium text-slate-800"
              >
                <option value="All">All Categories</option>
                {CATEGORIES_DATA.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Institution / Campus */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution</label>
              <select
                id="search-filter-school"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (e.target.value !== 'All') {
                    setCampusScope('my_campus');
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium text-slate-800"
              >
                <option value="All">All Institutions</option>
                {INSTITUTIONS.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.shortName} - {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Price Range (₦)</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  placeholder="Min ₦"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden text-xs"
                />
                <input
                  type="number"
                  placeholder="Max ₦"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden text-xs"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sort By</label>
              <select
                id="search-filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium text-slate-800"
              >
                <option value="relevant">Campus Priority / Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="price_asc">Price: Lowest first</option>
                <option value="price_desc">Price: Highest first</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Content Area */}
      {isLoading ? (
        /* Loading Skeleton State */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3">
              <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded-md w-full"></div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        /* Error State */
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Search Error</h3>
            <p className="text-xs text-slate-500 mt-1">
              There was an issue processing your search. Please check your query and try again.
            </p>
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 200);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Retry Search
          </button>
        </div>
      ) : searchResults.length > 0 ? (
        /* Results Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60 shadow-2xs">
            <Search className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              No results found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find anything matching your search. Try another product, category, or campus.
            </p>
          </div>

          {/* Quick Search Chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Popular searches on campus:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {popularSuggestions.map((term) => (
                <button
                  key={term}
                  onClick={() => executeSearch(term)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-full transition font-medium cursor-pointer border border-transparent hover:border-emerald-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              id="empty-search-browse-categories-btn"
              onClick={() => setActiveTab('categories')}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Categories</span>
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

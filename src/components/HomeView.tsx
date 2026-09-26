import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Sparkles, 
  Flame, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  Wrench,
  Percent,
  Compass,
  CheckCircle2,
  Package,
  Layers
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CATEGORIES_DATA, SERVICES_CATEGORIES_DATA } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { formatNaira } from '../utils/formatters';

interface HomeViewProps {
  onOpenCampusModal: () => void;
  onOpenSafetyModal: () => void;
  onOpenFilterModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCampusModal,
  onOpenSafetyModal,
  onOpenFilterModal,
}) => {
  const { 
    currentUser, 
    products, 
    selectedSchoolFilter, 
    setSelectedSchoolFilter,
    campusScope,
    setCampusScope,
    institutions,
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    setSelectedCategory,
    setActiveTab,
    setViewProductDetail,
    setIsVerificationModalOpen
  } = useMarket();

  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'near_me' | 'deals' | 'services'>('all');

  const userInstitution = institutions.find(i => i.name === currentUser.school) || institutions[0];
  const currentInstitution = institutions.find(i => i.name === selectedSchoolFilter) || userInstitution;

  // Set of institutions in the same state or zone
  const nearbySchoolNames = useMemo(() => {
    const targetState = userInstitution?.state;
    const targetZone = userInstitution?.geoZone;
    return new Set(
      institutions
        .filter(i => (targetState && i.state === targetState) || (targetZone && i.geoZone === targetZone))
        .map(i => i.name)
    );
  }, [institutions, userInstitution]);

  // Counts for each scope
  const myCampusCount = useMemo(() => {
    const target = selectedSchoolFilter !== 'All' ? selectedSchoolFilter : currentUser.school;
    return products.filter(p => p.status === 'active' && p.sellerSchool === target).length;
  }, [products, selectedSchoolFilter, currentUser.school]);

  const nearbyCampusesCount = useMemo(() => {
    return products.filter(p => p.status === 'active' && (nearbySchoolNames.has(p.sellerSchool) || p.sellerSchool === currentUser.school)).length;
  }, [products, nearbySchoolNames, currentUser.school]);

  const allNigeriaCount = useMemo(() => {
    return products.filter(p => p.status === 'active').length;
  }, [products]);

  // Filter products according to search query, campusScope/school, and category
  const filteredProducts = products.filter((p) => {
    if (p.status === 'removed') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchSchool = p.sellerSchool.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory && !matchSchool) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }

    // Campus Scope filter
    if (campusScope === 'my_campus') {
      const activeSchool = selectedSchoolFilter !== 'All' ? selectedSchoolFilter : currentUser.school;
      if (p.sellerSchool !== activeSchool) return false;
    } else if (campusScope === 'nearby') {
      if (!nearbySchoolNames.has(p.sellerSchool) && p.sellerSchool !== currentUser.school) return false;
    }
    // If 'all', any campus is displayed

    // Section Tabs
    if (activeSectionTab === 'near_me') {
      if (p.sellerSchool !== currentUser.school) return false;
    } else if (activeSectionTab === 'services') {
      if (p.itemType !== 'service') return false;
    } else if (activeSectionTab === 'deals') {
      if (!p.isDeal && p.price > 25000) return false;
    }

    return true;
  });

  // Highlight collections
  const featuredProducts = products.filter(p => (p.isFeatured || p.isPromoted) && p.status === 'active');
  const studentDeals = products.filter(p => p.isDeal && p.status === 'active');
  const studentServices = products.filter(p => p.itemType === 'service' && p.status === 'active');
  const nearCampusProducts = products.filter(p => p.sellerSchool === currentUser.school && p.status === 'active');

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 pb-24 space-y-6">
      {/* Active Campus Header & Safety Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white p-4 sm:p-5 rounded-3xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Campus Community Marketplace</span>
              {!currentUser.isVerified && (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-300/30 text-[10px] px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Get Verified Student Badge
                </button>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{campusScope === 'all' ? 'All Nigerian Campuses' : selectedSchoolFilter === 'All' ? currentUser.school : selectedSchoolFilter}</span>
              {currentInstitution && (
                <span className="bg-emerald-600/80 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {currentInstitution.shortName}
                </span>
              )}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Safe Meetup Hub: <strong>{currentInstitution?.meetupPoints?.[0] || 'Student Union Building (SUB)'}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="home-change-campus-btn"
              onClick={onOpenCampusModal}
              className="flex-1 sm:flex-initial text-center px-3.5 py-2 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Switch Campus
            </button>
            <button
              id="home-safety-btn"
              onClick={onOpenSafetyModal}
              className="px-3 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
              title="Campus Safety Guidelines"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety Tips</span>
            </button>
          </div>
        </div>

        {/* Campus Scope Switcher: My Campus | Nearby Campuses | All Nigeria */}
        <div className="pt-3 border-t border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-emerald-200/90">
            <span className="font-semibold">Personalized Campus Scope:</span>
            <span className="text-[10px] text-emerald-300">
              {campusScope === 'my_campus' && `Directly inside ${currentInstitution?.shortName || 'My Campus'}`}
              {campusScope === 'nearby' && `Campuses in ${userInstitution?.state || 'State'} & nearby areas`}
              {campusScope === 'all' && `All universities, polytechnics & nursing colleges`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/25 rounded-2xl border border-white/10 backdrop-blur-xs text-xs">
            <button
              id="scope-my-campus-btn"
              onClick={() => setCampusScope('my_campus')}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                campusScope === 'my_campus'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">My Campus</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                campusScope === 'my_campus' ? 'bg-emerald-100 text-emerald-900' : 'bg-white/15 text-emerald-200'
              }`}>
                {myCampusCount}
              </span>
            </button>

            <button
              id="scope-nearby-btn"
              onClick={() => setCampusScope('nearby')}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                campusScope === 'nearby'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Nearby Campuses</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                campusScope === 'nearby' ? 'bg-emerald-100 text-emerald-900' : 'bg-white/15 text-emerald-200'
              }`}>
                {nearbyCampusesCount}
              </span>
            </button>

            <button
              id="scope-all-nigeria-btn"
              onClick={() => setCampusScope('all')}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                campusScope === 'all'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">All Nigeria</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                campusScope === 'all' ? 'bg-emerald-100 text-emerald-900' : 'bg-white/15 text-emerald-200'
              }`}>
                {allNigeriaCount}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-emerald-200/90 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span><strong>{nearCampusProducts.length}</strong> listings active in your home campus</span>
          </div>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-white hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>View My Orders & Handovers</span>
          </button>
        </div>
      </div>

      {/* Main Category Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Campus Categories
          </span>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>All Categories ({CATEGORIES_DATA.length + SERVICES_CATEGORIES_DATA.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory('All'); setActiveSectionTab('all'); }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'All' && activeSectionTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {CATEGORIES_DATA.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setSelectedCategory(cat.name); setActiveSectionTab('all'); }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* When user is actively filtering or searching */}
      {searchQuery.trim() || (selectedCategory !== 'All' && activeSectionTab === 'all') ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory} ({filteredProducts.length})
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No items match your campus search</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for general keywords like "cylinder", "laptop", "shoe", or switch to "All Campuses".
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
      ) : (
        /* Regular Home Page Layout with Featured, Student Services, Deals & Near Me Feed */
        <div className="space-y-8">
          
          {/* Featured & Promoted Campus Spotlight */}
          {featuredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Featured & Promoted Campus Finds
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Verified student sellers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {featuredProducts.slice(0, 2).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setViewProductDetail(product)}
                    className="group bg-white rounded-3xl border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition overflow-hidden flex flex-row cursor-pointer"
                  >
                    <div className="w-2/5 aspect-square relative bg-slate-100 shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Featured
                      </span>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-emerald-700">
                            {formatNaira((product.isDeal && product.discountPrice) ? product.discountPrice : product.price)}
                          </span>
                          {product.isDeal && product.discountPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatNaira(product.price)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-emerald-800">
                          {product.title}
                        </h4>
                      </div>

                      <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex flex-col gap-0.5">
                        <span className="truncate font-medium text-slate-700">{product.sellerName}</span>
                        <span className="text-[10px] text-emerald-700 truncate">{product.sellerSchool}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Services Marketplace Bar */}
          <div className="p-4 bg-indigo-50/60 rounded-3xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  Campus Student Services
                </h3>
              </div>
              <button 
                onClick={() => setActiveSectionTab('services')}
                className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
              >
                Browse All Services →
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SERVICES_CATEGORIES_DATA.slice(0, 6).map((srv) => (
                <button
                  key={srv.name}
                  onClick={() => {
                    setSelectedCategory(srv.name);
                    setActiveSectionTab('services');
                  }}
                  className="p-2.5 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-xs text-center transition cursor-pointer"
                >
                  <span className="text-lg block mb-0.5">{srv.icon}</span>
                  <span className="text-[10px] font-bold text-slate-800 block truncate">{srv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section Filter Pills: Recently Listed vs Near My Campus vs Student Deals vs Services */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveSectionTab('all')}
                  className={`pb-2 px-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                    activeSectionTab === 'all'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Campus Feed ({products.length})
                </button>
                <button
                  onClick={() => setActiveSectionTab('near_me')}
                  className={`pb-2 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1 ${
                    activeSectionTab === 'near_me'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Near Me ({nearCampusProducts.length})</span>
                </button>
                <button
                  onClick={() => setActiveSectionTab('deals')}
                  className={`pb-2 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1 ${
                    activeSectionTab === 'deals'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Percent className="w-3 h-3 text-red-600" />
                  <span>Student Deals</span>
                </button>
                <button
                  onClick={() => setActiveSectionTab('services')}
                  className={`pb-2 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1 ${
                    activeSectionTab === 'services'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Wrench className="w-3 h-3 text-indigo-600" />
                  <span>Services</span>
                </button>
              </div>

              <button
                onClick={onOpenFilterModal}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No items found in this section</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Switch back to "All Campus Feed" or be the first student to post an item in this category!
                </p>
                <button
                  onClick={() => setActiveSectionTab('all')}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Show All Campus Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Student Deals Spotlight */}
          {studentDeals.length > 0 && activeSectionTab === 'all' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Flash Student Deals & Discounts
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSectionTab('deals')}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  View All Deals →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {studentDeals.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Sell Prompt Banner for Students */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Campus Studentpreneur
              </span>
              <h3 className="text-base font-black mt-1">
                Got items or skills to offer fellow campus students?
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Sell textbooks, gadgets, hostel accessories or offer services like braiding & graphic design!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('sell')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer shrink-0"
            >
              Post Item or Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

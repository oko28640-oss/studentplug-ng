import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  SlidersHorizontal, 
  X,
  GraduationCap,
  Package,
  LogIn,
  Sparkles,
  Clock,
  Trash2,
  TrendingUp,
  History,
  ArrowRight
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { INSTITUTIONS, CATEGORIES_DATA, SERVICES_CATEGORIES_DATA } from '../data/mockData';
import { getLiveSuggestions, sanitizeSearchInput } from '../utils/searchHelper';

interface HeaderProps {
  onOpenCampusModal: () => void;
  onOpenSafetyModal: () => void;
  onOpenFilterModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenCampusModal, 
  onOpenSafetyModal, 
  onOpenFilterModal,
  onOpenAuthModal 
}) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    selectedSchoolFilter, 
    unreadNotificationsCount, 
    setIsNotificationsModalOpen,
    searchQuery,
    setSearchQuery,
    executeSearch,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    activeTab,
    setActiveTab,
    orders,
    firebaseUser,
    isSignedIn,
    signOutUser,
    isAuthLoading,
    products
  } = useMarket();

  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userSwitcherRef = useRef<HTMLDivElement>(null);

  // Sync internal input value if external searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userSwitcherRef.current && !userSwitcherRef.current.contains(e.target as Node)) {
        setShowUserSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Escape to close popups)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setShowUserSwitcher(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentInstitution = INSTITUTIONS.find(i => i.name === selectedSchoolFilter);
  const activeOrdersCount = orders.filter(o => 
    (o.buyerId === currentUser.id || o.sellerId === currentUser.id) && 
    (o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Shipped')
  ).length;

  // Compute live suggestions debounced
  const liveSuggestions = useMemo(() => {
    if (!inputValue || inputValue.trim().length < 2) return [];
    return getLiveSuggestions(inputValue, products, CATEGORIES_DATA, SERVICES_CATEGORIES_DATA);
  }, [inputValue, products]);

  const handlePerformSearch = (term?: string) => {
    const rawTarget = term !== undefined ? term : inputValue;
    const clean = sanitizeSearchInput(rawTarget);
    if (!clean) return;
    setInputValue(clean);
    setShowSuggestions(false);
    executeSearch(clean);
  };

  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    setShowSuggestions(false);
    if (activeTab === 'search') {
      setActiveTab('home');
    }
  };

  const trendingCampusSearches = [
    'Perfume',
    'Shoes',
    'Textbook',
    'Phone repair',
    'Hair styling',
    'Handouts',
    'Laptop',
    'Chinchin'
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-emerald-950/10 shadow-xs w-full max-w-full box-border">
      {/* Top Banner: Campus Selector & Quick Switcher */}
      <div className="bg-emerald-900 text-emerald-50 px-2.5 sm:px-3 py-1.5 text-xs w-full overflow-hidden box-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Active Campus Indicator */}
          <button
            id="header-campus-selector-btn"
            onClick={onOpenCampusModal}
            className="flex items-center gap-1 sm:gap-1.5 hover:bg-emerald-800/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition text-left cursor-pointer truncate max-w-[130px] sm:max-w-xs shrink-1"
            title="Click to change your school/campus"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate font-medium text-[11px] sm:text-xs">
              {selectedSchoolFilter === 'All' ? 'All Campuses' : (currentInstitution?.shortName || selectedSchoolFilter)}
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-300 shrink-0" />
          </button>

          {/* Quick User Switcher Demo Helper & Safety Button */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Direct Sign-In CTA when signed out */}
            {!isSignedIn && !isAuthLoading && onOpenAuthModal && (
              <button
                id="header-signin-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 sm:px-2.5 py-0.5 rounded-full transition cursor-pointer shadow-2xs"
                title="Sign in with student email or Google"
              >
                <LogIn className="w-3 h-3 text-slate-950 shrink-0" />
                <span>Sign In</span>
              </button>
            )}

            {/* Signed-in Indicator Badge */}
            {isSignedIn && (
              <div 
                className="hidden md:flex items-center gap-1.5 text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700/60"
                title={`Signed in as ${firebaseUser?.email || currentUser.email}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate max-w-[90px] font-medium">{firebaseUser?.displayName || currentUser.fullName.split(' ')[0]}</span>
              </div>
            )}

            <button
              id="header-safety-guide-btn"
              onClick={onOpenSafetyModal}
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-emerald-800/90 hover:bg-emerald-700 px-2 py-0.5 rounded-full text-emerald-200 transition cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Safety<span className="hidden sm:inline"> Tips</span></span>
            </button>

            {/* Quick Demo Student Switcher */}
            <div ref={userSwitcherRef} className="relative">
              <button
                id="header-user-switcher-toggle"
                onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                className="flex items-center gap-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition cursor-pointer"
                title="Account and profile switcher"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="hidden md:inline max-w-[80px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                {currentUser.role === 'admin' && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1 rounded-xs text-[9px]">ADMIN</span>
                )}
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showUserSwitcher && (
                <div 
                  id="header-user-switcher-dropdown"
                  className="absolute right-0 top-full mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Live Authentication Status Panel */}
                  {isSignedIn ? (
                    <div className="px-3 py-2 bg-emerald-50/90 border-b border-emerald-100 flex items-center justify-between gap-2">
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-950">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate">Firebase Authenticated</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 truncate">{firebaseUser?.email || currentUser.email}</div>
                      </div>
                      <button
                        id="header-quick-signout-btn"
                        onClick={async () => {
                          await signOutUser();
                          setShowUserSwitcher(false);
                        }}
                        className="text-[10px] font-bold text-red-700 hover:text-red-800 px-2 py-1 bg-white hover:bg-red-50 rounded-md border border-red-200 transition cursor-pointer shrink-0"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between gap-2">
                      <div className="truncate flex-1">
                        <span className="text-[11px] font-bold text-amber-950 block">Guest Demo Mode</span>
                        <span className="text-[10px] text-amber-700 block truncate">Sign in to save and verify</span>
                      </div>
                      {onOpenAuthModal && (
                        <button
                          id="header-quick-signin-btn"
                          onClick={() => {
                            setShowUserSwitcher(false);
                            onOpenAuthModal();
                          }}
                          className="text-[10px] font-bold text-slate-950 bg-amber-300 hover:bg-amber-400 px-2.5 py-1 rounded-md transition cursor-pointer shrink-0"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  )}

                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                    Switch active student persona:
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      id={`switch-to-user-${u.id}`}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserSwitcher(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-emerald-50 transition text-xs cursor-pointer ${
                        currentUser.id === u.id ? 'bg-emerald-50/80 font-semibold text-emerald-800' : ''
                      }`}
                    >
                      <img src={u.avatar} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate flex-1">
                        <div className="truncate flex items-center gap-1">
                          <span>{u.fullName}</span>
                          {u.isVerified && <UserCheck className="w-3 h-3 text-emerald-600 inline" />}
                          {u.role === 'admin' && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded-sm font-bold">MOD</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{u.school} • {u.level}</div>
                      </div>
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100">
                    <button
                      id="switcher-new-student-btn"
                      onClick={() => {
                        setShowUserSwitcher(false);
                        if (onOpenAuthModal) {
                          onOpenAuthModal();
                        } else {
                          setActiveTab('profile');
                        }
                      }}
                      className="w-full text-center text-xs font-medium text-emerald-700 hover:text-emerald-800 py-1 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isSignedIn ? 'Manage Account / Switch Credentials' : 'Create Account / Sign In with Google'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo, Search Bar with Live Suggestions, Notifications & Orders */}
      <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 box-border">
        {/* Logo */}
        <button 
          id="app-logo-home-btn"
          onClick={() => {
            setActiveTab('home');
            setSearchQuery('');
            setInputValue('');
          }}
          className="flex items-center gap-1.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">StudentPlug</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold px-1 rounded-xs">NG</span>
            </div>
            <span className="hidden sm:block text-[9px] sm:text-[10px] text-slate-500 leading-none mt-0.5">Campus Marketplace</span>
          </div>
        </button>

        {/* Search Bar Container */}
        <div ref={searchContainerRef} className="flex-1 min-w-0 max-w-md relative">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch();
            }}
            className="relative flex items-center w-full"
          >
            {/* Search Submit Icon */}
            <button
              id="header-search-submit-btn"
              type="submit"
              className="absolute left-2.5 p-1 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
              title="Search marketplace"
            >
              <Search className="w-4 h-4" />
            </button>

            <input
              id="main-search-input"
              type="search"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search perfume, shoes, handouts..."
              className="w-full pl-8.5 pr-14 sm:pr-16 py-1.5 sm:py-2 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full outline-hidden transition placeholder:text-slate-400 text-slate-800"
            />

            {/* Clear Input Button */}
            {inputValue && (
              <button 
                id="clear-search-btn"
                type="button"
                onClick={handleClearInput}
                className="absolute right-8 sm:right-9 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Advanced Filter Modal Trigger */}
            <button
              id="filter-modal-trigger-btn"
              type="button"
              onClick={onOpenFilterModal}
              className="absolute right-1.5 sm:right-2 p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
              title="Filter items"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Live Suggestions & Recent Searches Dropdown */}
          {showSuggestions && (
            <div 
              id="search-suggestions-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Scenario 1: Typing text with live suggestions */}
              {inputValue.trim().length >= 2 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Search Suggestions</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Press Enter to search</span>
                  </div>

                  {liveSuggestions.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {liveSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          id={`suggestion-item-${idx}`}
                          onClick={() => handlePerformSearch(suggestion)}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            <span className="truncate font-medium text-slate-800 group-hover:text-emerald-900">
                              {suggestion}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono text-[10px]">Enter</kbd> to search for "{inputValue}"
                    </div>
                  )}

                  {/* Quick Direct Submission Row */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                    <button
                      onClick={() => handlePerformSearch(inputValue)}
                      className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search for "{inputValue}"</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Scenario 2: Empty input - show Recent Searches & Trending */
                <div className="py-2 space-y-2">
                  {/* Recent Searches Section */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3 text-slate-400" />
                          Recent Searches
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentSearches();
                          }}
                          className="text-[10px] text-slate-400 hover:text-red-600 font-semibold cursor-pointer lowercase"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="divide-y divide-slate-50">
                        {recentSearches.slice(0, 5).map((term, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between hover:bg-slate-50 px-3.5 py-2 transition group"
                          >
                            <button
                              onClick={() => handlePerformSearch(term)}
                              className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                              <span className="truncate text-slate-700 group-hover:text-emerald-900 font-medium">
                                {term}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(term);
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 rounded-md transition cursor-pointer"
                              title="Remove search"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Campus Searches */}
                  <div className="px-3 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Popular on Campus
                    </span>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {trendingCampusSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePerformSearch(term)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-full transition font-medium cursor-pointer border border-transparent hover:border-emerald-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders & Notifications Quick Hub */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Orders Hub */}
          <button
            id="header-orders-btn"
            onClick={() => setActiveTab('orders')}
            className={`relative p-1.5 sm:p-2 rounded-full transition cursor-pointer ${
              activeTab === 'orders' 
                ? 'text-emerald-700 bg-emerald-100/80' 
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
            title="Campus Orders & Meetup Handovers"
          >
            <Package className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setIsNotificationsModalOpen(true)}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition cursor-pointer"
              title="Notifications Center"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

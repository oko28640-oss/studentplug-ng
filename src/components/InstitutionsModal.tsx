import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Building2, 
  MapPin, 
  Check, 
  Layers, 
  GraduationCap, 
  Stethoscope, 
  BookOpen, 
  Filter, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { NIGERIAN_STATES } from '../data/institutionsData';
import { InstitutionCategory } from '../types';

interface InstitutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_TABS: { label: string; value: 'All' | InstitutionCategory; icon: any }[] = [
  { label: 'All Institutions', value: 'All', icon: Layers },
  { label: 'Universities', value: 'University', icon: GraduationCap },
  { label: 'Polytechnics', value: 'Polytechnic', icon: Building2 },
  { label: 'Nursing Sciences', value: 'College of Nursing Sciences', icon: Stethoscope },
  { label: 'Colleges of Ed.', value: 'College of Education', icon: BookOpen },
];

export const InstitutionsModal: React.FC<InstitutionsModalProps> = ({ isOpen, onClose }) => {
  const { 
    institutions, 
    selectedSchoolFilter, 
    setSelectedSchoolFilter, 
    showToast,
    campusScope,
    setCampusScope
  } = useMarket();

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | InstitutionCategory>('All');
  const [selectedState, setSelectedState] = useState<string>('All');

  if (!isOpen) return null;

  const filteredInstitutions = institutions.filter(inst => {
    // Only active institutions unless searched
    if (!inst.isActive && !filterQuery) return false;

    // Search query matching: name, shortName, state, city, or aliases
    const query = filterQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      inst.name.toLowerCase().includes(query) ||
      inst.shortName.toLowerCase().includes(query) ||
      inst.state.toLowerCase().includes(query) ||
      (inst.city && inst.city.toLowerCase().includes(query)) ||
      (inst.aliases && inst.aliases.some(alias => alias.toLowerCase().includes(query)));

    // Category matching
    const matchesCategory = selectedCategory === 'All' || inst.category === selectedCategory;

    // State matching
    const matchesState = selectedState === 'All' || inst.state.toLowerCase() === selectedState.toLowerCase();

    return matchesSearch && matchesCategory && matchesState;
  });

  const handleSelect = (schoolName: string) => {
    setSelectedSchoolFilter(schoolName);
    if (schoolName === 'All') {
      setCampusScope('all');
      showToast('Viewing listings across all Nigerian campuses.');
    } else {
      setCampusScope('my_campus');
      showToast(`Marketplace scoped to ${schoolName}`);
    }
    onClose();
  };

  const handleResetFilters = () => {
    setFilterQuery('');
    setSelectedCategory('All');
    setSelectedState('All');
  };

  const isFiltered = filterQuery !== '' || selectedCategory !== 'All' || selectedState !== 'All';

  return (
    <div 
      id="institutions-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="institutions-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Nigerian Institutions Database</h2>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {institutions.length} Verified
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Select your university, polytechnic, or nursing college to see verified student listings.
              </p>
            </div>
          </div>
          <button
            id="close-institutions-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Filter & Search Control Panel */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
          {/* Real-time Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="institutions-search-input"
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by school name (UNILAG, UNN), former names, acronym, or city..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white outline-hidden bg-white shadow-xs transition"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Row 1: Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map(({ label, value, icon: Icon }) => (
              <button
                key={value}
                id={`cat-tab-${value}`}
                onClick={() => setSelectedCategory(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === value
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Row 2: State Selector Dropdown & Reset */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] text-slate-500 font-medium shrink-0">State:</span>
              <select
                id="state-filter-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-hidden cursor-pointer"
              >
                <option value="All">All States (36 States + FCT Abuja)</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state.code} value={state.name}>
                    {state.name} State ({state.geoZone})
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                id="reset-institutions-filters-btn"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Banner */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredInstitutions.length}</span> institutions
            {selectedState !== 'All' && <span> in <strong className="text-emerald-800">{selectedState} State</strong></span>}
            {selectedCategory !== 'All' && <span> • {selectedCategory}s</span>}
          </div>
          <div className="text-[10px] text-slate-500">
            Click institution to view marketplace
          </div>
        </div>

        {/* Schools List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {/* Nationwide / All Campuses Option */}
          <button
            id="select-all-nigerian-campuses"
            onClick={() => handleSelect('All')}
            className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between transition cursor-pointer border ${
              selectedSchoolFilter === 'All'
                ? 'bg-emerald-50 text-emerald-950 font-bold border-emerald-300 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🇳🇬 All Nigerian Campuses</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                    NATIONWIDE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Browse products, services, and deals from students across all universities and polytechnics.
                </div>
              </div>
            </div>
            {selectedSchoolFilter === 'All' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* Filtered Institutions Cards */}
          {filteredInstitutions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No institutions found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No institution matched your filter "{filterQuery || selectedState}". Try clearing your search or switching categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredInstitutions.map((inst) => {
              const isSelected = selectedSchoolFilter === inst.name;
              return (
                <button
                  key={inst.id || inst.name}
                  id={`select-inst-${inst.id || inst.shortName}`}
                  onClick={() => handleSelect(inst.name)}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-start justify-between transition cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-50/90 text-emerald-950 font-bold border-emerald-300 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex-1 pr-3 min-w-0">
                    {/* Header line: Official Name & Short Name */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {inst.name}
                      </span>
                      <span className="bg-emerald-100/80 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                        {inst.shortName}
                      </span>
                      {!inst.isActive && (
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Aliases or former names if available */}
                    {inst.aliases && inst.aliases.length > 1 && (
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Known as: {inst.aliases.filter(a => a !== inst.shortName && a !== inst.name).join(', ')}
                      </div>
                    )}

                    {/* Meta tags: State, City, GeoZone, Type */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-slate-600 mt-1.5">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {inst.city ? `${inst.city}, ` : ''}{inst.state} State {inst.geoZone ? `(${inst.geoZone})` : ''}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {inst.type}
                      </span>
                    </div>

                    {/* Campuses & Meetup Points */}
                    <div className="text-[10px] text-slate-500 mt-2 flex flex-col gap-0.5">
                      <div className="truncate">
                        <span className="font-semibold text-slate-700">Campuses: </span>
                        {inst.campuses.join(' • ')}
                      </div>
                      {inst.meetupPoints && inst.meetupPoints.length > 0 && (
                        <div className="text-emerald-700 flex items-center gap-1 truncate">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span className="font-semibold">Safe Meetups: </span>
                          <span>{inst.meetupPoints.slice(0, 3).join(', ')}{inst.meetupPoints.length > 3 ? ` +${inst.meetupPoints.length - 3} more` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Checkmark */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Can't find your campus? Ask campus admins to list it.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

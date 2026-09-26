import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search, 
  MapPin, 
  Tag, 
  GraduationCap, 
  RefreshCw, 
  Layers, 
  Check, 
  X,
  ShieldCheck,
  AlertCircle,
  Compass,
  Filter,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Institution, InstitutionCategory, InstitutionType } from '../types';
import { NIGERIAN_STATES } from '../data/institutionsData';

interface InstitutionTypeOption {
  type: InstitutionType;
  category: InstitutionCategory;
  label: string;
}

const INSTITUTION_TYPE_OPTIONS: InstitutionTypeOption[] = [
  { type: 'Federal University', category: 'University', label: 'Federal University' },
  { type: 'State University', category: 'University', label: 'State University' },
  { type: 'Private University', category: 'University', label: 'Private University' },
  { type: 'Polytechnic', category: 'Polytechnic', label: 'Polytechnic' },
  { type: 'College of Education', category: 'College of Education', label: 'College of Education' },
  { type: 'College of Nursing Sciences', category: 'College of Nursing Sciences', label: 'College of Nursing' },
  { type: 'Monotechnic & Other', category: 'Other', label: 'Monotechnic & Other' },
];

export const AdminInstitutionsManager: React.FC = () => {
  const { 
    institutions, 
    addInstitution, 
    updateInstitution, 
    deleteInstitution, 
    toggleInstitutionStatus,
    addMeetupPointToInstitution,
    removeMeetupPointFromInstitution,
    showToast
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formType, setFormType] = useState<InstitutionType>('Federal University');
  const [formState, setFormState] = useState('Lagos');
  const [formCampuses, setFormCampuses] = useState('Main Campus');
  const [formFaculties, setFormFaculties] = useState('Faculty of Science, Faculty of Social Sciences, Faculty of Arts, Faculty of Engineering');
  const [formDepartments, setFormDepartments] = useState('Computer Science, Accounting, Economics, Business Administration, Electrical Engineering');
  const [formProgrammes, setFormProgrammes] = useState('B.Sc, B.Eng, M.Sc, Diploma');
  const [formMeetupPoints, setFormMeetupPoints] = useState('Student Union Building (SUB), Main Campus Gate, School Library Foyer');

  // Inline Meetup Point Addition State
  const [quickMeetupInstId, setQuickMeetupInstId] = useState<string | null>(null);
  const [newMeetupPointInput, setNewMeetupPointInput] = useState('');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Derived state stats
  const stats = useMemo(() => {
    const federalUnis = institutions.filter(i => i.type === 'Federal University').length;
    const stateUnis = institutions.filter(i => i.type === 'State University').length;
    const privateUnis = institutions.filter(i => i.type === 'Private University').length;
    const polytechnics = institutions.filter(i => i.type === 'Polytechnic').length;
    const collegesOfEdu = institutions.filter(i => i.type === 'College of Education').length;
    const collegesOfNursing = institutions.filter(i => i.type === 'College of Nursing Sciences' || i.type === 'College of Health & Nursing').length;
    const monotechnics = institutions.filter(i => i.type === 'Monotechnic & Other').length;
    const statesCovered = new Set(institutions.map(i => i.state)).size;

    return {
      total: institutions.length,
      federalUnis,
      stateUnis,
      privateUnis,
      polytechnics,
      collegesOfEdu,
      collegesOfNursing,
      monotechnics,
      statesCovered
    };
  }, [institutions]);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      // Type filter
      if (selectedTypeFilter !== 'All' && inst.type !== selectedTypeFilter) {
        return false;
      }

      // State filter
      if (selectedStateFilter !== 'All' && inst.state !== selectedStateFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchShort = inst.shortName?.toLowerCase().includes(q);
        const matchState = inst.state.toLowerCase().includes(q);
        const matchType = inst.type?.toLowerCase().includes(q);
        const matchCategory = inst.category?.toLowerCase().includes(q);
        if (!matchName && !matchShort && !matchState && !matchType && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [institutions, selectedTypeFilter, selectedStateFilter, searchQuery]);

  const openAddModal = () => {
    setEditingInstitution(null);
    setFormName('');
    setFormShortName('');
    setFormType('Federal University');
    setFormState('Lagos');
    setFormCampuses('Main Campus');
    setFormFaculties('Faculty of Science, Faculty of Arts, Faculty of Engineering');
    setFormDepartments('Computer Science, Accounting, Economics, Mass Communication');
    setFormProgrammes('Undergraduate (B.Sc), Postgraduate, Diploma');
    setFormMeetupPoints('Student Union Building (SUB), Main Campus Gate, Central Library');
    setIsModalOpen(true);
  };

  const openEditModal = (inst: Institution) => {
    setEditingInstitution(inst);
    setFormName(inst.name);
    setFormShortName(inst.shortName || '');
    setFormType(inst.type);
    setFormState(inst.state);
    setFormCampuses(inst.campuses ? inst.campuses.join(', ') : 'Main Campus');
    setFormFaculties(inst.faculties ? inst.faculties.join(', ') : '');
    setFormDepartments(inst.departments ? inst.departments.join(', ') : '');
    setFormProgrammes(inst.programmes ? inst.programmes.join(', ') : '');
    setFormMeetupPoints(inst.meetupPoints ? inst.meetupPoints.join(', ') : 'Student Union Building (SUB)');
    setIsModalOpen(true);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Please enter institution name.');
      return;
    }

    const stateObj = NIGERIAN_STATES.find(s => s.name === formState) || NIGERIAN_STATES[0];
    const geoZone = stateObj.geoZone;

    const typeConfig = INSTITUTION_TYPE_OPTIONS.find(t => t.type === formType) || INSTITUTION_TYPE_OPTIONS[0];
    const category = typeConfig.category;

    const parsedCampuses = formCampuses
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedFaculties = formFaculties
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedDepartments = formDepartments
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedProgrammes = formProgrammes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedMeetupPoints = formMeetupPoints
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const shortNameValue = formShortName.trim() || formName.trim().slice(0, 10);

    if (editingInstitution) {
      updateInstitution(editingInstitution.id, {
        name: formName.trim(),
        shortName: shortNameValue,
        category,
        type: formType,
        state: formState,
        geoZone,
        campuses: parsedCampuses.length > 0 ? parsedCampuses : ['Main Campus'],
        faculties: parsedFaculties,
        departments: parsedDepartments,
        programmes: parsedProgrammes,
        meetupPoints: parsedMeetupPoints.length > 0 ? parsedMeetupPoints : ['Student Union Building (SUB)']
      });
    } else {
      addInstitution({
        name: formName.trim(),
        shortName: shortNameValue,
        category,
        type: formType,
        state: formState,
        geoZone,
        campuses: parsedCampuses.length > 0 ? parsedCampuses : ['Main Campus'],
        faculties: parsedFaculties,
        departments: parsedDepartments,
        programmes: parsedProgrammes,
        meetupPoints: parsedMeetupPoints.length > 0 ? parsedMeetupPoints : ['Student Union Building (SUB)', 'Main Campus Gate'],
        isActive: true
      });
    }

    setIsModalOpen(false);
  };

  const handleAddQuickMeetup = (instId: string) => {
    if (!newMeetupPointInput.trim()) return;
    addMeetupPointToInstitution(instId, newMeetupPointInput.trim());
    setNewMeetupPointInput('');
    setQuickMeetupInstId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-5 rounded-3xl border border-emerald-800/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Nigerian Tertiary Institutions Directory</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            School Registry & Campus Hub Management
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            Manage universities, polytechnics, nursing colleges, safe handover hubs, and academic departments across Nigeria.
          </p>
        </div>

        <button
          id="admin-add-institution-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Institution</span>
        </button>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-slate-500 font-semibold block">Total Institutions</span>
          <span className="text-base font-black text-slate-900">{stats.total}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-emerald-700 font-semibold block">Federal Unis</span>
          <span className="text-base font-black text-emerald-800">{stats.federalUnis}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-blue-700 font-semibold block">State Unis</span>
          <span className="text-base font-black text-blue-800">{stats.stateUnis}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-purple-700 font-semibold block">Private Unis</span>
          <span className="text-base font-black text-purple-800">{stats.privateUnis}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-amber-700 font-semibold block">Polytechnics</span>
          <span className="text-base font-black text-amber-800">{stats.polytechnics}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-rose-700 font-semibold block">Nursing Colleges</span>
          <span className="text-base font-black text-rose-800">{stats.collegesOfNursing}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-teal-700 font-semibold block">Colleges of Edu</span>
          <span className="text-base font-black text-teal-800">{stats.collegesOfEdu}</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-slate-700 font-semibold block">States Covered</span>
          <span className="text-base font-black text-slate-900">{stats.statesCovered}/37</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school name, acronym (e.g. UNILAG, UNN, OAU, YABATECH), or state..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-emerald-600 text-slate-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* State Filter Dropdown */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-emerald-600"
            >
              <option value="All">All 36 States + FCT</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s.code} value={s.name}>{s.name} ({s.geoZone})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Pill Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setSelectedTypeFilter('All')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
              selectedTypeFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Types ({institutions.length})
          </button>
          {INSTITUTION_TYPE_OPTIONS.map((opt) => {
            const count = institutions.filter(i => i.type === opt.type).length;
            const isSelected = selectedTypeFilter === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setSelectedTypeFilter(opt.type)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutions List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        <div className="p-3.5 bg-slate-50 text-xs font-bold text-slate-600 flex items-center justify-between">
          <span>Showing {filteredInstitutions.length} of {institutions.length} Institutions</span>
          {selectedTypeFilter !== 'All' || selectedStateFilter !== 'All' || searchQuery ? (
            <button
              onClick={() => {
                setSelectedTypeFilter('All');
                setSelectedStateFilter('All');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        {filteredInstitutions.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No institutions match your search.</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or click "Add New Institution" above.</p>
          </div>
        ) : (
          filteredInstitutions.map((inst) => {
            const isQuickMeetupActive = quickMeetupInstId === inst.id;

            return (
              <div key={inst.id} className="p-4 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{inst.name}</h4>
                      {inst.shortName && (
                        <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded-md font-bold">
                          {inst.shortName}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        inst.type?.includes('Federal') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        inst.type?.includes('State') ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        inst.type?.includes('Private') ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                        inst.type?.includes('Nursing') ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {inst.type || inst.category}
                      </span>
                      {inst.isActive === false ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Inactive
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {inst.state} State {inst.geoZone ? `(${inst.geoZone})` : ''}
                      </span>
                      <span>•</span>
                      <span>Campuses: <strong>{inst.campuses ? inst.campuses.join(', ') : 'Main Campus'}</strong></span>
                      {inst.faculties && inst.faculties.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{inst.faculties.length} Faculties</span>
                        </>
                      )}
                      {inst.departments && inst.departments.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{inst.departments.length} Departments</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => toggleInstitutionStatus(inst.id)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        inst.isActive === false
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={inst.isActive === false ? 'Activate Institution' : 'Deactivate Institution'}
                    >
                      {inst.isActive === false ? 'Enable' : 'Disable'}
                    </button>

                    <button
                      onClick={() => openEditModal(inst)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-slate-200 cursor-pointer"
                      title="Edit Institution Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {confirmDeleteId === inst.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                        <button
                          onClick={() => {
                            deleteInstitution(inst.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1 py-0.5 text-slate-500 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(inst.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-200 cursor-pointer"
                        title="Delete Institution"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Safe Meetup Hubs Chips */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Safe Handover Hubs:
                  </span>
                  {inst.meetupPoints && inst.meetupPoints.map((point) => (
                    <span
                      key={point}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <span>{point}</span>
                      <button
                        onClick={() => removeMeetupPointFromInstitution(inst.id, point)}
                        className="hover:text-rose-600 transition cursor-pointer"
                        title={`Remove ${point}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Add Meetup Point Inline */}
                  {isQuickMeetupActive ? (
                    <div className="inline-flex items-center gap-1 ml-1">
                      <input
                        type="text"
                        value={newMeetupPointInput}
                        onChange={(e) => setNewMeetupPointInput(e.target.value)}
                        placeholder="e.g. Faculty Cafe"
                        className="px-2 py-0.5 text-xs border border-emerald-300 rounded-lg focus:outline-emerald-600 w-32 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddQuickMeetup(inst.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddQuickMeetup(inst.id)}
                        className="p-1 bg-emerald-600 text-white rounded-md text-xs font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setQuickMeetupInstId(null);
                          setNewMeetupPointInput('');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQuickMeetupInstId(inst.id);
                        setNewMeetupPointInput('');
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Spot</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Institution Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base">
                  {editingInstitution ? 'Edit Institution Details' : 'Add New Nigerian Institution'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveInstitution} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Institution Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Federal University of Technology, Babura (FUTB)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Acronym / Short Name
                  </label>
                  <input
                    type="text"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value)}
                    placeholder="e.g. UNILAG, UNN, OAU"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Institution Category / Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as InstitutionType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                  >
                    {INSTITUTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    State *
                  </label>
                  <select
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>{s.name} ({s.geoZone})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Campuses (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formCampuses}
                    onChange={(e) => setFormCampuses(e.target.value)}
                    placeholder="e.g. Akoka Campus, Idi-Araba Campus"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Faculties / Colleges (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={formFaculties}
                  onChange={(e) => setFormFaculties(e.target.value)}
                  placeholder="e.g. Faculty of Science, Faculty of Arts, College of Medicine"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Departments (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={formDepartments}
                  onChange={(e) => setFormDepartments(e.target.value)}
                  placeholder="e.g. Computer Science, Accounting, Economics, Nursing Science"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Academic Programmes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formProgrammes}
                  onChange={(e) => setFormProgrammes(e.target.value)}
                  placeholder="e.g. Undergraduate (B.Sc), ND/HND, Basic Nursing, Postgraduate"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Safe Handover Hubs & Meetup Points (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formMeetupPoints}
                  onChange={(e) => setFormMeetupPoints(e.target.value)}
                  placeholder="e.g. Student Union Building (SUB), Main Campus Gate, School Library Foyer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Students use these verified safe meetup points during checkout to arrange secure in-person item inspections.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingInstitution ? 'Save Changes' : 'Create Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

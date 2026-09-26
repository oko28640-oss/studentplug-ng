import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Eye, 
  Building2, 
  TrendingUp, 
  UserX,
  Layers,
  ArrowUpRight,
  FileText,
  Clock,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Database,
  RefreshCw,
  Server
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from '../utils/formatters';
import { AdminInstitutionsManager } from './AdminInstitutionsManager';

export const AdminView: React.FC = () => {
  const { 
    allUsers, 
    products, 
    orders, 
    reports, 
    institutions,
    resolveReport, 
    verifyStudentAccount, 
    verificationRequests,
    reviewVerificationRequest,
    deleteProduct, 
    setViewProductDetail,
    showToast,
    initializeFirestoreDataStructure
  } = useMarket();

  const [activeAdminTab, setActiveAdminTab] = useState<'verifications' | 'reports' | 'institutions' | 'users' | 'listings' | 'analytics' | 'database'>('verifications');
  const [isInitializingDb, setIsInitializingDb] = useState(false);
  const [dbInitReport, setDbInitReport] = useState<{
    success: boolean;
    message: string;
    summary: Record<string, number>;
    initializedCollections: string[];
    timestamp: string;
  } | null>(null);

  const handleInitDatabase = async (force: boolean = false) => {
    setIsInitializingDb(true);
    try {
      const result = await initializeFirestoreDataStructure({ force });
      setDbInitReport({
        ...result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      showToast(result.message);
    } catch (e) {
      showToast('Error initializing Firestore data structure.');
    } finally {
      setIsInitializingDb(false);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(v => v.status === 'pending');
  const verifiedUsersCount = allUsers.filter(u => u.isVerified).length;
  const totalVolume = orders.reduce((acc, o) => acc + (o.totalAmount || o.productPrice), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>StudentPlug NG Moderation & Administration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Campus Trust & Safety Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review student ID submissions, audit reported listings, and monitor campus order volume.
          </p>
        </div>
        <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Actions</span>
          <span className="text-base font-black text-amber-400">
            {pendingVerifications.length} IDs • {pendingReports.length} Reports
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Students</span>
          <div className="text-xl font-black text-slate-900 mt-1">{allUsers.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{verifiedUsersCount} ID Verified</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Campus Listings</span>
          <div className="text-xl font-black text-slate-900 mt-1">{products.length}</div>
          <span className="text-[10px] text-slate-400">Across Nigerian Campuses</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Escrow & Order Vol.</span>
          <div className="text-xl font-black text-emerald-700 mt-1 truncate">{formatNaira(totalVolume)}</div>
          <span className="text-[10px] text-slate-400">{orders.length} total orders</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Verification Queue</span>
          <div className="text-xl font-black text-amber-600 mt-1">{pendingVerifications.length}</div>
          <span className="text-[10px] text-slate-400">Student IDs waiting</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {[
          { id: 'verifications', label: `ID Verifications (${pendingVerifications.length})`, icon: UserCheck },
          { id: 'institutions', label: `Institutions (${institutions.length})`, icon: Building2 },
          { id: 'reports', label: `Flagged Listings (${pendingReports.length})`, icon: AlertTriangle },
          { id: 'users', label: `Student Directory (${allUsers.length})`, icon: Users },
          { id: 'listings', label: `All Listings (${products.length})`, icon: Package },
          { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
          { id: 'database', label: 'Firestore DB', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}

      {/* 0. Student ID Verifications Queue */}
      {activeAdminTab === 'verifications' && (
        <div className="space-y-3">
          {verificationRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No pending student ID requests right now.</p>
            </div>
          ) : (
            verificationRequests.map((req) => (
              <div 
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{req.fullName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {req.school} • {req.faculty} ({req.department}, {req.level})
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    req.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : req.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Matriculation No.</span>
                    <span className="font-mono font-bold text-slate-900">{req.matricNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Submitted Date</span>
                    <span className="font-medium">{req.submittedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Document Preview</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ID File Attached
                    </span>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => reviewVerificationRequest(req.id, 'rejected', 'Document could not be verified with university registry')}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => reviewVerificationRequest(req.id, 'approved')}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Grant Verified Badge</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 1. Nigerian Institutions Database & Hub Management */}
      {activeAdminTab === 'institutions' && (
        <AdminInstitutionsManager />
      )}

      {/* 2. Reports Queue */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No reported items currently. Campus feed is safe!</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className={`p-4 rounded-3xl border shadow-xs bg-white space-y-3 ${
                  rep.status === 'pending' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rep.listingTitle}</span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {rep.reason}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reported by {rep.reportedByUserName} • {rep.timestamp}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rep.status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rep.status.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-0.5">Report Details:</span>
                  "{rep.details}"
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => resolveReport(rep.id, 'dismiss')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      Dismiss (Safe)
                    </button>
                    <button
                      onClick={() => resolveReport(rep.id, 'remove_listing')}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer"
                    >
                      Take Down Listing
                    </button>
                    <button
                      onClick={() => resolveReport(rep.id, 'ban_user')}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-xl transition cursor-pointer"
                    >
                      Suspend Seller
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. User Accounts */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {allUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{user.fullName}</span>
                      {user.isVerified && (
                        <span title="Verified" className="inline-flex">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">ADMIN</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {user.school} • {user.department} ({user.level})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyStudentAccount(user.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      user.isVerified
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {user.isVerified ? 'Verified Student ✓' : 'Grant Verified ID'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. All Listings */}
      {activeAdminTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{p.title}</h4>
                  <div className="text-[11px] text-slate-500 truncate">
                    {formatNaira(p.price)} • By {p.sellerName} ({p.sellerSchool})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setViewProductDetail(p)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Delete from marketplace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Analytics */}
      {activeAdminTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Most Active Nigerian Campuses</h3>
            <div className="space-y-2 text-xs">
              {[
                { school: 'University of Lagos (UNILAG)', count: 48, percentage: '38%' },
                { school: 'Obafemi Awolowo University (OAU)', count: 29, percentage: '23%' },
                { school: 'University of Nigeria, Nsukka (UNN)', count: 24, percentage: '19%' },
                { school: 'Ahmadu Bello University (ABU)', count: 15, percentage: '12%' },
                { school: 'Federal Poly Nekede / Yabatech', count: 10, percentage: '8%' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span className="truncate">{item.school}</span>
                    <span>{item.count} items</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: item.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Paystack & Revenue Architecture</h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-amber-900">Featured Listing Boosts</span>
                  <span className="text-[11px] text-amber-800">₦500 to ₦2,500 per spotlight</span>
                </div>
                <span className="font-extrabold text-amber-900">Active</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-emerald-900">Campus Escrow & Delivery Fee</span>
                  <span className="text-[11px] text-emerald-800">5% escrow commission on completed orders</span>
                </div>
                <span className="font-extrabold text-emerald-900">Configured</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-purple-900">Verified Campus ID Badge</span>
                  <span className="text-[11px] text-purple-800">Registry verification with school email & ID card</span>
                </div>
                <span className="font-extrabold text-purple-900">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Firestore Database Structure Management */}
      {activeAdminTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Firestore Collections Structure</h3>
                  <p className="text-xs text-slate-500">
                    Schema adherence, initialization, and synchronization for StudentPlug NG
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInitDatabase(false)}
                  disabled={isInitializingDb}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isInitializingDb ? 'animate-spin' : ''}`} />
                  <span>{isInitializingDb ? 'Initializing...' : 'Verify & Initialize'}</span>
                </button>
                <button
                  onClick={() => handleInitDatabase(true)}
                  disabled={isInitializingDb}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                  title="Overwrites or updates collections with baseline blueprint schemas"
                >
                  <span>Force Re-Seed</span>
                </button>
              </div>
            </div>

            {dbInitReport && (
              <div className={`p-4 rounded-2xl border text-xs ${
                dbInitReport.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    {dbInitReport.message}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {dbInitReport.timestamp}
                  </span>
                </div>
                {Object.keys(dbInitReport.summary).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(dbInitReport.summary).map(([col, count]) => (
                      <span key={col} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 font-medium">
                        {col}: <strong className="text-emerald-700">{count}</strong> docs
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { name: 'users', label: 'Student Profiles', desc: 'Account details, ratings, verification status', status: 'Ready' },
                { name: 'institutions', label: 'Institutions Directory', desc: 'Nigerian universities, campuses, & safe meetup points', status: 'Ready' },
                { name: 'listings', label: 'Campus Listings', desc: 'Products, student services, condition, pricing', status: 'Ready' },
                { name: 'orders', label: 'Market Orders', desc: 'Orders, delivery fee, meetup details, status', status: 'Ready' },
                { name: 'conversations', label: 'Campus Messaging', desc: 'Chat threads and messages subcollection', status: 'Ready' },
                { name: 'reviews', label: 'Peer Reviews', desc: 'Buyer ratings and comments for student sellers', status: 'Ready' },
                { name: 'verificationRequests', label: 'Student ID Verification', desc: 'School ID card uploads and verification badge queue', status: 'Ready' },
                { name: 'notifications', label: 'Student Notifications', desc: 'Order alerts, chat alerts, status changes', status: 'Ready' },
                { name: 'reports', label: 'Moderation Reports', desc: 'Flagged listings and safety center reports', status: 'Ready' },
                { name: 'test', label: 'Connection Test', desc: 'Connectivity heartbeat verification document', status: 'Ready' },
              ].map((col) => (
                <div key={col.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 font-mono">/{col.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {col.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">{col.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

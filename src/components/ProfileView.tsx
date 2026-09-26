import React, { useState } from 'react';
import { 
  UserCheck, 
  Heart, 
  Package, 
  ShoppingBag, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  LogOut, 
  Settings, 
  UserPlus, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  ExternalLink,
  ShieldAlert,
  Ban,
  UserX,
  LogIn,
  Smartphone,
  Download
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';
import { OrdersView } from './OrdersView';
import { SellerDashboardView } from './SellerDashboardView';

interface ProfileViewProps {
  onOpenSafetyModal: () => void;
  onOpenCampusModal: () => void;
  onOpenAuthModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenSafetyModal,
  onOpenCampusModal,
  onOpenAuthModal,
}) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    products, 
    favourites, 
    orders, 
    verifyStudentAccount,
    setIsVerificationModalOpen,
    openSellerProfile,
    blockedUserIds,
    unblockUser,
    setActiveTab,
    showToast,
    openLegalDocs,
    setIsAccountDeletionModalOpen,
    firebaseUser,
    isSignedIn,
    isAuthLoading,
    signOutUser,
    sendPasswordReset
  } = useMarket();

  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const [activeSubSection, setActiveSubSection] = useState<'favourites' | 'orders' | 'seller_hub' | 'security' | 'settings'>('favourites');

  // Products favorited by user
  const savedProducts = products.filter(p => favourites.includes(p.id));
  const myBuyerOrders = orders.filter(o => o.buyerId === currentUser.id);

  // Blocked users
  const blockedUsers = allUsers.filter(u => blockedUserIds.includes(u.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Student ID Card Graphic */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-emerald-700/40 overflow-hidden">
        {/* Decorative Watermark */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-48 h-48" />
        </div>

        {/* Institution Banner */}
        <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-300" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-emerald-100">
              {currentUser.school}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded-sm">
            CAMPUS PASS
          </span>
        </div>

        {/* Student Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/80 shadow-md"
            />
            {currentUser.isVerified && (
              <div 
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md"
                title="Verified Nigerian Student"
              >
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {currentUser.fullName}
              </h1>
              {currentUser.isVerified ? (
                <span className="bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Verified Student
                </span>
              ) : (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-amber-500/30 transition cursor-pointer"
                >
                  Verify Student ID →
                </button>
              )}
            </div>

            <p className="text-xs text-emerald-200 mt-1">
              {currentUser.department} • <strong className="text-white">{currentUser.level}</strong>
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Campus: {currentUser.campus}
            </p>

            {currentUser.bio && (
              <p className="text-xs text-slate-200 mt-2 line-clamp-2 max-w-lg bg-black/20 p-2 rounded-xl">
                "{currentUser.bio}"
              </p>
            )}

            {/* View Public Storefront */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => openSellerProfile(currentUser.id)}
                className="text-[11px] bg-white/15 hover:bg-white/25 px-3 py-1 rounded-xl text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Public Profile & Store</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Stats on Student Card */}
          <div className="flex sm:flex-col gap-3 sm:gap-1 text-center sm:text-right bg-white/10 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto justify-around">
            <div>
              <span className="text-[10px] text-emerald-200 block">Trust Rating</span>
              <span className="text-sm sm:text-base font-black text-amber-300">★ {currentUser.rating}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Joined</span>
              <span className="text-xs text-white font-semibold">{currentUser.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions on Card */}
        <div className="mt-4 pt-3 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={onOpenCampusModal}
            className="text-emerald-200 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Switch Primary Campus</span>
          </button>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black flex items-center gap-1 transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </button>
            )}
            <button
              onClick={onOpenAuthModal}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg text-emerald-100 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
            <button
              onClick={onOpenSafetyModal}
              className="bg-emerald-600/80 hover:bg-emerald-600 px-2.5 py-1 rounded-lg text-white font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety Tips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation: Saved / Orders / Seller Hub / Safety */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          id="profile-tab-favourites"
          onClick={() => setActiveSubSection('favourites')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeSubSection === 'favourites'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Items ({savedProducts.length})</span>
        </button>

        <button
          id="profile-tab-orders"
          onClick={() => setActiveSubSection('orders')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeSubSection === 'orders'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Meetups ({myBuyerOrders.length})</span>
        </button>

        <button
          id="profile-tab-seller-hub"
          onClick={() => setActiveSubSection('seller_hub')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeSubSection === 'seller_hub'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Seller Hub & Listings</span>
        </button>

        <button
          id="profile-tab-security"
          onClick={() => setActiveSubSection('security')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeSubSection === 'security'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification & Safety</span>
        </button>

        <button
          id="profile-tab-settings"
          onClick={() => setActiveSubSection('settings')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeSubSection === 'settings'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account & Settings</span>
        </button>
      </div>

      {/* Sub-section Content */}

      {/* 1. Saved Favourites */}
      {activeSubSection === 'favourites' && (
        <div>
          {savedProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Heart className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No saved items yet</h3>
              <p className="text-xs text-slate-500">
                Tap the heart icon on any campus listing to bookmark items you're interested in buying.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Explore Campus Feed
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {savedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Orders */}
      {activeSubSection === 'orders' && <OrdersView />}

      {/* 3. Seller Hub */}
      {activeSubSection === 'seller_hub' && <SellerDashboardView />}

      {/* 4. Verification & Security */}
      {activeSubSection === 'security' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Student ID & Portal Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified sellers receive a green checkmark, boost their listings, and get 3x higher trust on campus.
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentUser.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentUser.isVerified ? 'Verified Student ID' : 'Pending Verification'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>School Email: <strong>{currentUser.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Institution: <strong>{currentUser.school}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Department / Level: <strong>{currentUser.department} ({currentUser.level})</strong></span>
              </div>
            </div>

            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              {currentUser.isVerified ? 'View / Update Verification Documents' : 'Upload Student ID / Course Form'}
            </button>
          </div>

          {/* Blocked Users Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-sm text-slate-900">Blocked Campus Users</h3>
            </div>
            {blockedUsers.length === 0 ? (
              <p className="text-xs text-slate-500">
                You haven't blocked any campus sellers or buyers.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {blockedUsers.map((bu) => (
                  <div key={bu.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={bu.avatar} alt={bu.fullName} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-slate-800 block">{bu.fullName}</span>
                        <span className="text-[10px] text-slate-400 block">{bu.school}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockUser(bu.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo Personas Switcher */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Demo Account Switcher</h3>
            <p className="text-xs text-slate-500">
              Easily toggle between registered demo student personas across different campuses to test buyer, seller, and administrator views:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <span className="text-xs block truncate">{u.fullName}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{u.school} • {u.level}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Account & Settings (Profile -> Settings -> Account) */}
      {activeSubSection === 'settings' && (
        <div id="profile-settings-account" className="space-y-4">
          {/* Account Profile Details */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Student Account</h3>
                <p className="text-xs text-slate-500">Manage your credentials, phone, and verification data.</p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                ID: {currentUser.id.slice(0, 10)}...
              </span>
            </div>

            {/* Dynamic Status Alert */}
            {isAuthLoading ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-medium">Restoring student session...</span>
              </div>
            ) : isSignedIn ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div>
                    <span className="font-bold text-emerald-950 block">Signed In via Firebase</span>
                    <span className="text-emerald-700 text-[11px]">{firebaseUser?.email || currentUser.email}</span>
                  </div>
                </div>
                <button
                  id="profile-sign-out-badge"
                  onClick={() => signOutUser()}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 shadow-2xs transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">Guest Preview Mode (Signed Out)</span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Sign in to sync your student profile to the cloud, chat with verified campus buyers, and list items.
                  </p>
                </div>
                <button
                  id="profile-sign-in-cta"
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-semibold text-slate-800">{currentUser.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone (WhatsApp)</span>
                <span className="font-semibold text-slate-800">{currentUser.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus / Hall</span>
                <span className="font-semibold text-slate-800">{currentUser.campus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Security State</span>
                <span className="font-semibold text-emerald-700">
                  {isSignedIn ? 'Protected by Firebase Auth' : 'Guest Persona (Unauthenticated)'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {isSignedIn ? (
                <>
                  <button
                    id="profile-send-password-reset"
                    onClick={async () => {
                      try {
                        await sendPasswordReset(currentUser.email);
                      } catch (e) {
                        showToast('Reset link sent to registered email.');
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Send Password Reset Email
                  </button>
                  <button
                    id="profile-sign-out"
                    onClick={() => signOutUser()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  id="profile-login-btn"
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Email or Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile App Installation (PWA / Offline) */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-3xl border border-emerald-200/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">StudentPlug Phone App</h3>
                  <p className="text-xs text-emerald-700">Add to Home Screen for fast, full-screen offline access.</p>
                </div>
              </div>
              {isInstalled ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Installed
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  Available
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-emerald-800">
                {isInstalled ? 'App is active on your device.' : 'Runs full-screen with instant load speeds.'}
              </span>
              {!isInstalled && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isIOS || !isInstallable) {
                      setShowInstallHelp(!showInstallHelp);
                    } else {
                      const ok = await install();
                      if (ok) showToast('StudentPlug App installed on your device!');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'How to Install on iPhone' : 'Install App on Phone'}</span>
                </button>
              )}
            </div>

            {showInstallHelp && (
              <div className="mt-3 p-3.5 bg-white rounded-2xl border border-emerald-100 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                <p className="font-bold text-slate-900">How to add to your Home Screen:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>In your browser (Safari or Chrome), tap the <strong>Share</strong> or <strong>Menu (⋮)</strong> button.</li>
                  <li>Select <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> to put the StudentPlug icon with your other phone apps.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Legal Compliance & Policies */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Legal, Trust & Compliance</h3>
              <p className="text-xs text-slate-500">Official platform terms, privacy policy, and student protection guidelines.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                id="legal-link-privacy"
                onClick={() => openLegalDocs('privacy')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl text-left font-medium text-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <span>Privacy Policy (NDPR)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                id="legal-link-terms"
                onClick={() => openLegalDocs('terms')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl text-left font-medium text-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <span>Terms of Service</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                id="legal-link-community"
                onClick={() => openLegalDocs('community')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl text-left font-medium text-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <span>Community Guidelines</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                id="legal-link-safety"
                onClick={() => openLegalDocs('safety')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl text-left font-medium text-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <span>Campus Handover Safety</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                id="legal-link-refunds"
                onClick={() => openLegalDocs('refunds')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl text-left font-medium text-slate-700 flex items-center justify-between transition cursor-pointer sm:col-span-2"
              >
                <span>Refund, Cancellation & Escrow Protection Policy</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Danger Zone: Account Deletion (Requirement 13) */}
          <div className="bg-red-50/60 p-5 rounded-3xl border border-red-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-red-950">Danger Zone: Account & Data Deletion</h3>
                <p className="text-xs text-red-800 leading-relaxed">
                  Under Nigeria Data Protection Regulation (NDPR) and App Store compliance rules, you have the right to permanently erase your StudentPlug NG account, active marketplace listings, student identity proofs, and profile information.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-red-200/60">
              <span className="text-xs text-red-700 font-medium">This operation cannot be undone.</span>
              <button
                id="profile-delete-account-button"
                onClick={() => setIsAccountDeletionModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

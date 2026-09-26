import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Users, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export type LegalDocTab = 'privacy' | 'terms' | 'community' | 'safety' | 'refunds';

interface LegalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalDocTab;
  onTabChange?: (tab: LegalDocTab) => void;
}

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tab: LegalDocTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-80 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-black text-base text-white">Trust, Safety & Legal Center</h3>
              <p className="text-xs text-emerald-200/80">Compliance with Nigeria Data Protection Regulation (NDPR)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 overflow-x-auto scrollbar-none gap-1 py-1.5 text-xs font-bold">
          <button
            onClick={() => handleSelectTab('privacy')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => handleSelectTab('terms')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terms' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => handleSelectTab('community')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'community' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Rules</span>
          </button>
          <button
            onClick={() => handleSelectTab('safety')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'safety' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Handover Safety</span>
          </button>
          <button
            onClick={() => handleSelectTab('refunds')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'refunds' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refund & Dispute Policy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  Nigeria Data Protection Regulation (NDPR) Compliance Summary
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  StudentPlug NG strictly safeguards student personal information. We collect only what is necessary to authenticate genuine campus students, prevent fraudulent listings, and facilitate secure physical handovers.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">1. Student Matriculation Numbers & ID Cards</h5>
                <p className="text-slate-600">
                  Matriculation numbers, JAMB registration numbers, and uploaded student ID card photos are stored in encrypted collections accessible only to authorized administrators for identity verification. <strong>Matriculation numbers are never displayed on public seller listings or profiles.</strong>
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">2. Payment Data & Raw Card Details</h5>
                <p className="text-slate-600">
                  StudentPlug NG <strong>never stores raw debit card details, CVVs, or bank PINs</strong> on our servers. All electronic payments (Card, USSD, Bank Transfer) are processed directly through PCIDSS-compliant licensed payment gateways (Paystack / Flutterwave).
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">3. In-App Chat & Messages</h5>
                <p className="text-slate-600">
                  In-app buyer-seller chat messages are private to the participants. Phone numbers are hidden by default unless a student voluntarily chooses to initiate contact through an external channel.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">4. Right to Erasure (Account Deletion)</h5>
                <p className="text-slate-600">
                  Students have full ownership of their data. You can permanently delete your profile, listings, and verification records at any time under <strong>Profile → Settings → Account → Delete Account</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">StudentPlug NG Marketplace Terms of Service</h4>
              <p className="text-slate-600">
                By creating an account on StudentPlug NG, you agree to comply with Nigerian tertiary institution codes of conduct and the following marketplace terms:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Student Representation:</strong> You agree to provide accurate academic affiliation (Institution, Faculty, Department, and Level).</li>
                <li><strong>Listing Authenticity:</strong> You may only list items and student services that you legitimately own or offer. Submitting counterfeit goods, stolen laptops or phones, or prohibited exam materials is strictly forbidden.</li>
                <li><strong>Campus Handover Inspection:</strong> Buyers are entitled to inspect products in person at daylight campus locations prior to providing handover verification codes.</li>
                <li><strong>No Fee Circumvention:</strong> Utilizing the platform to engage in scam solicitation, off-platform fraud, or abusive conduct will result in immediate permanent suspension and reporting to campus authorities.</li>
              </ul>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Campus Community Guidelines</h4>
              <p className="text-slate-600">
                StudentPlug NG is designed by Nigerian students for Nigerian students. We uphold mutual respect, trust, and integrity across all campuses.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Do's
                  </h5>
                  <ul className="text-xs space-y-1 text-slate-600">
                    <li>• Meet at verified hubs (SUB, Library, Main Gate)</li>
                    <li>• Provide honest descriptions of gadget condition</li>
                    <li>• Respond respectfully to price inquiries</li>
                    <li>• Leave honest ratings after completed sales</li>
                  </ul>
                </div>
                <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                  <h5 className="font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Don'ts
                  </h5>
                  <ul className="text-xs space-y-1 text-slate-600">
                    <li>• Never meet off-campus after dark with strangers</li>
                    <li>• Never post illegal or unverified pharmaceuticals</li>
                    <li>• Never share your bank ATM PIN or OTP</li>
                    <li>• Do not post academic malpractice materials</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="bg-emerald-900 text-white p-4 rounded-2xl">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  Verified On-Campus Handover Protocol
                </h4>
                <p className="text-xs text-emerald-100/90 mt-1">
                  To protect both buyers and sellers from physical robbery or gadget swapping, StudentPlug NG enforces vetted public meetup points within every registered Nigerian institution.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900">Recommended Safe Handover Hubs:</h5>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Student Union Building (SUB):</strong> High foot traffic, central student activity, daylit security presence.</li>
                  <li><strong>University / Polytechnic Central Library Foyer:</strong> Monitored entrance, ideal for laptop and textbook checks.</li>
                  <li><strong>Campus Main Security Gate:</strong> Staffed by institutional security guards, convenient for inter-campus handovers.</li>
                  <li><strong>Faculty Lecture Theatres / Department Halls:</strong> Known academic environment during regular lecture hours (9 AM – 5 PM).</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                <strong>Safety Rule:</strong> Never agree to meet in isolated hostel back alleys, bush paths, or private off-campus residences with unknown parties.
              </div>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Payment Confirmation, Cancellation & Refund Policy</h4>
              <p className="text-slate-600">
                StudentPlug NG connects campus students with fair transaction safety rules:
              </p>
              <div className="space-y-2 text-slate-600">
                <div>
                  <strong className="text-slate-900 block">1. Inspection Period Prior to Handover Code Exchange</strong>
                  <p>When you pay online via Paystack, the transaction status moves to "Paid". At the campus meetup point, you inspect the device (battery health, screen integrity, book edition, etc.). Only once satisfied do you provide the handover code to the seller to complete the order.</p>
                </div>
                <div>
                  <strong className="text-slate-900 block">2. Item Not as Described / Rejection</strong>
                  <p>If the item is broken, counterfeit, or differs significantly from the listing, the buyer may reject the handover directly on-campus and file a dispute. Funds remain protected pending seller confirmation or administrative mediation.</p>
                </div>
                <div>
                  <strong className="text-slate-900 block">3. Seller Cancellation</strong>
                  <p>If a seller runs out of stock or cannot fulfill the order within the agreed timeframe, the order is cancelled and the full amount refunded to the buyer's original payment method within 24-48 business hours.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Lock, 
  HelpCircle,
  Clock
} from 'lucide-react';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      id="safety-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="safety-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-950/10 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Campus Safety Center</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                5 Golden Rules for Safe Campus Trading in Nigeria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Rule 1 */}
          <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Never Pay Money Upfront
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Do not send bank transfers for "reservation", "delivery fuel", or "commitment fee". Always inspect the laptop, phone, mattress, or gas cylinder with your own eyes first.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Meet in Public Campus Safe Zones
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Choose busy daylight spots: Student Union Building (SUB), Faculty quadrangles, the University Library lobby, or hostel common rooms. Avoid secluded off-campus bush paths or night meetups.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Look for Verified Student Badges
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Users with the green <span className="font-semibold text-emerald-700">Verified Student ID</span> checkmark have confirmed their Nigerian matriculation credentials with our campus moderators.
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Keep Chat & Proof Inside StudentPlug NG
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Avoid taking transactions off-platform to untraceable channels until you have met in person. Our moderation team can help resolve disputes when chat logs are within the app.
              </p>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              5
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Test Electronics & Gadgets Thoroughly
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                For laptops and phones, test charging ports, camera, screen touch, battery health, and verify IMEI/iCloud logout before completing instant transfer or cash payment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            I Understand & Trade Safely
          </button>
        </div>
      </div>
    </div>
  );
};

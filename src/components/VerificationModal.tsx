import React, { useState, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Lock, 
  FileText, 
  Building,
  GraduationCap,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { StudentLevel } from '../types';
import { useMarket } from '../context/MarketContext';
import { INSTITUTIONS } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

interface VerificationModalProps {
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose }) => {
  const { currentUser, submitVerificationRequest, showToast, verificationRequests } = useMarket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userReq = verificationRequests.find(r => r.userId === currentUser.id);

  const [matricNumber, setMatricNumber] = useState(currentUser.matricNumber || '');
  const [faculty, setFaculty] = useState(currentUser.faculty || 'Sciences');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [level, setLevel] = useState<StudentLevel>(currentUser.level || '300L');
  const [idCardPreview, setIdCardPreview] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Institution faculties
  const schoolData = INSTITUTIONS.find(i => i.name === currentUser.school);
  const facultiesList = schoolData?.faculties || ['Sciences', 'Engineering', 'Arts', 'Social Sciences', 'Management Sciences', 'Law', 'Health Sciences'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber.trim()) {
      showToast('Please enter your student matriculation number.');
      return;
    }
    if (!department.trim()) {
      showToast('Please enter your academic department.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitVerificationRequest(matricNumber.trim(), faculty, department.trim(), level, idCardPreview);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85
      });
      setIdCardPreview(compressed.dataUrl);
      showToast('Student ID attached and compressed for fast verification!');
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setIdCardPreview(reader.result as string);
          showToast('Student ID document attached!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div 
      id="verification-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="verification-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Student Verification</h2>
              <span className="text-[11px] text-slate-400">Get verified campus badge & trusted buyer tag</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Check */}
        {currentUser.isVerified ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Verified Campus Student</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Your matriculation credentials for <strong>{currentUser.school}</strong> are active and verified.
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-800">Faculty:</span>
                <span className="font-semibold text-emerald-950">{currentUser.faculty || 'Engineering / Sciences'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Department:</span>
                <span className="font-semibold text-emerald-950">{currentUser.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Trust Badge:</span>
                <span className="font-bold text-emerald-700">Verified Student Badge Active</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
            >
              Done
            </button>
          </div>
        ) : currentUser.verificationStatus === 'pending' || userReq ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">IN REVIEW</span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">Verification Under Review</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Our student liaison moderation team is currently reviewing your uploaded ID for <strong>{currentUser.school}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-amber-800">Submitted ID:</span>
                <span className="font-mono font-semibold text-amber-950">{currentUser.matricNumber || 'ECN/2023/118'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Average Turnaround:</span>
                <span className="font-semibold text-amber-950">Under 2 hours</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Campus Info Header */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">School</span>
                <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.school}</h4>
              </div>
            </div>

            {/* Matric Number (Private) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Matriculation / Registration Number
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  100% Private
                </span>
              </div>
              <input
                type="text"
                required
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="e.g. 190408042 or U18CE1042"
                className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
              />
              <span className="text-[10px] text-slate-500 block">
                Never shared publicly on your listings or profile.
              </span>
            </div>

            {/* Faculty & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">Faculty</label>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-emerald-600"
                >
                  {facultiesList.map((f, i) => (
                    <option key={i} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as StudentLevel)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-emerald-600"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science / Economics"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-800"
              />
            </div>

            {/* Upload Student ID / Portal Proof */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">
                Student ID Card or School Portal Screenshot
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelected}
                className="hidden"
              />

              {idCardPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                  <img
                    src={idCardPreview}
                    alt="Student ID Preview"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdCardPreview('')}
                      className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded-md text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>ID Proof Attached</span>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition group"
                >
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-800 block">
                    {isCompressing ? 'Compressing for upload...' : 'Click to attach Student ID or Portal Slip'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto-compressed to under 500KB for fast campus upload
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting ID...' : 'Submit for Campus Verification'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Lock, 
  ShieldAlert, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, deleteCurrentUserAccount, showToast } = useMarket();
  const [confirmInput, setConfirmInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirmed) {
      showToast('Please type DELETE to confirm.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCurrentUserAccount(reasonInput);
      showToast('Your account and personal data have been permanently removed.');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-80 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-center justify-between text-rose-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Delete Student Account</h3>
              <p className="text-xs text-rose-700">Permanent erasure of your profile & data</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDelete} className="p-5 space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1 text-amber-900">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              What will happen to your data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-800">
              <li>Your student profile, photo, and bio will be immediately erased.</li>
              <li>Your active product and service listings will be removed from campus search.</li>
              <li>Uploaded student ID cards and matric verification records will be permanently purged.</li>
              <li>Past financial records will be anonymized to comply with Nigerian accounting regulations.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              Reason for leaving (optional)
            </label>
            <select
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-rose-600 text-slate-800 text-xs"
            >
              <option value="">Select a reason...</option>
              <option value="graduated">I have graduated / left institution</option>
              <option value="privacy">Privacy concerns</option>
              <option value="no_longer_needed">No longer buying/selling on campus</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              Current Account: <span className="text-slate-600 font-normal">{currentUser.email}</span>
            </label>
            <p className="text-[11px] text-slate-500">
              To prevent accidental deletion, please type <strong className="text-rose-600 font-black">DELETE</strong> in the box below:
            </p>
            <input
              type="text"
              required
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-rose-600 font-mono text-center font-bold tracking-widest text-slate-900 uppercase"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition ${
                isConfirmed && !isDeleting
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

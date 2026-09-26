import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone app mode or user dismissed this session
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setDismissed(true), 3000);
      }
    } else {
      // If browser hasn't fired beforeinstallprompt yet or user is on mobile browser that supports Add to Home Screen
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Top Prominent Install Notification Bar */}
      <aside aria-label="Install StudentPlug Application" className="relative z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md border-b border-emerald-600/40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-sm shrink-0 flex items-center justify-center">
              <img src="/icon.svg" alt="StudentPlug Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>Install StudentPlug NG App</span>
                <span className="hidden sm:inline-flex items-center text-[10px] bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded-full">
                  Fast & Offline
                </span>
              </p>
              <p className="text-[11px] text-emerald-100 truncate">
                Tap once to add to your phone's home screen — zero data fees!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {installSuccess ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Installed!
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 rounded-lg shadow-sm transition-all duration-150"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Install App</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS / General Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white p-2">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">Install on Your Phone</h3>
                  <p className="text-xs text-gray-500">StudentPlug NG App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-sm text-gray-700">
              <div className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  In your browser (Safari on iPhone or Chrome on Android), tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-emerald-700 mx-0.5" /> or the <strong>three dots menu (⋮)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-700 mx-0.5" />.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Tap <strong>Add</strong> in the top right corner. The <strong>StudentPlug</strong> app icon will appear immediately on your home screen!
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

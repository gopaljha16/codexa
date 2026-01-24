import React, { useEffect } from "react";

const STORAGE_KEY = "codexaV2AnnouncementDismissed";

const V2Announcement = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        localStorage.setItem(STORAGE_KEY, "true");
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-3 top-3 text-slate-400 hover:text-white"
        >
          ×
        </button>
        <div className="p-6">
          <div className="mb-2 text-sm uppercase tracking-wider text-amber-400">
            Announcement
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Codexa v2 is coming soon
          </h2>
          <p className="text-slate-300 leading-relaxed">
            We're rolling out a refreshed UI and new features. You might notice a
            few changes as we prepare the upgrade. Stay tuned for the v2 launch!
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const shouldShowV2Announcement = () => {
  return localStorage.getItem(STORAGE_KEY) !== "true";
};

export default V2Announcement;

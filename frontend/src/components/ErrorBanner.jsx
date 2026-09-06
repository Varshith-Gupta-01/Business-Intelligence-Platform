import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="max-w-3xl mx-auto mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start justify-between space-x-3 text-rose-300">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-rose-200 text-sm">Upload Error</h4>
          <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

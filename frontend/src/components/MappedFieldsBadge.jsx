import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Database } from 'lucide-react';

export default function MappedFieldsBadge({ mappedColumns, unmappedColumns }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!mappedColumns || Object.keys(mappedColumns).length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl mb-8 p-4 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-sm">Detected Schema & Mapped Columns</span>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-mono text-[11px]">
            {Object.keys(mappedColumns).length} Columns Identified
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(mappedColumns).map(([stdName, origName]) => (
              <div key={stdName} className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="font-medium text-slate-200 capitalize">{stdName.replace('_', ' ')}</span>
                  <span className="text-slate-500 mx-1">←</span>
                  <span className="text-slate-400 font-mono italic">{origName}</span>
                </div>
              </div>
            ))}
          </div>

          {unmappedColumns && unmappedColumns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/50 text-slate-400 flex items-center space-x-2">
              <span className="font-medium text-slate-300">Unmapped Columns:</span>
              <div className="flex flex-wrap gap-1.5">
                {unmappedColumns.map((col) => (
                  <span key={col} className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Database } from 'lucide-react';

export default function MappedFieldsBadge({ mappedColumns, unmappedColumns }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!mappedColumns || Object.keys(mappedColumns).length === 0) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-3 text-xs mb-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Database className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-semibold text-xs text-[var(--text-primary)]">Detected Schema & Mapped Fields</span>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-2 py-0.2 rounded font-mono text-[11px]">
            {Object.keys(mappedColumns).length} Columns Identified
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(mappedColumns).map(([stdName, origName]) => (
              <div key={stdName} className="flex items-center space-x-2 bg-[var(--bg-app)] border border-[var(--border-color)] p-2 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <div className="truncate text-xs">
                  <span className="font-semibold text-[var(--text-primary)] capitalize">{stdName.replace('_', ' ')}</span>
                  <span className="text-[var(--text-muted)] mx-1">←</span>
                  <span className="text-[var(--text-secondary)] font-mono italic">{origName}</span>
                </div>
              </div>
            ))}
          </div>

          {unmappedColumns && unmappedColumns.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center space-x-2">
              <span className="font-semibold text-[var(--text-secondary)]">Unmapped Columns:</span>
              <div className="flex flex-wrap gap-1">
                {unmappedColumns.map((col) => (
                  <span key={col} className="bg-[var(--bg-app)] border border-[var(--border-color)] px-1.5 py-0.2 rounded text-[var(--text-secondary)] font-mono">
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

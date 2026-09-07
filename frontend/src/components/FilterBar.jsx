import React from 'react';
import { Filter, RotateCcw, Calendar } from 'lucide-react';

export default function FilterBar({ filterCandidates, activeFilters, onFilterChange, onClearFilters, activeFilterCount }) {
  if (!filterCandidates || filterCandidates.length === 0) {
    return null;
  }

  const handleSelectChange = (colName, value) => {
    onFilterChange({
      ...activeFilters,
      [colName]: value
    });
  };

  const handleDateChange = (colName, type, val) => {
    const currentRange = activeFilters.dateRange || { column: colName, start: '', end: '' };
    onFilterChange({
      ...activeFilters,
      dateRange: {
        ...currentRange,
        column: colName,
        [type]: val
      }
    });
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <span>Interactive Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeFilterCount} Active
                </span>
              )}
            </h3>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-blue-500" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filterCandidates.map((candidate) => {
          const { column_name, type, options } = candidate;

          if (type === 'select') {
            const currentValue = activeFilters[column_name] || 'All';
            return (
              <div key={column_name} className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate">
                  {column_name}
                </label>
                <select
                  value={currentValue}
                  onChange={(e) => handleSelectChange(column_name, e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="All">All {column_name}s</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (type === 'date_range') {
            const dateRangeState = activeFilters.dateRange || { start: '', end: '' };
            return (
              <div key={column_name} className="flex flex-col space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-sky-500" />
                  <span>{column_name} Range</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={dateRangeState.start || ''}
                    onChange={(e) => handleDateChange(column_name, 'start', e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="text-[var(--text-muted)] text-xs">to</span>
                  <input
                    type="date"
                    value={dateRangeState.end || ''}
                    onChange={(e) => handleDateChange(column_name, 'end', e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

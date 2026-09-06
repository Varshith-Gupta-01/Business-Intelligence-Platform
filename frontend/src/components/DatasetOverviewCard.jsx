import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Layers, 
  Hash, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info,
  Database,
  BarChart3
} from 'lucide-react';

export default function DatasetOverviewCard({ overview, onGenerateDashboard }) {
  const [showColumnsTable, setShowColumnsTable] = useState(true);

  if (!overview) return null;

  const {
    file_name,
    file_size_formatted,
    row_count,
    column_count,
    total_cells,
    numeric_columns_count,
    categorical_columns_count,
    date_columns_count,
    total_missing_values,
    rows_with_missing_values,
    duplicate_rows,
    date_column_name,
    date_range,
    dataset_type,
    columns
  } = overview;

  const isSalesDataset = dataset_type === 'Sales Dataset';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Dataset Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 text-white shrink-0">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 mb-1">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isSalesDataset 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                }`}>
                  <Sparkles className="h-3 w-3" />
                  <span>{dataset_type}</span>
                </span>
                <span className="text-xs text-slate-500">• {file_size_formatted}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{file_name}</h2>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onGenerateDashboard}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Generate Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Main Metadata Section - 4 Key Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {/* Card 1: Basic Stats */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Basic Info</span>
              <Layers className="h-4 w-4 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Rows:</span>
                <span className="font-bold text-white text-base">{row_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Columns:</span>
                <span className="font-bold text-white text-base">{column_count}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-700/40 pt-1.5">
                <span className="text-xs text-slate-400">Total Cells:</span>
                <span className="font-medium text-slate-300 text-xs">{total_cells.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Column Types Breakdown */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Column Types</span>
              <Hash className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Numeric:</span>
                <span className="font-bold text-purple-300 text-sm bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                  {numeric_columns_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Categorical / Text:</span>
                <span className="font-bold text-slate-200 text-sm bg-slate-700/40 px-2 py-0.5 rounded-md">
                  {categorical_columns_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Date / Time:</span>
                <span className="font-bold text-sky-300 text-sm bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                  {date_columns_count}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Data Quality Indicators */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Data Quality</span>
              {total_missing_values === 0 && duplicate_rows === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Missing Values:</span>
                <span className={`font-bold text-sm ${total_missing_values === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {total_missing_values}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Rows w/ Missing:</span>
                <span className="font-medium text-slate-300 text-xs">{rows_with_missing_values}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-700/40 pt-1.5">
                <span className="text-xs text-slate-400">Duplicate Rows:</span>
                <span className={`font-bold text-xs ${duplicate_rows === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {duplicate_rows}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Date Range Info */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Date Timeline</span>
              <Calendar className="h-4 w-4 text-sky-400" />
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Detected Date Col</span>
                <p className="text-xs font-medium text-slate-200 truncate">{date_column_name}</p>
              </div>
              <div className="border-t border-slate-700/40 pt-1.5">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Date Range</span>
                <p className="text-xs font-bold text-sky-400">{date_range}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Column Summary Table */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setShowColumnsTable(!showColumnsTable)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Column Summary</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {columns.length} Columns
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <span>{showColumnsTable ? 'Hide Table' : 'Show Details'}</span>
              {showColumnsTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {showColumnsTable && (
            <div className="border-t border-slate-800 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Column Name</th>
                    <th className="py-3 px-4">Data Type</th>
                    <th className="py-3 px-4 text-right">Unique Values</th>
                    <th className="py-3 px-4 text-right">Missing Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-200">{col.column_name}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          col.data_type === 'Numeric' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : col.data_type === 'Date'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {col.data_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">{col.unique_values.toLocaleString()}</td>
                      <td className={`py-2.5 px-4 text-right font-mono font-medium ${col.missing_values > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {col.missing_values}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom CTA Card Action */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Dataset validated. Click below to view the executive sales dashboard.</span>
          </div>
          <button
            onClick={onGenerateDashboard}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Generate Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

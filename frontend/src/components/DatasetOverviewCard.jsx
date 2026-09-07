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
  BarChart3,
  Tag,
  Key,
  TrendingUp,
  Clock,
  FileText,
  ToggleLeft
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'identifier':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Key className="h-3 w-3" />
            <span>Identifier</span>
          </span>
        );
      case 'time_dimension':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Clock className="h-3 w-3" />
            <span>Time Dimension</span>
          </span>
        );
      case 'measure':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <TrendingUp className="h-3 w-3" />
            <span>Measure</span>
          </span>
        );
      case 'dimension':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Tag className="h-3 w-3" />
            <span>Dimension</span>
          </span>
        );
      case 'attribute':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <FileText className="h-3 w-3" />
            <span>Attribute</span>
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <ToggleLeft className="h-3 w-3" />
            <span>Boolean</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-color)]">
            <span>Unknown</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 space-y-4">
      {/* Workspace Header Panel */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  isSalesDataset 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' 
                    : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-500'
                }`}>
                  <Sparkles className="h-3 w-3" />
                  <span>{dataset_type}</span>
                </span>
                <span className="text-xs text-[var(--text-muted)]">• {file_size_formatted}</span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{file_name}</h2>
            </div>
          </div>

          <button
            onClick={onGenerateDashboard}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition-all cursor-pointer"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Generate Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Metadata Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          {/* Basic Info */}
          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Basic Info</span>
              <Layers className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--text-secondary)]">Rows:</span>
                <span className="font-bold text-[var(--text-primary)]">{row_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--text-secondary)]">Columns:</span>
                <span className="font-bold text-[var(--text-primary)]">{column_count}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-[var(--border-subtle)] pt-1">
                <span className="text-[var(--text-muted)]">Total Cells:</span>
                <span className="font-medium text-[var(--text-secondary)]">{total_cells.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Column Types */}
          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Column Types</span>
              <Hash className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Numeric:</span>
                <span className="font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20 text-[11px]">
                  {numeric_columns_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Categorical / Text:</span>
                <span className="font-bold text-[var(--text-primary)] text-[11px]">
                  {categorical_columns_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Date / Time:</span>
                <span className="font-bold text-sky-500 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20 text-[11px]">
                  {date_columns_count}
                </span>
              </div>
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Data Quality</span>
              {total_missing_values === 0 && duplicate_rows === 0 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--text-secondary)]">Missing Values:</span>
                <span className={`font-bold ${total_missing_values === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {total_missing_values}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--text-secondary)]">Rows w/ Missing:</span>
                <span className="font-medium text-[var(--text-secondary)]">{rows_with_missing_values}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-[var(--border-subtle)] pt-1">
                <span className="text-[var(--text-muted)]">Duplicate Rows:</span>
                <span className={`font-bold ${duplicate_rows === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {duplicate_rows}
                </span>
              </div>
            </div>
          </div>

          {/* Date Timeline */}
          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Date Timeline</span>
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Detected Date Col</span>
                <p className="font-medium text-[var(--text-primary)] truncate text-[11px]">{date_column_name}</p>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Date Range</span>
                <p className="font-bold text-sky-500 text-[11px]">{date_range}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid Column Profiler Table */}
        <div className="border border-[var(--border-color)] rounded-md bg-[var(--bg-app)] overflow-hidden">
          <button
            onClick={() => setShowColumnsTable(!showColumnsTable)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Column Summary & Semantic Roles</span>
              <span className="text-[11px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] px-2 py-0.2 rounded font-mono">
                {columns.length} Columns
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-[var(--text-muted)]">
              <span>{showColumnsTable ? 'Hide Grid' : 'Show Grid'}</span>
              {showColumnsTable ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </button>

          {showColumnsTable && (
            <div className="border-t border-[var(--border-color)] max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px] sticky top-0 border-b border-[var(--border-color)]">
                  <tr>
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3">Semantic Role</th>
                    <th className="py-2.5 px-3 text-right">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Unique Values</th>
                    <th className="py-2.5 px-3 text-right">Missing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-[var(--text-primary)]">{col.column_name}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                          {col.data_type}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {getRoleBadge(col.semantic_role)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">
                        {col.confidence ? `${Math.round(col.confidence * 100)}%` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[var(--text-primary)]">{col.unique_values.toLocaleString()}</td>
                      <td className={`py-2 px-3 text-right font-mono font-medium ${col.missing_values > 0 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                        {col.missing_values}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BarChart3, Upload, FileSpreadsheet, FileText } from 'lucide-react';

export default function Navbar({ dashboardData, viewState, onNavigateOverview, onReset }) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={dashboardData ? onNavigateOverview : undefined}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Sales BI Platform</h1>
            <p className="text-xs text-slate-400">Excel to Executive Dashboard</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        {dashboardData && (
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-slate-200">{dashboardData.file_name}</span>
              </div>
              <span className="text-slate-600">|</span>
              <span>{dashboardData.total_rows.toLocaleString()} Rows</span>
            </div>

            {viewState === 'DASHBOARD_VIEW' && (
              <button
                onClick={onNavigateOverview}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-sky-400" />
                <span>Dataset Overview</span>
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-blue-400" />
              <span>Upload New File</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

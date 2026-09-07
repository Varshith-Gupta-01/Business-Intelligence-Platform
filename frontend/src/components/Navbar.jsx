import React from 'react';
import { LayoutDashboard, Upload, FileSpreadsheet, FileText, Sun, Moon, Database } from 'lucide-react';

export default function Navbar({ dashboardData, viewState, onNavigateOverview, onNavigateDashboard, onReset, isLightTheme, onToggleTheme }) {
  return (
    <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-50 px-4 py-2.5 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Product Name */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={dashboardData ? onNavigateOverview : undefined}
        >
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight tracking-tight flex items-center space-x-2">
              <span>DataBI Workspace</span>
              <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.2 rounded uppercase">
                Phase 01
              </span>
            </h1>
          </div>
        </div>

        {/* View Switcher & Action Items */}
        <div className="flex items-center space-x-3">
          {dashboardData && (
            <>
              {/* Dataset File Info Pill */}
              <div className="hidden lg:flex items-center space-x-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold text-[var(--text-primary)]">{dashboardData.file_name}</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span>{dashboardData.total_rows.toLocaleString()} rows</span>
              </div>

              {/* View Switcher Buttons */}
              <div className="flex items-center bg-[var(--bg-app)] p-0.5 rounded-md border border-[var(--border-color)]">
                <button
                  onClick={onNavigateOverview}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    viewState === 'OVERVIEW_VIEW'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={onNavigateDashboard}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    viewState === 'DASHBOARD_VIEW'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>
              </div>

              {/* Upload New File */}
              <button
                onClick={onReset}
                className="flex items-center space-x-1.5 bg-[var(--bg-surface-hover)] hover:bg-blue-600 hover:text-white text-[var(--text-secondary)] border border-[var(--border-color)] px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload New</span>
              </button>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isLightTheme ? "Switch to Dark Theme" : "Switch to Light Theme"}
            className="p-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            {isLightTheme ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}

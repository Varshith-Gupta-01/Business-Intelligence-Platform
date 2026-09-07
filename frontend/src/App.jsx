import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import DatasetOverviewCard from './components/DatasetOverviewCard';
import FilterBar from './components/FilterBar';
import KpiGrid from './components/KpiGrid';
import ChartsGrid from './components/ChartsGrid';
import MappedFieldsBadge from './components/MappedFieldsBadge';
import ErrorBanner from './components/ErrorBanner';
import { recalculateDashboardData } from './utils/dashboardCalculator';
import { FilterX, RotateCcw } from 'lucide-react';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [viewState, setViewState] = useState('UPLOAD_VIEW'); // UPLOAD_VIEW | OVERVIEW_VIEW | DASHBOARD_VIEW
  const [activeFilters, setActiveFilters] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (isLightTheme) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  const handleReset = () => {
    setDashboardData(null);
    setActiveFilters({});
    setViewState('UPLOAD_VIEW');
    setError(null);
  };

  const handleUploadSuccess = (data) => {
    setDashboardData(data);
    setActiveFilters({});
    setError(null);
    setViewState('OVERVIEW_VIEW');
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  // Dynamically calculate active dashboard state using client-side recalculator
  const activeDashboard = useMemo(() => {
    if (!dashboardData) return null;
    return recalculateDashboardData(dashboardData, activeFilters);
  }, [dashboardData, activeFilters]);

  const filterCandidates = dashboardData?.semantic_profile?.filter_candidates || [];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors">
      {/* Top Navigation Ribbon */}
      <Navbar
        dashboardData={dashboardData}
        viewState={viewState}
        onNavigateOverview={() => setViewState('OVERVIEW_VIEW')}
        onNavigateDashboard={() => setViewState('DASHBOARD_VIEW')}
        onReset={handleReset}
        isLightTheme={isLightTheme}
        onToggleTheme={() => setIsLightTheme(!isLightTheme)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <ErrorBanner error={error} onClose={() => setError(null)} />

        {viewState === 'UPLOAD_VIEW' && (
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onError={setError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {viewState === 'OVERVIEW_VIEW' && dashboardData && (
          <DatasetOverviewCard
            overview={dashboardData.dataset_overview}
            onGenerateDashboard={() => setViewState('DASHBOARD_VIEW')}
          />
        )}

        {viewState === 'DASHBOARD_VIEW' && activeDashboard && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Column Schema Badge */}
            <MappedFieldsBadge
              mappedColumns={activeDashboard.mapped_columns}
              unmappedColumns={activeDashboard.unmapped_columns}
            />

            {/* Interactive Filter Bar */}
            <FilterBar
              filterCandidates={filterCandidates}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeDashboard.activeFilterCount || 0}
            />

            {/* Empty State vs Active Dashboard */}
            {activeDashboard.isEmpty ? (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-10 text-center my-6 shadow-sm">
                <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-amber-500">
                  <FilterX className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">No matching records found</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-5">
                  No records match your active filter criteria. Try selecting different options or clear your filters to view full analytics.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md text-xs transition-all shadow-sm cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* Top KPI Metric Cards */}
                <KpiGrid kpis={activeDashboard.kpis} />

                {/* Charts Visualizations Grid */}
                <ChartsGrid charts={activeDashboard.charts} />
              </>
            )}
          </div>
        )}
      </main>

      {/* BI Workspace Footer Status Bar */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-3 px-6 text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-[var(--text-secondary)]">DataBI Platform</span>
          <span>•</span>
          <span>Phase 01 Business Intelligence Workspace</span>
        </div>
        {dashboardData && (
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Active Dataset: <strong className="text-[var(--text-primary)]">{dashboardData.file_name}</strong></span>
            <span>•</span>
            <span>{dashboardData.total_rows.toLocaleString()} Records</span>
          </div>
        )}
      </footer>
    </div>
  );
}

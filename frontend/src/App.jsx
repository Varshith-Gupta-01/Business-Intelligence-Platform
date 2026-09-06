import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import DatasetOverviewCard from './components/DatasetOverviewCard';
import KpiGrid from './components/KpiGrid';
import ChartsGrid from './components/ChartsGrid';
import MappedFieldsBadge from './components/MappedFieldsBadge';
import ErrorBanner from './components/ErrorBanner';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [viewState, setViewState] = useState('UPLOAD_VIEW'); // UPLOAD_VIEW | OVERVIEW_VIEW | DASHBOARD_VIEW
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setDashboardData(null);
    setViewState('UPLOAD_VIEW');
    setError(null);
  };

  const handleUploadSuccess = (data) => {
    setDashboardData(data);
    setError(null);
    setViewState('OVERVIEW_VIEW');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        dashboardData={dashboardData}
        viewState={viewState}
        onNavigateOverview={() => setViewState('OVERVIEW_VIEW')}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
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

        {viewState === 'DASHBOARD_VIEW' && dashboardData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Column Schema Badge */}
            <MappedFieldsBadge
              mappedColumns={dashboardData.mapped_columns}
              unmappedColumns={dashboardData.unmapped_columns}
            />

            {/* Top KPI Metric Cards */}
            <KpiGrid kpis={dashboardData.kpis} />

            {/* Charts Visualizations Grid */}
            <ChartsGrid charts={dashboardData.charts} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        AI Business Intelligence Platform • Phase 01 Task 02 • Dataset Overview & Sales Dashboard
      </footer>
    </div>
  );
}

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Layers, Percent, Package } from 'lucide-react';

export default function KpiGrid({ kpis }) {
  if (!kpis || Object.keys(kpis).length === 0) {
    return null;
  }

  const getKpiConfig = (key) => {
    switch (key) {
      case 'total_sales':
        return {
          icon: DollarSign,
          color: 'border-blue-500/30 text-blue-500',
          iconBg: 'bg-blue-500/10 text-blue-500',
        };
      case 'total_profit':
        return {
          icon: TrendingUp,
          color: 'border-emerald-500/30 text-emerald-500',
          iconBg: 'bg-emerald-500/10 text-emerald-500',
        };
      case 'total_orders':
        return {
          icon: ShoppingBag,
          color: 'border-purple-500/30 text-purple-500',
          iconBg: 'bg-purple-500/10 text-purple-500',
        };
      case 'total_quantity':
        return {
          icon: Package,
          color: 'border-amber-500/30 text-amber-500',
          iconBg: 'bg-amber-500/10 text-amber-500',
        };
      case 'avg_order_value':
        return {
          icon: Layers,
          color: 'border-sky-500/30 text-sky-500',
          iconBg: 'bg-sky-500/10 text-sky-500',
        };
      case 'profit_margin':
        return {
          icon: Percent,
          color: 'border-rose-500/30 text-rose-500',
          iconBg: 'bg-rose-500/10 text-rose-500',
        };
      default:
        return {
          icon: DollarSign,
          color: 'border-[var(--border-color)] text-[var(--text-secondary)]',
          iconBg: 'bg-[var(--bg-app)] text-[var(--text-secondary)]',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {Object.entries(kpis).map(([key, data]) => {
        const config = getKpiConfig(key);
        const IconComponent = config.icon;

        return (
          <div
            key={key}
            className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 shadow-sm flex flex-col justify-between transition-colors hover:border-blue-500/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {data.title}
              </span>
              <div className={`p-1.5 rounded-md ${config.iconBg}`}>
                <IconComponent className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mb-0.5 font-mono">
                {data.formatted}
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Active dataset aggregate</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Layers, Percent, Package } from 'lucide-react';

export default function KpiGrid({ kpis }) {
  if (!kpis || Object.keys(kpis).length === 0) {
    return null;
  }

  const getKpiConfig = (key, data) => {
    switch (key) {
      case 'total_sales':
        return {
          icon: DollarSign,
          color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
          iconBg: 'bg-blue-500/20 text-blue-400',
          accent: 'text-blue-400'
        };
      case 'total_profit':
        return {
          icon: TrendingUp,
          color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          accent: 'text-emerald-400'
        };
      case 'total_orders':
        return {
          icon: ShoppingBag,
          color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400',
          iconBg: 'bg-purple-500/20 text-purple-400',
          accent: 'text-purple-400'
        };
      case 'total_quantity':
        return {
          icon: Package,
          color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
          iconBg: 'bg-amber-500/20 text-amber-400',
          accent: 'text-amber-400'
        };
      case 'avg_order_value':
        return {
          icon: Layers,
          color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 text-sky-400',
          iconBg: 'bg-sky-500/20 text-sky-400',
          accent: 'text-sky-400'
        };
      case 'profit_margin':
        return {
          icon: Percent,
          color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
          iconBg: 'bg-rose-500/20 text-rose-400',
          accent: 'text-rose-400'
        };
      default:
        return {
          icon: DollarSign,
          color: 'from-slate-800 to-slate-800 border-slate-700 text-slate-300',
          iconBg: 'bg-slate-700 text-slate-300',
          accent: 'text-slate-200'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {Object.entries(kpis).map(([key, data]) => {
        const config = getKpiConfig(key, data);
        const IconComponent = config.icon;

        return (
          <div
            key={key}
            className={`relative bg-gradient-to-br ${config.color} border rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {data.title}
              </span>
              <div className={`p-2.5 rounded-xl ${config.iconBg}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-white tracking-tight mb-1">
                {data.formatted}
              </div>
              <p className="text-[11px] text-slate-400">Calculated from worksheet</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

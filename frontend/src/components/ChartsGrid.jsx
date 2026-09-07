import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { TrendingUp, MapPin, Tag, Award, PieChart, PackageCheck } from 'lucide-react';

// Power BI Desktop Categorical Palette
const POWER_BI_COLORS = [
  '#118DFF',
  '#12239E',
  '#E66C37',
  '#6B007B',
  '#E044A7',
  '#744EC2',
  '#D9B300',
  '#D64550',
  '#197278',
  '#1AAB40'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-2.5 rounded shadow-md text-xs space-y-1">
        <p className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-semibold text-[var(--text-primary)] font-mono">
              {typeof entry.value === 'number' && (entry.name.includes('sales') || entry.name.includes('profit'))
                ? `$${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsGrid({ charts }) {
  if (!charts || Object.keys(charts).length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-8 text-center text-[var(--text-muted)] text-xs">
        No chart visualizations available for the columns in this dataset.
      </div>
    );
  }

  const { sales_trend, sales_by_region, sales_by_category, top_products, profit_analysis, quantity_analysis } = charts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Sales Trend Chart */}
      {sales_trend && sales_trend.data?.length > 0 && (
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#118DFF]/10 text-[#118DFF] rounded">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{sales_trend.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Monthly breakdown over dataset period</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales_trend.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '6px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#118DFF" strokeWidth={2} fill="#118DFF" fillOpacity={0.15} />
                {sales_trend.series.includes('profit') && (
                  <Area type="monotone" dataKey="profit" name="Profit ($)" stroke="#107C10" strokeWidth={2} fill="#107C10" fillOpacity={0.15} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. Sales by Region */}
      {sales_by_region && sales_by_region.data?.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#12239E]/10 text-[#118DFF] rounded">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{sales_by_region.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Geographic sales performance</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_by_region.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="region" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" name="Sales ($)" radius={[2, 2, 0, 0]}>
                  {sales_by_region.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={POWER_BI_COLORS[index % POWER_BI_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Sales by Category */}
      {sales_by_category && sales_by_category.data?.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#6B007B]/10 text-[#6B007B] rounded">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{sales_by_category.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Revenue split across product lines</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_by_category.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" name="Sales ($)" fill="#118DFF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Top 10 Products by Sales */}
      {top_products && top_products.data?.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#E66C37]/10 text-[#E66C37] rounded">
              <Award className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{top_products.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Top revenue generating items</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top_products.data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="product" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" name="Sales ($)" fill="#E66C37" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. Profit Analysis */}
      {profit_analysis && profit_analysis.data?.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#107C10]/10 text-[#107C10] rounded">
              <PieChart className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{profit_analysis.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Net margin contributions</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profit_analysis.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" name="Profit ($)" fill="#107C10" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 6. Quantity Analysis */}
      {quantity_analysis && quantity_analysis.data?.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[var(--border-color)]">
            <div className="p-1 bg-[#1AAB40]/10 text-[#1AAB40] rounded">
              <PackageCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{quantity_analysis.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Units sold distribution</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quantity_analysis.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" name="Quantity Sold" fill="#1AAB40" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

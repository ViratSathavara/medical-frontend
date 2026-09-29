import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  color?: 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo';
  change?: number;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  isPositive = true,
  color = 'primary',
  change,
  description,
}) => {
  const colorSchemes = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const displayTrend = trend || (change !== undefined ? `${change >= 0 ? '+' : ''}${change}%` : undefined);
  const positive = change !== undefined ? change >= 0 : isPositive;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', colorSchemes[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {displayTrend && (
          <span
            className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              positive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            )}
          >
            {displayTrend}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-500 font-normal line-clamp-1">{description}</p>
      )}
    </div>
  );
};

import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className = '',
}) {
  const badgeColors = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </h4>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-navy-800/80">
        <span className="text-slate-500 dark:text-slate-400 truncate pr-2">{subtext}</span>
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium shrink-0 ${
              badgeColors[badgeVariant] || badgeColors.neutral
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

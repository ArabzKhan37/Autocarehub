import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-navy-700/80 bg-slate-50/50 dark:bg-navy-900/40 my-4">
      {Icon && (
        <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-500 dark:text-cyan-400 mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Calendar, Gauge, X, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatDistance } from '../utils/formatting';
import { useNavigate } from 'react-router-dom';

export default function ReminderCenterModal({ isOpen, onClose }) {
  const { reminders, completeMaintenance } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Active Maintenance Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reminders.length === 0
                  ? 'All scheduled services are up to date'
                  : `${reminders.length} actionable service reminder${reminders.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-navy-800/60">
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                No Pending Reminders
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                All scheduled vehicle servicing tasks are on track. Keep recording your services to maintain active health insights.
              </p>
            </div>
          ) : (
            reminders.map((task) => {
              const isOverdue = task.status === 'Overdue';
              return (
                <div key={task.id} className="pt-3 first:pt-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 p-1.5 rounded-lg ${
                          isOverdue
                            ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                            : 'bg-amber-500/15 text-amber-500 dark:text-amber-400'
                        }`}
                      >
                        {isOverdue ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {task.vehicle?.nickname || 'Vehicle'}
                          </span>
                          <span>•</span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
                        isOverdue
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Reminder reason box */}
                  <div className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-navy-800/70 border border-slate-100 dark:border-navy-700/60 text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {task.nextServiceDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Target: {formatDate(task.nextServiceDate)}
                        </span>
                      )}
                      {task.nextServiceOdometer && (
                        <span className="inline-flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          Target: {formatDistance(task.nextServiceOdometer)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-amber-600 dark:text-amber-300">
                      Reason: {task.reason}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/maintenance');
                      }}
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-500 px-2.5 py-1.5"
                    >
                      View in Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={() => completeMaintenance(task.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Reminders recalculate automatically with each odometer or service entry.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

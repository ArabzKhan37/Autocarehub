import React from 'react';
import {
  Car,
  Calendar,
  Gauge,
  Fuel,
  Edit2,
  Trash2,
  Wrench,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { formatDistance, formatMileage, formatDate } from '../utils/formatting';

export default function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onLogService,
  onAddExpense,
}) {
  const fuelBadges = {
    Petrol: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Diesel: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Electric: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Hybrid: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
    CNG: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {vehicle.nickname}
                </h3>
                {vehicle.isDemo && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {vehicle.manufacturer} {vehicle.model} • {vehicle.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Edit Vehicle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(vehicle)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${
              fuelBadges[vehicle.fuelType] || 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {vehicle.fuelType}
          </span>
          {vehicle.registrationNumber ? (
            <span className="px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/80 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium">
              {vehicle.registrationNumber}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 italic">No Reg No.</span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Odometer</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDistance(vehicle.odometer)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-brand-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Avg. Mileage</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatMileage(vehicle.mileage)}
              </span>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-navy-800/60">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-slate-400">Last Serviced:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDate(vehicle.lastServiceDate)}
              </span>
            </div>
          </div>
        </div>

        {vehicle.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
            "{vehicle.notes}"
          </p>
        )}
      </div>

      {/* Quick Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-navy-800/80">
        <button
          type="button"
          onClick={() => onLogService(vehicle)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Schedule or log a service"
        >
          <Wrench className="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400" />
          <span>Service</span>
        </button>

        <button
          type="button"
          onClick={() => onAddExpense(vehicle)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Add an expense for this car"
        >
          <Receipt className="w-3.5 h-3.5 text-amber-500" />
          <span>Expense</span>
        </button>

        <button
          type="button"
          onClick={() => onPrintReport(vehicle)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-colors"
          title="Print official service passport"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>
    </div>
  );
}

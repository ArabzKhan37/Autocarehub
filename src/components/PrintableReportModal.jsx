import React from 'react';
import { Printer, X, Car, Calendar, Gauge, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatINR, formatDistance, formatDate } from '../utils/formatting';
import { computeTaskStatus } from '../utils/maintenance';

export default function PrintableReportModal({ isOpen, onClose, vehicle, maintenance, expenses }) {
  if (!isOpen || !vehicle) return null;

  const vehicleTasks = maintenance.filter((m) => m.vehicleId === vehicle.id);
  const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);

  const completedTasks = vehicleTasks.filter((m) => m.isCompleted);
  const pendingTasks = vehicleTasks.filter((m) => !m.isCompleted);

  const totalMaintenanceCost = vehicleTasks.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const totalExpenseAmount = vehicleExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header - Not printed */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vehicle Service Booklet & Health Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or save as PDF for mechanic inspection or resale valuation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="printable-area" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:p-0">
          {/* Certificate Header */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-navy-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
                  AutoCare Hub
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Vehicle Passport
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive Vehicle Upkeep & Maintenance Record
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <p>Generated: {formatDate(new Date().toISOString())}</p>
              <p className="font-mono text-[11px]">ID: {vehicle.id.toUpperCase()}</p>
            </div>
          </div>

          {/* Vehicle Profile Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Vehicle</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {vehicle.nickname}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Registration</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {vehicle.registrationNumber || 'Not Registered'}
              </span>
              <span className="text-[11px] text-slate-500 block">Fuel: {vehicle.fuelType}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Current Odometer</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatDistance(vehicle.odometer)}
              </span>
              <span className="text-[11px] text-slate-500 block">Mileage: {vehicle.mileage} km/L</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Total Upkeep</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(totalExpenseAmount)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {vehicleTasks.length} services recorded
              </span>
            </div>
          </div>

          {/* Pending / Upcoming Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Scheduled / Upcoming Maintenance
            </h4>
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-navy-950/40">
                No pending maintenance tasks scheduled.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-slate-500">
                    <tr>
                      <th className="p-2.5">Task Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Target Date</th>
                      <th className="p-2.5">Target Odometer</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
                    {pendingTasks.map((t) => {
                      const statusMeta = computeTaskStatus(t, vehicle);
                      return (
                        <tr key={t.id}>
                          <td className="p-2.5 font-medium">{t.title}</td>
                          <td className="p-2.5">{t.category}</td>
                          <td className="p-2.5">{t.nextServiceDate ? formatDate(t.nextServiceDate) : 'Open'}</td>
                          <td className="p-2.5">{t.nextServiceOdometer ? formatDistance(t.nextServiceOdometer) : '—'}</td>
                          <td className="p-2.5 font-semibold text-amber-600 dark:text-amber-400">
                            {statusMeta.status}
                          </td>
                          <td className="p-2.5 text-right">{t.cost ? formatINR(t.cost) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Service History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Completed Service History Log
            </h4>
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-navy-950/40">
                No past completed services recorded yet.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-slate-500">
                    <tr>
                      <th className="p-2.5">Service Task</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Completed On</th>
                      <th className="p-2.5">Notes</th>
                      <th className="p-2.5 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
                    {completedTasks.map((t) => (
                      <tr key={t.id}>
                        <td className="p-2.5 font-medium">{t.title}</td>
                        <td className="p-2.5">{t.category}</td>
                        <td className="p-2.5">{formatDate(t.completedDate || t.lastServiceDate)}</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 truncate max-w-xs">{t.notes || 'Routine service'}</td>
                        <td className="p-2.5 text-right font-medium">{t.cost ? formatINR(t.cost) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Certification Sign-off Block */}
          <div className="pt-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Certified AutoCare Hub Digital Service Passport</span>
            </div>
            <div className="text-right">
              <span>Owner / Workshop Signature: _______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

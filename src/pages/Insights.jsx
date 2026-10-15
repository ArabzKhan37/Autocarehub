import React, { useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Car,
  Fuel,
  Wrench,
  Receipt,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatting';
import { computeTaskStatus } from '../utils/maintenance';

export default function Insights() {
  const { vehicles, maintenance, expenses } = useApp();

  // Rules-based insights generator
  const insights = useMemo(() => {
    const list = [];

    // Rule 1: Vehicle count check
    if (vehicles.length === 0) {
      list.push({
        id: 'no-vehicles',
        type: 'warning',
        title: 'No Registered Vehicles Found',
        summary: 'Add a vehicle to enable automated health monitoring and maintenance forecasting.',
        reason: 'The Smart Insights engine requires at least one registered vehicle to analyze odometer intervals and running costs.',
        icon: Car,
        category: 'Garage Setup',
      });
      return list;
    }

    // Rule 2: Missing odometer check
    const vehiclesMissingOdo = vehicles.filter((v) => !v.odometer || Number(v.odometer) === 0);
    if (vehiclesMissingOdo.length > 0) {
      list.push({
        id: 'missing-odometer',
        type: 'warning',
        title: 'Missing or Zero Odometer Readings Detected',
        summary: `Update the current odometer reading for ${vehiclesMissingOdo.map((v) => v.nickname).join(', ')}.`,
        reason: 'Without an accurate current odometer, distance-based service reminders cannot accurately calculate remaining interval buffers.',
        icon: AlertTriangle,
        category: 'Maintenance Accuracy',
      });
    }

    // Rule 3: Active maintenance reminders check
    const pendingTasks = maintenance.filter((m) => !m.isCompleted);
    let overdueCount = 0;
    let dueSoonCount = 0;
    let nextOilService = null;

    pendingTasks.forEach((t) => {
      const v = vehicles.find((x) => x.id === t.vehicleId);
      const statusMeta = computeTaskStatus(t, v);
      if (statusMeta.status === 'Overdue') overdueCount++;
      if (statusMeta.status === 'Due soon') dueSoonCount++;
      if (t.category.toLowerCase().includes('oil') && !nextOilService) {
        nextOilService = { task: t, status: statusMeta.status, reason: statusMeta.reason };
      }
    });

    if (overdueCount > 0) {
      list.push({
        id: 'overdue-alert',
        type: 'danger',
        title: `${overdueCount} Service ${overdueCount === 1 ? 'Task is' : 'Tasks are'} Overdue`,
        summary: 'Scheduled maintenance deadlines have passed based on calendar dates or odometer mileage thresholds.',
        reason: 'Delaying engine oil, brake inspections, or tyre rotations causes accelerated engine wear and compromises road safety.',
        icon: Wrench,
        category: 'Critical Maintenance',
      });
    } else if (dueSoonCount > 0) {
      list.push({
        id: 'due-soon-alert',
        type: 'warning',
        title: `${dueSoonCount} Service ${dueSoonCount === 1 ? 'Task is' : 'Tasks are'} Due Soon`,
        summary: 'Maintenance tasks are approaching their scheduled dates within the next 14 days or 500 km.',
        reason: 'Planning ahead allows you to order genuine parts or schedule workshop appointments before intervals expire.',
        icon: Wrench,
        category: 'Upcoming Service',
      });
    }

    if (nextOilService && nextOilService.status !== 'Completed') {
      list.push({
        id: 'oil-reminder',
        type: 'info',
        title: 'Engine Oil Replacement Approaching',
        summary: `Your next oil-service reminder for "${nextOilService.task.title}" is ${nextOilService.reason.toLowerCase()}.`,
        reason: 'Engine oil degrades with thermal cycles. Modern synthetic lubricants require replacement within 10,000 km or 6 months.',
        icon: Wrench,
        category: 'Engine Health',
      });
    }

    // Rule 4: Fuel expense ratio check
    const totalExp = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const fuelExp = expenses
      .filter((e) => e.category === 'Fuel')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    if (totalExp > 0) {
      const fuelPercentage = Math.round((fuelExp / totalExp) * 100);
      if (fuelPercentage >= 50) {
        list.push({
          id: 'fuel-ratio',
          type: 'info',
          title: `Fuel Represents ${fuelPercentage}% of Total Spending`,
          summary: `You have spent ${formatINR(fuelExp)} on fuel out of ${formatINR(totalExp)} in total recorded vehicle expenses.`,
          reason: 'Calculated by dividing recorded fuel transactions by overall automobile expenditures.',
          icon: Fuel,
          category: 'Running Cost Economics',
        });
      }
    } else {
      list.push({
        id: 'no-expenses',
        type: 'neutral',
        title: 'No Expenses Recorded Yet',
        summary: 'Add fuel receipts and service invoices to reveal spending distributions and operational running costs.',
        reason: 'Expense ratio insights require historical transaction entries.',
        icon: Receipt,
        category: 'Cost Tracking',
      });
    }

    // Rule 5: Multi-vehicle fuel efficiency comparison insight
    if (vehicles.length >= 2) {
      const sortedByMileage = [...vehicles].sort((a, b) => Number(b.mileage) - Number(a.mileage));
      const highest = sortedByMileage[0];
      const lowest = sortedByMileage[sortedByMileage.length - 1];
      const diff = Number(highest.mileage) - Number(lowest.mileage);

      if (diff > 0) {
        list.push({
          id: 'fleet-efficiency',
          type: 'success',
          title: `Fleet Efficiency: ${highest.nickname} vs ${lowest.nickname}`,
          summary: `${highest.nickname} delivers ${highest.mileage} km/L compared to ${lowest.nickname}'s ${lowest.mileage} km/L (+${diff.toFixed(1)} km/L advantage).`,
          reason: 'Using your more fuel-efficient vehicle for daily commutes significantly reduces cumulative monthly fuel costs.',
          icon: TrendingDown,
          category: 'Vehicle Economics',
        });
      }
    } else {
      list.push({
        id: 'single-vehicle',
        type: 'neutral',
        title: 'Add a Second Vehicle to Unlock Comparative Savings',
        summary: 'Compare running costs and trip expenses side-by-side by registering another car in your garage.',
        reason: 'Vehicle comparison rules activate when 2 or more automobiles exist in your garage.',
        icon: Car,
        category: 'Fleet Analytics',
      });
    }

    return list;
  }, [vehicles, maintenance, expenses]);

  const badgeStyles = {
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  const cardBorders = {
    danger: 'border-rose-500/30 bg-rose-50/30 dark:bg-navy-900/90',
    warning: 'border-amber-500/30 bg-amber-50/30 dark:bg-navy-900/90',
    success: 'border-emerald-500/30 bg-emerald-50/30 dark:bg-navy-900/90',
    info: 'border-cyan-500/30 bg-cyan-50/30 dark:bg-navy-900/90',
    neutral: 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Smart Insights Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Rules-based automotive intelligence explaining maintenance urgency, fuel efficiency & spending patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>Explainable Intelligence:</strong> AutoCare Hub uses a transparent deterministic rules engine based entirely on your locally stored garage records and recorded odometer readings.
          </p>
          <p className="text-slate-400">
            No external cloud AI APIs, black-box algorithms, or unverified claims are involved.
          </p>
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all ${
                cardBorders[item.type] || cardBorders.neutral
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-brand-600 dark:text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      badgeStyles[item.type] || badgeStyles.neutral
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>

              {/* Explainability Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-navy-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Why you see this:</strong> {item.reason}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

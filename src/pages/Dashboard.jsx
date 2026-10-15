import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Wrench,
  Receipt,
  Fuel,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import VehicleModal from '../components/VehicleModal';
import MaintenanceModal from '../components/MaintenanceModal';
import ExpenseModal from '../components/ExpenseModal';
import { formatINR, formatDistance, formatDate } from '../utils/formatting';
import { computeTaskStatus } from '../utils/maintenance';

export default function Dashboard() {
  const {
    vehicles,
    maintenance,
    expenses,
    reminders,
    overdueCount,
    dueSoonCount,
    addVehicle,
    addMaintenance,
    addExpense,
    completeMaintenance,
  } = useApp();

  const navigate = useNavigate();

  // Modal states for Quick Actions
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Compute statistics
  const currentMonthExpenses = useMemo(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const thisMonthList = expenses.filter((e) => (e.date || '').startsWith(currentMonthKey));
    // If no expenses this month, compute total of all expenses or fallback gracefully
    const total = thisMonthList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return {
      total,
      count: thisMonthList.length,
      allTotal: expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    };
  }, [expenses]);

  const fuelStats = useMemo(() => {
    const fuelExpenses = expenses.filter((e) => e.category === 'Fuel');
    const totalFuel = fuelExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return {
      total: totalFuel,
      count: fuelExpenses.length,
    };
  }, [expenses]);

  // Maintenance summary counts
  const maintenanceSummary = useMemo(() => {
    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;
    let upcoming = 0;

    maintenance.forEach((task) => {
      const v = vehicles.find((x) => x.id === task.vehicleId);
      const st = computeTaskStatus(task, v);
      if (st.status === 'Completed') completed++;
      else if (st.status === 'Overdue') overdue++;
      else if (st.status === 'Due soon') dueSoon++;
      else upcoming++;
    });

    return { completed, overdue, dueSoon, upcoming, total: maintenance.length };
  }, [maintenance, vehicles]);

  // Chart data: Monthly expenses by category
  const chartData = useMemo(() => {
    const map = {};
    const months = ['Aug', 'Sep', 'Oct'];
    months.forEach((m) => {
      map[m] = { month: m, Fuel: 0, Servicing: 0, Other: 0 };
    });

    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      if (!map[monthName]) {
        map[monthName] = { month: monthName, Fuel: 0, Servicing: 0, Other: 0 };
      }
      const cat = e.category === 'Fuel' ? 'Fuel' : e.category === 'Servicing' ? 'Servicing' : 'Other';
      map[monthName][cat] += Number(e.amount) || 0;
    });

    return Object.values(map);
  }, [expenses]);

  // Recent maintenance tasks (last 4)
  const recentMaintenance = useMemo(() => {
    return [...maintenance]
      .sort((a, b) => new Date(b.lastServiceDate || 0) - new Date(a.lastServiceDate || 0))
      .slice(0, 4);
  }, [maintenance]);

  // Recent expenses (last 5)
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 border border-navy-700/80 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Demo Mode Active
            </span>
            <span className="text-xs text-slate-400">AutoCare Hub v1.0</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Vehicle Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor garage health, track service schedules, log running costs, and calculate fuel expenditure.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddVehicleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
          <button
            type="button"
            onClick={() => setIsAddMaintenanceOpen(true)}
            disabled={vehicles.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-40"
          >
            <Wrench className="w-4 h-4 text-cyan-400" /> Log Service
          </button>
          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            disabled={vehicles.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-40"
          >
            <Receipt className="w-4 h-4 text-amber-400" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Vehicles"
          value={vehicles.length}
          subtext={vehicles.length > 0 ? `${vehicles.map((v) => v.nickname).join(', ')}` : 'No vehicles added'}
          icon={Car}
          badgeText={vehicles.length > 0 ? 'Active' : 'Empty'}
          badgeVariant={vehicles.length > 0 ? 'info' : 'neutral'}
        />

        <StatCard
          title="Maintenance Tasks"
          value={maintenance.length}
          subtext={
            overdueCount > 0
              ? `${overdueCount} overdue, ${dueSoonCount} due soon`
              : 'All scheduled tasks on track'
          }
          icon={Wrench}
          badgeText={overdueCount > 0 ? 'Needs Attention' : dueSoonCount > 0 ? 'Due Soon' : 'Healthy'}
          badgeVariant={overdueCount > 0 ? 'danger' : dueSoonCount > 0 ? 'warning' : 'success'}
        />

        <StatCard
          title="Recorded Expenses"
          value={formatINR(currentMonthExpenses.allTotal)}
          subtext={`${expenses.length} logged expense entries`}
          icon={Receipt}
          badgeText="Total"
          badgeVariant="neutral"
        />

        <StatCard
          title="Fuel Expenditure"
          value={formatINR(fuelStats.total)}
          subtext={`${fuelStats.count} fuel refills recorded`}
          icon={Fuel}
          badgeText="Running Cost"
          badgeVariant="info"
        />
      </div>

      {/* Urgency Alert Bar if Overdue / Due soon */}
      {reminders.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">
                {overdueCount > 0
                  ? `Attention Required: ${overdueCount} service task is overdue and ${dueSoonCount} due soon.`
                  : `Service Reminder: ${dueSoonCount} service task scheduled within the next 14 days.`}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Regular servicing prevents expensive mechanical breakdowns and improves fuel mileage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/maintenance')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all whitespace-nowrap"
          >
            Review Reminders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts & Status Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Expenditure Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of fuel, servicing, and other running expenses
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
              INR (₹)
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value) => [formatINR(value), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Fuel" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Fuel" />
                <Bar dataKey="Servicing" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} name="Servicing" />
                <Bar dataKey="Other" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Fuel
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500" /> Servicing
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500" /> Other
            </div>
          </div>
        </div>

        {/* Maintenance Status Summary */}
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Service Status
              </h3>
              <span className="text-xs text-slate-400">{maintenance.length} Total</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Overdue Services
                  </span>
                </div>
                <span className="text-sm font-bold text-rose-500">
                  {maintenanceSummary.overdue}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Due Within 14 Days
                  </span>
                </div>
                <span className="text-sm font-bold text-amber-500">
                  {maintenanceSummary.dueSoon}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upcoming Tasks
                  </span>
                </div>
                <span className="text-sm font-bold text-cyan-500">
                  {maintenanceSummary.upcoming}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Completed Records
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-500">
                  {maintenanceSummary.completed}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={() => navigate('/fuel-calculator')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-cyan-400 transition-colors"
            >
              <Fuel className="w-4 h-4" /> Calculate Trip Fuel Cost
            </button>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Maintenance & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance Activities */}
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Maintenance Activities
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest service intervals and inspections
              </p>
            </div>
            <button
              onClick={() => navigate('/maintenance')}
              className="text-xs font-medium text-brand-500 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentMaintenance.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No maintenance tasks logged"
              description="Keep your cars running smoothly by scheduling periodic inspections."
              actionLabel="Add Task"
              onAction={() => setIsAddMaintenanceOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((task) => {
                const v = vehicles.find((x) => x.id === task.vehicleId);
                const statusMeta = computeTaskStatus(task, v);
                const isOverdue = statusMeta.status === 'Overdue';
                const isDueSoon = statusMeta.status === 'Due soon';
                const isCompleted = statusMeta.status === 'Completed';

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isOverdue
                            ? 'bg-rose-500/10 text-rose-500'
                            : isDueSoon
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-cyan-500/10 text-cyan-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {v?.nickname || 'Vehicle'} • {task.category} • Last: {formatDate(task.lastServiceDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : isOverdue
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : isDueSoon
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {statusMeta.status}
                      </span>
                      {task.cost > 0 && (
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {formatINR(task.cost)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expense Transactions */}
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest fuel refills, repairs & maintenance receipts
              </p>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="text-xs font-medium text-brand-500 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses logged"
              description="Keep track of every rupee spent on fuel, repairs, and washes."
              actionLabel="Add Expense"
              onAction={() => setIsAddExpenseOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const v = vehicles.find((x) => x.id === expense.vehicleId);
                return (
                  <div
                    key={expense.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {expense.description}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {v?.nickname || 'Vehicle'} • {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatINR(expense.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Modals */}
      <VehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSubmit={addVehicle}
      />

      <MaintenanceModal
        isOpen={isAddMaintenanceOpen}
        onClose={() => setIsAddMaintenanceOpen(false)}
        onSubmit={addMaintenance}
      />

      <ExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={addExpense}
      />
    </div>
  );
}

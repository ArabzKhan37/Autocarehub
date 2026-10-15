import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  Car,
  Calendar,
  Trash2,
  Edit2,
  IndianRupee,
  PieChart as PieIcon,
  Search,
  Fuel,
  ArrowUpDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import ExpenseModal, { EXPENSE_CATEGORIES } from '../components/ExpenseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { formatINR, formatDate } from '../utils/formatting';

const CATEGORY_COLORS = {
  Fuel: '#3b82f6',
  Servicing: '#06b6d4',
  Repairs: '#ef4444',
  Insurance: '#8b5cf6',
  Tyres: '#f59e0b',
  Washing: '#10b981',
  Parking: '#64748b',
  Other: '#94a3b8',
};

export default function Expenses() {
  const {
    expenses,
    vehicles,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        if (vehicleFilter !== 'All' && item.vehicleId !== vehicleFilter) {
          return false;
        }
        if (categoryFilter !== 'All' && item.category !== categoryFilter) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchCat = (item.category || '').toLowerCase().includes(q);
          if (!matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
        if (sortBy === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
        if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
        if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
        return 0;
      });
  }, [expenses, vehicleFilter, categoryFilter, searchQuery, sortBy]);

  // Statistics
  const totalExpenditure = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  const fuelTotal = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'Fuel')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  const maintenanceTotal = useMemo(() => {
    return expenses
      .filter((e) => ['Servicing', 'Repairs', 'Tyres'].includes(e.category))
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });

    return Object.entries(map).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: CATEGORY_COLORS[category] || '#94a3b8',
    }));
  }, [expenses]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (data) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Vehicle Expense Tracker
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {expenses.length} Record{expenses.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log fuel fills, maintenance bills, insurance, washes and parking fees.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          disabled={vehicles.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all shrink-0 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Log Expense
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Spending"
          value={formatINR(totalExpenditure)}
          subtext="Cumulative vehicle expenditure"
          icon={Receipt}
          badgeText="Recorded"
          badgeVariant="neutral"
        />

        <StatCard
          title="Fuel Outlay"
          value={formatINR(fuelTotal)}
          subtext={`${totalExpenditure > 0 ? ((fuelTotal / totalExpenditure) * 100).toFixed(0) : 0}% of all automobile spending`}
          icon={Fuel}
          badgeText="Fuel"
          badgeVariant="info"
        />

        <StatCard
          title="Maintenance & Repairs"
          value={formatINR(maintenanceTotal)}
          subtext="Servicing, repairs, and tyres combined"
          icon={IndianRupee}
          badgeText="Upkeep"
          badgeVariant="warning"
        />
      </div>

      {/* Category Breakdown Visualizer */}
      {expenses.length > 0 && (
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Category-wise Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Percentage allocation of vehicle spending across categories
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Pie Chart */}
            <div className="lg:col-span-5 h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown pills */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryData.map((cat) => {
                const percent = totalExpenditure > 0 ? ((cat.value / totalExpenditure) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={cat.name}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {formatINR(cat.value)}
                    </span>
                    <span className="text-[10px] text-slate-400">{percent}% of total</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            />
          </div>

          {/* Vehicle filter */}
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length === 0 ? 'No Expenses Logged Yet' : 'No Expenses Match Filter'}
          description={
            expenses.length === 0
              ? 'Start logging fuel receipts, service bills, and wash payments to analyze spending.'
              : 'Try clearing your filters or search query to view all transactions.'
          }
          actionLabel={expenses.length === 0 ? 'Log First Expense' : 'Clear Filters'}
          onAction={
            expenses.length === 0
              ? handleOpenAdd
              : () => {
                  setVehicleFilter('All');
                  setCategoryFilter('All');
                  setSearchQuery('');
                }
          }
        />
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction / Notes</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
                {filteredExpenses.map((expense) => {
                  const v = vehicles.find((x) => x.id === expense.vehicleId);
                  const color = CATEGORY_COLORS[expense.category] || '#94a3b8';

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-navy-850/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {expense.description}
                        </div>
                        {expense.isDemo && (
                          <span className="inline-block mt-0.5 text-[9px] font-semibold text-cyan-500 uppercase">
                            Demo Record
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {v ? v.nickname : 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          style={{
                            borderColor: `${color}40`,
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {expense.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        {formatINR(expense.amount)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(expense)}
                            className="p-1 text-slate-400 hover:text-brand-500 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpenseToDelete(expense)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense Record?"
        message={`Are you sure you want to delete this expense of ${formatINR(expenseToDelete?.amount)} for "${expenseToDelete?.description}"?`}
        confirmText="Delete Expense"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}

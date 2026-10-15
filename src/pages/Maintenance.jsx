import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Gauge,
  Edit2,
  Trash2,
  Info,
  Clock,
  Car,
  LayoutGrid,
  CalendarRange,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MaintenanceModal from '../components/MaintenanceModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { formatINR, formatDistance, formatDate } from '../utils/formatting';
import { computeTaskStatus, MAINTENANCE_CATEGORIES } from '../utils/maintenance';

export default function Maintenance() {
  const {
    maintenance,
    vehicles,
    addMaintenance,
    updateMaintenance,
    completeMaintenance,
    deleteMaintenance,
  } = useApp();

  // View Mode: 'grid' | 'timeline'
  const [viewMode, setViewMode] = useState('grid');

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filters
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Compute status for all tasks
  const tasksWithMeta = useMemo(() => {
    return maintenance.map((task) => {
      const vehicle = vehicles.find((v) => v.id === task.vehicleId);
      const meta = computeTaskStatus(task, vehicle);
      return {
        ...task,
        vehicle,
        computedStatus: meta.status,
        reason: meta.reason,
        daysLeft: meta.daysLeft,
        kmLeft: meta.kmLeft,
      };
    });
  }, [maintenance, vehicles]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasksWithMeta.filter((task) => {
      if (selectedVehicleFilter !== 'All' && task.vehicleId !== selectedVehicleFilter) {
        return false;
      }
      if (statusFilter !== 'All' && task.computedStatus !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [tasksWithMeta, selectedVehicleFilter, statusFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (data) => {
    if (editingTask) {
      updateMaintenance(editingTask.id, data);
    } else {
      addMaintenance(data);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteMaintenance(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Maintenance Manager
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {tasksWithMeta.length} Task{tasksWithMeta.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track service schedules, calculate odometer intervals, and log completed work.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          disabled={vehicles.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all shrink-0 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Schedule Task
        </button>
      </div>

      {/* Disclaimers & Advice Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>Transparent Service Intervals:</strong> Service intervals shown here are common benchmark recommendations. Your vehicle manufacturer's manual maintenance schedule takes precedence.
          </p>
          <p className="text-slate-400">
            Reminders are evaluated in real-time against your vehicle's recorded odometer reading and elapsed calendar days.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs shadow-sm">
        {/* Vehicle filter */}
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400" />
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
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

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Overdue">Overdue</option>
            <option value="Due soon">Due Soon</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {MAINTENANCE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Timeline / Calendar Schedule View"
          >
            <CalendarRange className="w-4 h-4" />
          </button>
        </div>

        {(selectedVehicleFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSelectedVehicleFilter('All');
              setStatusFilter('All');
              setCategoryFilter('All');
            }}
            className="text-xs font-semibold text-brand-500 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Task Cards List / Timeline */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={tasksWithMeta.length === 0 ? 'No Maintenance Tasks Logged' : 'No Tasks Match Filter'}
          description={
            tasksWithMeta.length === 0
              ? 'Schedule your first maintenance task to monitor engine oil, filters, and tyre servicing.'
              : 'Try clearing your filters to view all scheduled and completed services.'
          }
          actionLabel={tasksWithMeta.length === 0 ? 'Schedule First Task' : 'Clear Filters'}
          onAction={
            tasksWithMeta.length === 0
              ? handleOpenAdd
              : () => {
                  setSelectedVehicleFilter('All');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                }
          }
        />
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-cyan-500" />
              Service Schedule Timeline
            </h3>
            <span className="text-xs text-slate-400">Chronological service sequence</span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-navy-800 space-y-6">
            {filteredTasks
              .sort((a, b) => {
                const dateA = a.nextServiceDate || a.lastServiceDate || '9999';
                const dateB = b.nextServiceDate || b.lastServiceDate || '9999';
                return new Date(dateA) - new Date(dateB);
              })
              .map((task) => {
                const isCompleted = task.computedStatus === 'Completed';
                const isOverdue = task.computedStatus === 'Overdue';
                const isDueSoon = task.computedStatus === 'Due soon';

                return (
                  <div key={task.id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isOverdue
                          ? 'bg-rose-500 animate-pulse'
                          : isDueSoon
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : isDueSoon ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Timeline Content Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {task.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : isOverdue
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : isDueSoon
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                            }`}
                          >
                            {task.computedStatus}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {task.vehicle?.nickname || 'Vehicle'} • {task.category}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Target: {task.nextServiceDate ? formatDate(task.nextServiceDate) : 'Open'}
                          </span>
                          {task.nextServiceOdometer && (
                            <span className="inline-flex items-center gap-1">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              Target: {formatDistance(task.nextServiceOdometer)}
                            </span>
                          )}
                          {task.cost > 0 && (
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatINR(task.cost)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => completeMaintenance(task.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.computedStatus === 'Completed';
            const isOverdue = task.computedStatus === 'Overdue';
            const isDueSoon = task.computedStatus === 'Due soon';

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-5 bg-white dark:bg-navy-900 transition-all flex flex-col justify-between shadow-sm ${
                  isOverdue
                    ? 'border-rose-500/40 dark:border-rose-500/30'
                    : isDueSoon
                    ? 'border-amber-500/40 dark:border-amber-500/30'
                    : isCompleted
                    ? 'border-emerald-500/30 dark:border-emerald-500/20'
                    : 'border-slate-200 dark:border-navy-800'
                }`}
              >
                <div>
                  {/* Top Row: Title, Vehicle, Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
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
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : isDueSoon ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <Wrench className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {task.title}
                          </h3>
                          {task.isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                              Demo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.vehicle?.nickname || 'Unassigned'} ({task.vehicle?.manufacturer}{' '}
                          {task.vehicle?.model}) • {task.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : isDueSoon
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {task.computedStatus}
                    </span>
                  </div>

                  {/* Reminder Reason Callout */}
                  <div
                    className={`p-3 rounded-xl text-xs mb-3 flex items-start gap-2 ${
                      isOverdue
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border border-rose-200/50 dark:border-rose-900/50'
                        : isDueSoon
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200/50 dark:border-amber-900/50'
                        : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-900/50'
                        : 'bg-slate-50 dark:bg-navy-950/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-navy-800/80'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Status Reason: </span>
                      <span>{task.reason}</span>
                    </div>
                  </div>

                  {/* Interval Targets Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Last Service:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(task.lastServiceDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Next Target Date:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {task.nextServiceDate ? formatDate(task.nextServiceDate) : 'Open'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200/40 dark:border-navy-800/60">
                      <span className="text-[10px] text-slate-400 block">Target Odometer:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {task.nextServiceOdometer
                          ? formatDistance(task.nextServiceOdometer)
                          : 'Not set'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200/40 dark:border-navy-800/60">
                      <span className="text-[10px] text-slate-400 block">Estimated Cost:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {task.cost > 0 ? formatINR(task.cost) : '₹0'}
                      </span>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">
                      "{task.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => completeMaintenance(task.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title={`Delete "${taskToDelete?.title}"?`}
        message="Are you sure you want to remove this maintenance task? Historical record of this service interval will be deleted."
        confirmText="Delete Task"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}

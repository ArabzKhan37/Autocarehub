import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  MAINTENANCE_CATEGORIES,
  calculateNextInterval,
} from '../utils/maintenance';
import { validateMaintenance } from '../utils/validation';

export default function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  preselectedVehicleId = null,
}) {
  const { vehicles } = useApp();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    title: '',
    vehicleId: '',
    category: 'Engine Oil',
    lastServiceDate: new Date().toISOString().split('T')[0],
    lastServiceOdometer: '',
    nextServiceDate: '',
    nextServiceOdometer: '',
    cost: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        vehicleId: initialData.vehicleId || '',
        category: initialData.category || 'Engine Oil',
        lastServiceDate: initialData.lastServiceDate || new Date().toISOString().split('T')[0],
        lastServiceOdometer: initialData.lastServiceOdometer ?? '',
        nextServiceDate: initialData.nextServiceDate || '',
        nextServiceOdometer: initialData.nextServiceOdometer ?? '',
        cost: initialData.cost ?? '',
        notes: initialData.notes || '',
      });
      setErrors({});
    } else {
      const defaultVehicleId = preselectedVehicleId || vehicles[0]?.id || '';
      const vehicle = vehicles.find((v) => v.id === defaultVehicleId);
      const today = new Date().toISOString().split('T')[0];
      const initialOdo = vehicle ? vehicle.odometer : '';
      const interval = calculateNextInterval('Engine Oil', today, initialOdo);

      setFormData({
        title: 'Engine Oil & Filter Change',
        vehicleId: defaultVehicleId,
        category: 'Engine Oil',
        lastServiceDate: today,
        lastServiceOdometer: initialOdo,
        nextServiceDate: interval.nextDate,
        nextServiceOdometer: interval.nextOdo,
        cost: 3500,
        notes: '',
      });
      setErrors({});
    }
  }, [initialData, isOpen, preselectedVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const interval = calculateNextInterval(
      newCategory,
      formData.lastServiceDate,
      formData.lastServiceOdometer
    );
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      title: prev.title.trim() === '' || isDefaultCategoryTitle(prev.title)
        ? `${newCategory} Service`
        : prev.title,
      nextServiceDate: interval.nextDate || prev.nextServiceDate,
      nextServiceOdometer: interval.nextOdo || prev.nextServiceOdometer,
    }));
  };

  const isDefaultCategoryTitle = (title) => {
    return MAINTENANCE_CATEGORIES.some((c) => title === `${c.name} Service`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateMaintenance(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Maintenance Task' : 'Schedule Maintenance Task'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track intervals, estimated costs & reminder thresholds
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Vehicle selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Vehicle *
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={(e) => {
                const vid = e.target.value;
                const v = vehicles.find((x) => x.id === vid);
                setFormData((prev) => ({
                  ...prev,
                  vehicleId: vid,
                  lastServiceOdometer: v ? v.odometer : prev.lastServiceOdometer,
                }));
              }}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {vehicles.length === 0 && (
                <option value="">No vehicles found. Add a vehicle first.</option>
              )}
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname} ({v.manufacturer} {v.model})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.vehicleId}
              </p>
            )}
          </div>

          {/* Category & Task Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {MAINTENANCE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Engine Oil & Filter Change"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title}</p>
              )}
            </div>
          </div>

          {/* Last service date & odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Service Date *
              </label>
              <input
                type="date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.lastServiceDate && (
                <p className="text-xs text-rose-500 mt-1">{errors.lastServiceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Service Odometer (km)
              </label>
              <input
                type="number"
                name="lastServiceOdometer"
                value={formData.lastServiceOdometer}
                onChange={handleChange}
                placeholder="e.g. 25000"
                min="0"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Next target date & odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Target Service Date
              </label>
              <input
                type="date"
                name="nextServiceDate"
                value={formData.nextServiceDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Target Odometer (km)
              </label>
              <input
                type="number"
                name="nextServiceOdometer"
                value={formData.nextServiceOdometer}
                onChange={handleChange}
                placeholder="e.g. 35000"
                min="0"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Service Cost (₹ INR)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="e.g. 4500"
              min="0"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.cost && <p className="text-xs text-rose-500 mt-1">{errors.cost}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Maintenance Notes / Parts Specifications
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. 0W-20 engine oil, check brake caliper pins..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Service intervals are calculated from suggested standard baselines. Manufacturer maintenance schedules in your owner manual should always take priority.
            </span>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all"
            >
              {isEditing ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

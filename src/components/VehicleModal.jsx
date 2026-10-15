import React, { useState, useEffect } from 'react';
import { X, Car, AlertCircle, Shield } from 'lucide-react';
import { validateVehicle } from '../utils/validation';

export default function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    nickname: '',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    fuelType: 'Petrol',
    odometer: '',
    mileage: '',
    lastServiceDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nickname: initialData.nickname || '',
        manufacturer: initialData.manufacturer || '',
        model: initialData.model || '',
        year: initialData.year || new Date().getFullYear(),
        registrationNumber: initialData.registrationNumber || '',
        fuelType: initialData.fuelType || 'Petrol',
        odometer: initialData.odometer ?? '',
        mileage: initialData.mileage ?? '',
        lastServiceDate: initialData.lastServiceDate || new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
      setErrors({});
    } else {
      setFormData({
        nickname: '',
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        registrationNumber: '',
        fuelType: 'Petrol',
        odometer: '',
        mileage: '',
        lastServiceDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateVehicle(formData);
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
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register a car to track maintenance, expenses & fuel economics
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
          {/* Nickname */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vehicle Nickname *
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="e.g. City Commuter, Red Swift"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.nickname && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.nickname}
              </p>
            )}
          </div>

          {/* Manufacturer & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Honda, Hyundai, Tata"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.manufacturer && (
                <p className="text-xs text-rose-500 mt-1">{errors.manufacturer}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. City, Creta, Nexon"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.model && (
                <p className="text-xs text-rose-500 mt-1">{errors.model}</p>
              )}
            </div>
          </div>

          {/* Year & Fuel Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturing Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1970"
                max={new Date().getFullYear() + 1}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.year && <p className="text-xs text-rose-500 mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
          </div>

          {/* Odometer & Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Odometer (km) *
              </label>
              <input
                type="number"
                name="odometer"
                value={formData.odometer}
                onChange={handleChange}
                placeholder="e.g. 28500"
                min="0"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.odometer && (
                <p className="text-xs text-rose-500 mt-1">{errors.odometer}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Avg. Mileage (km/L) *
              </label>
              <input
                type="number"
                step="0.1"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g. 15.0"
                min="0.1"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.mileage && (
                <p className="text-xs text-rose-500 mt-1">{errors.mileage}</p>
              )}
            </div>
          </div>

          {/* Registration Number & Last Service Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registration No. (Optional)
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. DL 01 AB 1234"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-500" /> Stays strictly in your local browser.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Service Date
              </label>
              <input
                type="date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vehicle Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Trim level, tyre specs, insurance provider..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
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
              {isEditing ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

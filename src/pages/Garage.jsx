import React, { useState } from 'react';
import { Plus, Car, Shield, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import MaintenanceModal from '../components/MaintenanceModal';
import ExpenseModal from '../components/ExpenseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import PrintableReportModal from '../components/PrintableReportModal';

export default function Garage() {
  const {
    vehicles,
    maintenance,
    expenses,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenance,
    addExpense,
  } = useApp();

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Quick modals linked to a specific vehicle
  const [selectedVehicleForService, setSelectedVehicleForService] = useState(null);
  const [selectedVehicleForExpense, setSelectedVehicleForExpense] = useState(null);
  const [selectedVehicleForReport, setSelectedVehicleForReport] = useState(null);

  // Filter state
  const [fuelFilter, setFuelFilter] = useState('All');

  const filteredVehicles = vehicles.filter((v) => {
    if (fuelFilter === 'All') return true;
    return v.fuelType === fuelFilter;
  });

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (data) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
    } else {
      addVehicle(data);
    }
  };

  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              My Garage
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-cyan-400 border border-brand-500/20">
              {vehicles.length} Vehicle{vehicles.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your registered automobiles, technical specifications, and odometer readings.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Fuel Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Fuels</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-xs text-cyan-900 dark:text-cyan-200">
        <Shield className="w-4 h-4 text-cyan-500 shrink-0" />
        <p>
          <strong>Local Privacy Assurance:</strong> All vehicle identifiers and registration numbers remain stored strictly inside your browser's local sandbox and are never transmitted to external cloud servers.
        </p>
      </div>

      {/* Vehicle Cards Grid */}
      {filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? 'Your Garage is Empty' : 'No vehicles match filter'}
          description={
            vehicles.length === 0
              ? 'Add your first car to start tracking service intervals, fuel efficiency, and running expenses.'
              : 'Try changing or clearing your fuel filter to view your registered vehicles.'
          }
          actionLabel={vehicles.length === 0 ? 'Add Your Vehicle' : 'Clear Filter'}
          onAction={vehicles.length === 0 ? handleOpenAdd : () => setFuelFilter('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleOpenEdit}
              onDelete={(v) => setVehicleToDelete(v)}
              onLogService={(v) => setSelectedVehicleForService(v)}
              onAddExpense={(v) => setSelectedVehicleForExpense(v)}
              onPrintReport={(v) => setSelectedVehicleForReport(v)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSubmit={handleSaveVehicle}
        initialData={editingVehicle}
      />

      {/* Quick Log Service Modal */}
      <MaintenanceModal
        isOpen={Boolean(selectedVehicleForService)}
        onClose={() => setSelectedVehicleForService(null)}
        onSubmit={addMaintenance}
        preselectedVehicleId={selectedVehicleForService?.id}
      />

      {/* Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={Boolean(selectedVehicleForExpense)}
        onClose={() => setSelectedVehicleForExpense(null)}
        onSubmit={addExpense}
        preselectedVehicleId={selectedVehicleForExpense?.id}
      />

      {/* Printable Service Report / Passport Modal */}
      <PrintableReportModal
        isOpen={Boolean(selectedVehicleForReport)}
        onClose={() => setSelectedVehicleForReport(null)}
        vehicle={selectedVehicleForReport}
        maintenance={maintenance}
        expenses={expenses}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(vehicleToDelete)}
        title={`Delete "${vehicleToDelete?.nickname}"?`}
        message={`Are you sure you want to remove this ${vehicleToDelete?.manufacturer} ${vehicleToDelete?.model}? All associated maintenance logs and recorded expenses will also be permanently deleted.`}
        confirmText="Delete Vehicle"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
}

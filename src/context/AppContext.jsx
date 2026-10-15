import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  initializeStorage,
  getStoredVehicles,
  saveStoredVehicles,
  getStoredMaintenance,
  saveStoredMaintenance,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredSettings,
  saveStoredSettings,
  resetToDemoData,
  clearAllData,
  exportDataAsJSON,
  importDataFromJSON,
} from '../utils/storage';
import { computeTaskStatus } from '../utils/maintenance';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Initialize storage if needed
  useEffect(() => {
    initializeStorage();
  }, []);

  const [vehicles, setVehicles] = useState(() => getStoredVehicles());
  const [maintenance, setMaintenance] = useState(() => getStoredMaintenance());
  const [expenses, setExpenses] = useState(() => getStoredExpenses());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [toast, setToast] = useState(null);

  // Sync theme with document element
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Vehicle operations
  const addVehicle = (vehicleData) => {
    const newVehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      odometer: Number(vehicleData.odometer) || 0,
      mileage: Number(vehicleData.mileage) || 15,
      year: Number(vehicleData.year) || new Date().getFullYear(),
      isDemo: false,
    };
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    saveStoredVehicles(updated);
    showToast(`Vehicle "${newVehicle.nickname}" added to garage.`);
    return newVehicle;
  };

  const updateVehicle = (id, updatedData) => {
    const updated = vehicles.map((v) =>
      v.id === id
        ? {
            ...v,
            ...updatedData,
            odometer: Number(updatedData.odometer ?? v.odometer),
            mileage: Number(updatedData.mileage ?? v.mileage),
            year: Number(updatedData.year ?? v.year),
          }
        : v
    );
    setVehicles(updated);
    saveStoredVehicles(updated);
    showToast('Vehicle details updated.');
  };

  const deleteVehicle = (id) => {
    const target = vehicles.find((v) => v.id === id);
    const updatedVehicles = vehicles.filter((v) => v.id !== id);
    // Also remove associated maintenance tasks and expenses
    const updatedMaintenance = maintenance.filter((m) => m.vehicleId !== id);
    const updatedExpenses = expenses.filter((e) => e.vehicleId !== id);

    setVehicles(updatedVehicles);
    setMaintenance(updatedMaintenance);
    setExpenses(updatedExpenses);

    saveStoredVehicles(updatedVehicles);
    saveStoredMaintenance(updatedMaintenance);
    saveStoredExpenses(updatedExpenses);

    showToast(`Vehicle "${target?.nickname || 'Vehicle'}" removed.`);
  };

  // Maintenance operations
  const addMaintenance = (taskData) => {
    const newTask = {
      ...taskData,
      id: `maint-${Date.now()}`,
      cost: Number(taskData.cost) || 0,
      lastServiceOdometer: Number(taskData.lastServiceOdometer) || 0,
      nextServiceOdometer: taskData.nextServiceOdometer ? Number(taskData.nextServiceOdometer) : null,
      isCompleted: false,
      isDemo: false,
    };
    const updated = [newTask, ...maintenance];
    setMaintenance(updated);
    saveStoredMaintenance(updated);
    showToast('Maintenance task scheduled.');
    return newTask;
  };

  const updateMaintenance = (id, updatedData) => {
    const updated = maintenance.map((m) =>
      m.id === id
        ? {
            ...m,
            ...updatedData,
            cost: Number(updatedData.cost ?? m.cost),
            lastServiceOdometer: Number(updatedData.lastServiceOdometer ?? m.lastServiceOdometer),
            nextServiceOdometer: updatedData.nextServiceOdometer ? Number(updatedData.nextServiceOdometer) : null,
          }
        : m
    );
    setMaintenance(updated);
    saveStoredMaintenance(updated);
    showToast('Maintenance task updated.');
  };

  const completeMaintenance = (id) => {
    const today = new Date().toISOString().split('T')[0];
    const task = maintenance.find((m) => m.id === id);
    const vehicle = vehicles.find((v) => v.id === task?.vehicleId);

    const updated = maintenance.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          isCompleted: true,
          status: 'Completed',
          completedDate: today,
        };
      }
      return m;
    });

    // Optionally update vehicle's last service date and odometer
    if (task && vehicle) {
      const updatedVehicles = vehicles.map((v) => {
        if (v.id === vehicle.id) {
          return {
            ...v,
            lastServiceDate: today,
            odometer: m_isHigherOdo(v.odometer, task.nextServiceOdometer),
          };
        }
        return v;
      });
      setVehicles(updatedVehicles);
      saveStoredVehicles(updatedVehicles);
    }

    setMaintenance(updated);
    saveStoredMaintenance(updated);
    showToast(`Task "${task?.title || 'Maintenance'}" marked as completed!`);
  };

  function m_isHigherOdo(current, candidate) {
    if (!candidate) return current;
    return Math.max(Number(current) || 0, Number(candidate) || 0);
  }

  const deleteMaintenance = (id) => {
    const updated = maintenance.filter((m) => m.id !== id);
    setMaintenance(updated);
    saveStoredMaintenance(updated);
    showToast('Maintenance task removed.');
  };

  // Expense operations
  const addExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      amount: Number(expenseData.amount) || 0,
      isDemo: false,
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast('Expense recorded successfully.');
    return newExpense;
  };

  const updateExpense = (id, updatedData) => {
    const updated = expenses.map((e) =>
      e.id === id
        ? {
            ...e,
            ...updatedData,
            amount: Number(updatedData.amount ?? e.amount),
          }
        : e
    );
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast('Expense updated.');
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast('Expense removed.');
  };

  // Reminders calculation
  const reminders = useMemo(() => {
    return maintenance
      .filter((task) => !task.isCompleted)
      .map((task) => {
        const vehicle = vehicles.find((v) => v.id === task.vehicleId);
        const statusMeta = computeTaskStatus(task, vehicle);
        return {
          ...task,
          vehicle,
          status: statusMeta.status,
          reason: statusMeta.reason,
          daysLeft: statusMeta.daysLeft,
          kmLeft: statusMeta.kmLeft,
        };
      })
      .filter((task) => task.status === 'Overdue' || task.status === 'Due soon');
  }, [maintenance, vehicles]);

  const overdueCount = useMemo(() => {
    return reminders.filter((r) => r.status === 'Overdue').length;
  }, [reminders]);

  const dueSoonCount = useMemo(() => {
    return reminders.filter((r) => r.status === 'Due soon').length;
  }, [reminders]);

  // Demo & Reset functions
  const handleResetDemo = () => {
    const res = resetToDemoData();
    setVehicles(res.vehicles);
    setMaintenance(res.maintenance);
    setExpenses(res.expenses);
    setSettings(res.settings);
    showToast('Application reset to realistic demo data.');
  };

  const handleClearData = () => {
    const res = clearAllData();
    setVehicles(res.vehicles);
    setMaintenance(res.maintenance);
    setExpenses(res.expenses);
    setSettings(res.settings);
    showToast('All garage data cleared. Starting fresh.', 'info');
  };

  const handleExport = () => {
    exportDataAsJSON();
    showToast('JSON backup exported successfully.');
  };

  const handleImport = (jsonString) => {
    const result = importDataFromJSON(jsonString);
    if (result.success) {
      setVehicles(result.data.vehicles);
      setMaintenance(result.data.maintenance);
      setExpenses(result.data.expenses);
      setSettings(result.data.settings);
      showToast(result.message);
      return true;
    } else {
      showToast(result.message, 'error');
      return false;
    }
  };

  const value = {
    vehicles,
    maintenance,
    expenses,
    settings,
    reminders,
    overdueCount,
    dueSoonCount,
    toast,
    showToast,
    toggleTheme,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenance,
    updateMaintenance,
    completeMaintenance,
    deleteMaintenance,
    addExpense,
    updateExpense,
    deleteExpense,
    resetToDemoData: handleResetDemo,
    clearAllData: handleClearData,
    exportData: handleExport,
    importData: handleImport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

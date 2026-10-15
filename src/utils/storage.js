import {
  INITIAL_VEHICLES,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_EXPENSES,
  INITIAL_SETTINGS,
} from '../data/demoData';

const KEYS = {
  VEHICLES: 'autocare_vehicles',
  MAINTENANCE: 'autocare_maintenance',
  EXPENSES: 'autocare_expenses',
  SETTINGS: 'autocare_settings',
  INITIALIZED: 'autocare_initialized_v1',
};

/**
 * Safe JSON parser with fallback
 */
function safeGet(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}", reverting to fallback:`, err);
    return fallback;
  }
}

/**
 * Safe JSON serializer
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
    return false;
  }
}

/**
 * Initializes data if not yet present in localStorage.
 */
export function initializeStorage() {
  const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
  if (!isInitialized) {
    safeSet(KEYS.VEHICLES, INITIAL_VEHICLES);
    safeSet(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_TASKS);
    safeSet(KEYS.EXPENSES, INITIAL_EXPENSES);
    safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }
}

// Vehicles
export function getStoredVehicles() {
  return safeGet(KEYS.VEHICLES, INITIAL_VEHICLES);
}

export function saveStoredVehicles(vehicles) {
  return safeSet(KEYS.VEHICLES, vehicles);
}

// Maintenance Tasks
export function getStoredMaintenance() {
  return safeGet(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_TASKS);
}

export function saveStoredMaintenance(tasks) {
  return safeSet(KEYS.MAINTENANCE, tasks);
}

// Expenses
export function getStoredExpenses() {
  return safeGet(KEYS.EXPENSES, INITIAL_EXPENSES);
}

export function saveStoredExpenses(expenses) {
  return safeSet(KEYS.EXPENSES, expenses);
}

// Settings
export function getStoredSettings() {
  return safeGet(KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveStoredSettings(settings) {
  return safeSet(KEYS.SETTINGS, settings);
}

/**
 * Resets all application data back to initial demo dataset.
 */
export function resetToDemoData() {
  safeSet(KEYS.VEHICLES, INITIAL_VEHICLES);
  safeSet(KEYS.MAINTENANCE, INITIAL_MAINTENANCE_TASKS);
  safeSet(KEYS.EXPENSES, INITIAL_EXPENSES);
  safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  return {
    vehicles: INITIAL_VEHICLES,
    maintenance: INITIAL_MAINTENANCE_TASKS,
    expenses: INITIAL_EXPENSES,
    settings: INITIAL_SETTINGS,
  };
}

/**
 * Clears all data completely to an empty garage.
 */
export function clearAllData() {
  const emptySettings = { ...INITIAL_SETTINGS, dismissedReminders: [] };
  safeSet(KEYS.VEHICLES, []);
  safeSet(KEYS.MAINTENANCE, []);
  safeSet(KEYS.EXPENSES, []);
  safeSet(KEYS.SETTINGS, emptySettings);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
  return {
    vehicles: [],
    maintenance: [],
    expenses: [],
    settings: emptySettings,
  };
}

/**
 * Generates and downloads a JSON export file.
 */
export function exportDataAsJSON() {
  const data = {
    application: 'AutoCare Hub',
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    vehicles: getStoredVehicles(),
    maintenance: getStoredMaintenance(),
    expenses: getStoredExpenses(),
    settings: getStoredSettings(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `autocare-hub-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validates and imports JSON backup data.
 * @param {string} jsonString
 * @returns {{ success: boolean, message: string, data?: Object }}
 */
export function importDataFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structural schema
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON format: Root element must be an object.' };
    }

    if (!Array.isArray(parsed.vehicles)) {
      return { success: false, message: 'Validation failed: Missing or invalid "vehicles" list.' };
    }

    const cleanVehicles = parsed.vehicles.filter(v => v && v.id && v.nickname && v.manufacturer);
    const cleanMaintenance = Array.isArray(parsed.maintenance) ? parsed.maintenance : [];
    const cleanExpenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const cleanSettings = parsed.settings && typeof parsed.settings === 'object'
      ? { ...INITIAL_SETTINGS, ...parsed.settings }
      : INITIAL_SETTINGS;

    safeSet(KEYS.VEHICLES, cleanVehicles);
    safeSet(KEYS.MAINTENANCE, cleanMaintenance);
    safeSet(KEYS.EXPENSES, cleanExpenses);
    safeSet(KEYS.SETTINGS, cleanSettings);

    return {
      success: true,
      message: `Successfully restored ${cleanVehicles.length} vehicles, ${cleanMaintenance.length} maintenance tasks, and ${cleanExpenses.length} expenses.`,
      data: {
        vehicles: cleanVehicles,
        maintenance: cleanMaintenance,
        expenses: cleanExpenses,
        settings: cleanSettings,
      },
    };
  } catch (err) {
    return { success: false, message: `Failed to parse JSON file: ${err.message}` };
  }
}

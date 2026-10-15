/**
 * Simple, robust form validation utilities for AutoCare Hub.
 */

export function isNonEmpty(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

export function isPositiveNumber(val) {
  const n = Number(val);
  return !isNaN(n) && n > 0;
}

export function isNonNegativeNumber(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 0;
}

export function isValidYear(val) {
  const y = Number(val);
  const currentYear = new Date().getFullYear();
  return !isNaN(y) && y >= 1970 && y <= currentYear + 1;
}

/**
 * Validate vehicle form payload.
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateVehicle(data) {
  const errors = {};

  if (!isNonEmpty(data.nickname)) {
    errors.nickname = 'Vehicle nickname is required.';
  }
  if (!isNonEmpty(data.manufacturer)) {
    errors.manufacturer = 'Manufacturer name is required.';
  }
  if (!isNonEmpty(data.model)) {
    errors.model = 'Model name is required.';
  }
  if (!isValidYear(data.year)) {
    errors.year = 'Enter a valid year between 1970 and next year.';
  }
  if (!isNonEmpty(data.fuelType)) {
    errors.fuelType = 'Please select a fuel type.';
  }
  if (!isNonNegativeNumber(data.odometer)) {
    errors.odometer = 'Odometer reading must be 0 or greater.';
  }
  if (!isPositiveNumber(data.mileage)) {
    errors.mileage = 'Average mileage must be greater than 0.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate maintenance task form payload.
 */
export function validateMaintenance(data) {
  const errors = {};

  if (!isNonEmpty(data.title)) {
    errors.title = 'Task title is required.';
  }
  if (!isNonEmpty(data.vehicleId)) {
    errors.vehicleId = 'Please select a vehicle.';
  }
  if (!isNonEmpty(data.category)) {
    errors.category = 'Please select a maintenance category.';
  }
  if (!isNonEmpty(data.lastServiceDate)) {
    errors.lastServiceDate = 'Last service date is required.';
  }
  if (data.cost !== undefined && data.cost !== '' && !isNonNegativeNumber(data.cost)) {
    errors.cost = 'Estimated cost must be a positive number or zero.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate expense form payload.
 */
export function validateExpense(data) {
  const errors = {};

  if (!isNonEmpty(data.vehicleId)) {
    errors.vehicleId = 'Please select a vehicle.';
  }
  if (!isNonEmpty(data.category)) {
    errors.category = 'Please select an expense category.';
  }
  if (!isPositiveNumber(data.amount)) {
    errors.amount = 'Amount must be greater than 0.';
  }
  if (!isNonEmpty(data.date)) {
    errors.date = 'Date is required.';
  }
  if (!isNonEmpty(data.description)) {
    errors.description = 'Please provide a short description.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

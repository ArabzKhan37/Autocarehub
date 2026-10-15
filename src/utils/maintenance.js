import { differenceInDays, parseISO, isValid, addDays } from 'date-fns';

export const MAINTENANCE_CATEGORIES = [
  { id: 'engine_oil', name: 'Engine Oil', defaultIntervalKm: 10000, defaultIntervalDays: 180 },
  { id: 'oil_filter', name: 'Oil Filter', defaultIntervalKm: 10000, defaultIntervalDays: 180 },
  { id: 'air_filter', name: 'Air Filter', defaultIntervalKm: 15000, defaultIntervalDays: 365 },
  { id: 'tyres', name: 'Tyres & Alignment', defaultIntervalKm: 10000, defaultIntervalDays: 180 },
  { id: 'brakes', name: 'Brake Pads & Fluid', defaultIntervalKm: 20000, defaultIntervalDays: 365 },
  { id: 'battery', name: 'Battery Health', defaultIntervalKm: 0, defaultIntervalDays: 730 },
  { id: 'coolant', name: 'Coolant Flush', defaultIntervalKm: 30000, defaultIntervalDays: 730 },
  { id: 'general_service', name: 'General Servicing', defaultIntervalKm: 10000, defaultIntervalDays: 180 },
  { id: 'other', name: 'Other', defaultIntervalKm: 10000, defaultIntervalDays: 180 },
];

/**
 * Computes the real-time status and detailed reason for a maintenance task
 * @param {Object} task
 * @param {Object} [vehicle] - The associated vehicle object (optional)
 * @returns {{ status: 'Completed' | 'Overdue' | 'Due soon' | 'Upcoming', reason: string, daysLeft: number | null, kmLeft: number | null }}
 */
export function computeTaskStatus(task, vehicle = null) {
  if (task.isCompleted || task.status === 'Completed') {
    return {
      status: 'Completed',
      reason: 'Service marked as completed',
      daysLeft: null,
      kmLeft: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dateOverdue = false;
  let dateDueSoon = false;
  let daysDiff = null;

  if (task.nextServiceDate) {
    const nextDate = parseISO(task.nextServiceDate);
    if (isValid(nextDate)) {
      nextDate.setHours(0, 0, 0, 0);
      daysDiff = differenceInDays(nextDate, today);

      if (daysDiff < 0) {
        dateOverdue = true;
      } else if (daysDiff <= 14) {
        dateDueSoon = true;
      }
    }
  }

  let odoOverdue = false;
  let odoDueSoon = false;
  let kmDiff = null;

  const currentOdo = vehicle?.odometer ? Number(vehicle.odometer) : null;
  const nextOdo = task.nextServiceOdometer ? Number(task.nextServiceOdometer) : null;

  if (currentOdo !== null && nextOdo !== null && nextOdo > 0) {
    kmDiff = nextOdo - currentOdo;
    if (kmDiff <= 0) {
      odoOverdue = true;
    } else if (kmDiff <= 500) {
      odoDueSoon = true;
    }
  }

  // Determine final status (Priority: Overdue > Due soon > Upcoming)
  if (dateOverdue || odoOverdue) {
    const reasons = [];
    if (dateOverdue && daysDiff !== null) {
      reasons.push(`${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} past scheduled date`);
    }
    if (odoOverdue && kmDiff !== null) {
      reasons.push(`Odometer exceeded target by ${Math.abs(kmDiff)} km`);
    }
    return {
      status: 'Overdue',
      reason: reasons.join(' & ') || 'Maintenance schedule overdue',
      daysLeft: daysDiff,
      kmLeft: kmDiff,
    };
  }

  if (dateDueSoon || odoDueSoon) {
    const reasons = [];
    if (dateDueSoon && daysDiff !== null) {
      reasons.push(`Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`);
    }
    if (odoDueSoon && kmDiff !== null) {
      reasons.push(`${kmDiff} km remaining until target odometer`);
    }
    return {
      status: 'Due soon',
      reason: reasons.join(' & ') || 'Due soon',
      daysLeft: daysDiff,
      kmLeft: kmDiff,
    };
  }

  // Upcoming
  let reason = 'Scheduled according to maintenance plan';
  if (daysDiff !== null && daysDiff > 14) {
    reason = `Scheduled in ${daysDiff} days`;
  } else if (kmDiff !== null && kmDiff > 500) {
    reason = `${kmDiff} km remaining until next service`;
  }

  return {
    status: 'Upcoming',
    reason,
    daysLeft: daysDiff,
    kmLeft: kmDiff,
  };
}

/**
 * Calculates suggested next service date and odometer given a category and last service details.
 */
export function calculateNextInterval(categoryName, lastDate, lastOdo) {
  const cat = MAINTENANCE_CATEGORIES.find(
    (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
  ) || MAINTENANCE_CATEGORIES[0];

  let nextDateStr = '';
  if (lastDate && cat.defaultIntervalDays > 0) {
    const base = parseISO(lastDate);
    if (isValid(base)) {
      nextDateStr = addDays(base, cat.defaultIntervalDays).toISOString().split('T')[0];
    }
  }

  let nextOdo = '';
  if (lastOdo !== undefined && lastOdo !== '' && !isNaN(Number(lastOdo)) && cat.defaultIntervalKm > 0) {
    nextOdo = Number(lastOdo) + cat.defaultIntervalKm;
  }

  return {
    nextDate: nextDateStr,
    nextOdo: nextOdo ? String(nextOdo) : '',
  };
}

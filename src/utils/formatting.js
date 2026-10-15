import { format, parseISO, isValid } from 'date-fns';

/**
 * Format numbers as Indian Rupee (INR) currency.
 * @param {number|string} amount
 * @param {boolean} showDecimals
 * @returns {string} e.g. "₹2,100" or "₹15,400.50"
 */
export function formatINR(amount, showDecimals = false) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Format distance in kilometres.
 * @param {number|string} km
 * @returns {string} e.g. "28,500 km"
 */
export function formatDistance(km) {
  const num = Number(km);
  if (isNaN(num)) return '0 km';
  return `${new Intl.NumberFormat('en-IN').format(num)} km`;
}

/**
 * Format mileage.
 * @param {number|string} mileage
 * @returns {string} e.g. "15.0 km/L"
 */
export function formatMileage(mileage) {
  const num = Number(mileage);
  if (isNaN(num)) return '0 km/L';
  return `${num.toFixed(1)} km/L`;
}

/**
 * Safe date formatter.
 * @param {string|Date} dateString
 * @param {string} formatStr
 * @returns {string}
 */
export function formatDate(dateString, formatStr = 'dd MMM yyyy') {
  if (!dateString) return 'Not set';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return 'Invalid Date';
    return format(d, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

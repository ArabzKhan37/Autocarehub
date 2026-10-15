/**
 * Calculations for fuel consumption, trip costs, and savings comparisons.
 */

/**
 * Calculate fuel requirements and costs for a given trip.
 * @param {Object} params
 * @param {number} params.distance - In kilometres
 * @param {number} params.mileage - In km/litre
 * @param {number} params.fuelPrice - In INR per litre
 * @param {number} [params.trips=1] - Number of trips
 * @param {boolean} [params.isReturn=false] - Whether it's a return (round) trip
 * @returns {Object}
 */
export function calculateFuelTrip({ distance, mileage, fuelPrice, trips = 1, isReturn = false }) {
  const d = Math.max(0, Number(distance) || 0);
  const m = Math.max(0.1, Number(mileage) || 1);
  const p = Math.max(0, Number(fuelPrice) || 0);
  const t = Math.max(1, parseInt(trips, 10) || 1);

  const multiplier = isReturn ? 2 : 1;
  const totalDistance = d * multiplier * t;
  const fuelRequired = totalDistance / m;
  const estimatedCost = fuelRequired * p;
  const costPerKm = p / m;

  return {
    totalDistance: Number(totalDistance.toFixed(1)),
    fuelRequired: Number(fuelRequired.toFixed(2)),
    estimatedCost: Math.round(estimatedCost),
    costPerKm: Number(costPerKm.toFixed(2)),
  };
}

/**
 * Compare two vehicles for a trip or monthly commute.
 * @param {Object} params
 * @param {number} params.mileageA - km/L for Vehicle A
 * @param {number} params.mileageB - km/L for Vehicle B
 * @param {number} params.distance - Single trip distance in km
 * @param {number} params.fuelPrice - Fuel price in INR
 * @param {number} params.tripsPerMonth - Number of trips per month
 * @returns {Object}
 */
export function compareVehicleSavings({ mileageA, mileageB, distance, fuelPrice, tripsPerMonth = 20 }) {
  const mA = Math.max(0.1, Number(mileageA) || 1);
  const mB = Math.max(0.1, Number(mileageB) || 1);
  const d = Math.max(0, Number(distance) || 0);
  const p = Math.max(0, Number(fuelPrice) || 0);
  const monthlyTrips = Math.max(1, Number(tripsPerMonth) || 1);

  // Single trip calculations
  const tripCostA = (d / mA) * p;
  const tripCostB = (d / mB) * p;

  // Monthly calculations
  const monthlyCostA = tripCostA * monthlyTrips;
  const monthlyCostB = tripCostB * monthlyTrips;

  // Differences
  const monthlyDifference = Math.round(Math.abs(monthlyCostA - monthlyCostB));
  const annualDifference = monthlyDifference * 12;
  const tripDifference = Math.round(Math.abs(tripCostA - tripCostB));

  // Identify more efficient vehicle
  let moreEfficient = null;
  if (mA > mB) {
    moreEfficient = 'A';
  } else if (mB > mA) {
    moreEfficient = 'B';
  }

  const percentSavings = Math.max(monthlyCostA, monthlyCostB) > 0
    ? (monthlyDifference / Math.max(monthlyCostA, monthlyCostB)) * 100
    : 0;

  return {
    tripCostA: Math.round(tripCostA),
    tripCostB: Math.round(tripCostB),
    tripDifference: Math.round(tripDifference),
    monthlyCostA: Math.round(monthlyCostA),
    monthlyCostB: Math.round(monthlyCostB),
    monthlyDifference: Math.round(monthlyDifference),
    annualDifference: Math.round(annualDifference),
    moreEfficient,
    percentSavings: Number(percentSavings.toFixed(1)),
    costPerKmA: Number((p / mA).toFixed(2)),
    costPerKmB: Number((p / mB).toFixed(2)),
  };
}

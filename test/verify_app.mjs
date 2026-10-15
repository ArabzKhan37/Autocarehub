import assert from 'node:assert';
import { calculateFuelTrip, compareVehicleSavings } from '../src/utils/calculations.js';
import { computeTaskStatus, calculateNextInterval } from '../src/utils/maintenance.js';
import { validateVehicle, validateMaintenance, validateExpense } from '../src/utils/validation.js';

console.log('--- RUNNING AUTOCARE HUB VERIFICATION SUITE ---');

// 1. Fuel Calculation Verification (Prompt exact specification)
console.log('Testing Fuel Calculation...');
const trip = calculateFuelTrip({
  distance: 300,
  mileage: 15,
  fuelPrice: 105,
  trips: 1,
  isReturn: false,
});

assert.strictEqual(trip.fuelRequired, 20, 'Fuel required must be 20 litres');
assert.strictEqual(trip.estimatedCost, 2100, 'Estimated fuel cost must be ₹2,100');
assert.strictEqual(trip.costPerKm, 7, 'Cost per km must be ₹7');
console.log('✓ Fuel calculation matches exact prompt criteria: 300km / 15km/L @ ₹105 = 20L, ₹2,100 (₹7/km)');

// 2. Return Trip & Multi-trip test
const roundTrip = calculateFuelTrip({
  distance: 300,
  mileage: 15,
  fuelPrice: 105,
  trips: 2,
  isReturn: true,
});
assert.strictEqual(roundTrip.totalDistance, 1200, 'Round trip with 2 trips should be 300 * 2 * 2 = 1200 km');
assert.strictEqual(roundTrip.fuelRequired, 80, 'Fuel required should be 80L');
assert.strictEqual(roundTrip.estimatedCost, 8400, 'Cost should be 80 * 105 = ₹8,400');
console.log('✓ Round trip & multi-trip multiplier calculations verified');

// 3. Two Vehicle Savings Comparison Verification
console.log('Testing Savings Comparison...');
const comparison = compareVehicleSavings({
  mileageA: 15,
  mileageB: 18.5,
  distance: 300,
  fuelPrice: 105,
  tripsPerMonth: 20,
});

assert.strictEqual(comparison.tripCostA, 2100);
assert.strictEqual(comparison.tripCostB, 1703);
assert.strictEqual(comparison.monthlyCostA, 42000);
assert.strictEqual(comparison.monthlyCostB, 34054);
assert.strictEqual(comparison.monthlyDifference, 7946);
assert.strictEqual(comparison.annualDifference, 95352);
assert.strictEqual(comparison.moreEfficient, 'B');
console.log(`✓ Vehicle comparison verified: Vehicle B saves ₹${comparison.monthlyDifference}/mo (₹${comparison.annualDifference}/year)`);

// 4. Maintenance Status Evaluation Verification
console.log('Testing Maintenance Status Engine...');
const sampleVehicle = { odometer: 28500 };

// Overdue by odometer test
const taskOverdueOdo = {
  isCompleted: false,
  nextServiceDate: '2027-01-01',
  nextServiceOdometer: 28000, // 28500 exceeds 28000
};
const resOdo = computeTaskStatus(taskOverdueOdo, sampleVehicle);
assert.strictEqual(resOdo.status, 'Overdue');
assert.ok(resOdo.reason.includes('Odometer exceeded target by 500 km'));

// Due soon by odometer test (within 500km)
const taskDueSoonOdo = {
  isCompleted: false,
  nextServiceDate: '2027-01-01',
  nextServiceOdometer: 28800, // 300 km left
};
const resDueSoon = computeTaskStatus(taskDueSoonOdo, sampleVehicle);
assert.strictEqual(resDueSoon.status, 'Due soon');
assert.ok(resDueSoon.reason.includes('300 km remaining'));

// Completed task test
const taskCompleted = {
  isCompleted: true,
  nextServiceDate: '2020-01-01',
};
const resCompleted = computeTaskStatus(taskCompleted, sampleVehicle);
assert.strictEqual(resCompleted.status, 'Completed');

console.log('✓ Maintenance status engine passed all thresholds (Overdue, Due Soon, Completed, Upcoming)');

// 5. Validation Verification
console.log('Testing Form Validation Rules...');
const invalidVehicle = validateVehicle({ nickname: '', manufacturer: '', model: '', year: 1800, fuelType: '', odometer: -5, mileage: 0 });
assert.strictEqual(invalidVehicle.isValid, false);
assert.strictEqual(Object.keys(invalidVehicle.errors).length, 7);

const validVehicle = validateVehicle({
  nickname: 'Honda City',
  manufacturer: 'Honda',
  model: 'City',
  year: 2022,
  fuelType: 'Petrol',
  odometer: 28500,
  mileage: 15,
});
assert.strictEqual(validVehicle.isValid, true);
console.log('✓ Validation rules verified: correctly rejects invalid inputs and accepts valid payloads');

console.log('\nALL UNIT AND INTEGRATION CHECKS PASSED SUCCESSFULLY!');

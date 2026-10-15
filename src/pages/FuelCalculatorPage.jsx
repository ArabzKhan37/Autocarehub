import React, { useState } from 'react';
import {
  Fuel,
  TrendingDown,
  ArrowRightLeft,
  Info,
  Car,
  Calculator,
  Compass,
  Repeat,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculateFuelTrip, compareVehicleSavings } from '../utils/calculations';
import { formatINR, formatDistance, formatMileage } from '../utils/formatting';

export default function FuelCalculatorPage() {
  const { vehicles } = useApp();

  // Tab State: 'single' (Trip Calculator) vs 'compare' (Two-Vehicle Savings Comparison)
  const [activeTab, setActiveTab] = useState('single');

  // Single Trip Calculator State
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'custom');
  const [distance, setDistance] = useState('300');
  const [mileage, setMileage] = useState(vehicles[0]?.mileage ? String(vehicles[0].mileage) : '15');
  const [fuelPrice, setFuelPrice] = useState('105');
  const [isReturn, setIsReturn] = useState(false);
  const [tripCount, setTripCount] = useState('1');

  // Comparison State
  const [compareVehicleA, setCompareVehicleA] = useState(vehicles[0]?.id || 'customA');
  const [compareMileageA, setCompareMileageA] = useState(vehicles[0]?.mileage ? String(vehicles[0].mileage) : '15');
  const [compareVehicleB, setCompareVehicleB] = useState(vehicles[1]?.id || 'customB');
  const [compareMileageB, setCompareMileageB] = useState(vehicles[1]?.mileage ? String(vehicles[1].mileage) : '18.5');
  const [compareDistance, setCompareDistance] = useState('300');
  const [compareFuelPrice, setCompareFuelPrice] = useState('105');
  const [tripsPerMonth, setTripsPerMonth] = useState('20');

  // Sync vehicle selections
  const handleSelectVehicle = (vid) => {
    setSelectedVehicleId(vid);
    if (vid !== 'custom') {
      const v = vehicles.find((x) => x.id === vid);
      if (v) {
        setMileage(String(v.mileage));
      }
    }
  };

  const handleSelectCompareA = (vid) => {
    setCompareVehicleA(vid);
    if (vid !== 'customA') {
      const v = vehicles.find((x) => x.id === vid);
      if (v) setCompareMileageA(String(v.mileage));
    }
  };

  const handleSelectCompareB = (vid) => {
    setCompareVehicleB(vid);
    if (vid !== 'customB') {
      const v = vehicles.find((x) => x.id === vid);
      if (v) setCompareMileageB(String(v.mileage));
    }
  };

  // Calculations
  const tripResult = calculateFuelTrip({
    distance: Number(distance) || 0,
    mileage: Number(mileage) || 1,
    fuelPrice: Number(fuelPrice) || 0,
    trips: Number(tripCount) || 1,
    isReturn,
  });

  const compareResult = compareVehicleSavings({
    mileageA: Number(compareMileageA) || 1,
    mileageB: Number(compareMileageB) || 1,
    distance: Number(compareDistance) || 0,
    fuelPrice: Number(compareFuelPrice) || 0,
    tripsPerMonth: Number(tripsPerMonth) || 1,
  });

  // Comparison chart data
  const comparisonChartData = [
    {
      name: 'Single Trip',
      'Vehicle A': compareResult.tripCostA,
      'Vehicle B': compareResult.tripCostB,
    },
    {
      name: 'Monthly Total',
      'Vehicle A': compareResult.monthlyCostA,
      'Vehicle B': compareResult.monthlyCostB,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Fuel Economics & Trip Calculator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate accurate trip fuel costs and compare running economics between two vehicles.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'single'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Trip Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'compare'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Vehicle Comparison
          </button>
        </div>
      </div>

      {/* Disclaimers Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-500 shrink-0" />
        <span>
          <strong>Estimation Notice:</strong> All fuel costs and consumption figures are estimated based on entered parameters and constant driving conditions. Manual fuel price entry allows tailoring to your local city rates.
        </span>
      </div>

      {/* Mode 1: Single Trip Calculator */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-500 dark:text-cyan-400" />
              Trip Inputs
            </h3>

            {/* Garage vehicle presets */}
            {vehicles.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Load Vehicle Preset (Optional)
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleSelectVehicle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="custom">Custom Values</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nickname} ({v.mileage} km/L, {v.fuelType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* One-way Distance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trip Distance (km) *
              </label>
              <input
                type="number"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 300"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Mileage (km/L) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Fuel Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fuel Price (₹ / Litre) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                placeholder="e.g. 105"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Enter current local pump price in your city.
              </p>
            </div>

            {/* Return Trip Checkbox */}
            <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isReturn}
                  onChange={(e) => setIsReturn(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Return Journey (Round Trip, 2x distance)</span>
              </label>
            </div>

            {/* Multiple trips count */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Trips
              </label>
              <input
                type="number"
                min="1"
                value={tripCount}
                onChange={(e) => setTripCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Result Highlight */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-600 text-white shadow-xl shadow-brand-600/20">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-100 block mb-1">
                Total Estimated Fuel Cost
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatINR(tripResult.estimatedCost)}
                </span>
                <span className="text-xs text-cyan-100 font-medium">
                  for {formatDistance(tripResult.totalDistance)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20 text-xs">
                <div>
                  <span className="text-cyan-100/80 block text-[11px]">Fuel Required</span>
                  <span className="text-base font-bold">{tripResult.fuelRequired} Litres</span>
                </div>
                <div>
                  <span className="text-cyan-100/80 block text-[11px]">Running Cost</span>
                  <span className="text-base font-bold">{formatINR(tripResult.costPerKm, true)} / km</span>
                </div>
                <div>
                  <span className="text-cyan-100/80 block text-[11px]">Total Distance</span>
                  <span className="text-base font-bold">{formatDistance(tripResult.totalDistance)}</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation Breakdown Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Transparent Formula Breakdown
              </h4>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                  <span>1. Total Distance</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {distance} km {isReturn ? '× 2 (round trip)' : ''}{' '}
                    {Number(tripCount) > 1 ? `× ${tripCount} trips` : ''} = {tripResult.totalDistance} km
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                  <span>2. Fuel Needed</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {tripResult.totalDistance} km ÷ {mileage} km/L = {tripResult.fuelRequired} Litres
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                  <span>3. Fuel Cost</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {tripResult.fuelRequired} L × ₹{fuelPrice}/L = {formatINR(tripResult.estimatedCost)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                  <span>4. Cost Per Kilometre</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{fuelPrice} ÷ {mileage} km/L = {formatINR(tripResult.costPerKm, true)} / km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Feature Eight — Savings Comparison */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Comparison Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle A */}
            <div className="rounded-3xl border border-blue-500/30 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Vehicle Option A
                </span>
                {vehicles.length > 0 && (
                  <select
                    value={compareVehicleA}
                    onChange={(e) => handleSelectCompareA(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="customA">Custom Car A</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nickname}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mileage (km/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={compareMileageA}
                  onChange={(e) => setCompareMileageA(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-navy-950/60 border border-blue-100 dark:border-navy-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Running Cost Per KM</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {formatINR(compareResult.costPerKmA, true)} / km
                </span>
              </div>
            </div>

            {/* Vehicle B */}
            <div className="rounded-3xl border border-cyan-500/30 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  Vehicle Option B
                </span>
                {vehicles.length > 0 && (
                  <select
                    value={compareVehicleB}
                    onChange={(e) => handleSelectCompareB(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="customB">Custom Car B</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nickname}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mileage (km/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={compareMileageB}
                  onChange={(e) => setCompareMileageB(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-navy-950/60 border border-cyan-100 dark:border-navy-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Running Cost Per KM</span>
                <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                  {formatINR(compareResult.costPerKmB, true)} / km
                </span>
              </div>
            </div>
          </div>

          {/* Shared Shared Parameters */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trip Distance (km)
              </label>
              <input
                type="number"
                min="1"
                value={compareDistance}
                onChange={(e) => setCompareDistance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fuel Price (₹ / Litre)
              </label>
              <input
                type="number"
                min="1"
                value={compareFuelPrice}
                onChange={(e) => setCompareFuelPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trips Per Month
              </label>
              <input
                type="number"
                min="1"
                value={tripsPerMonth}
                onChange={(e) => setTripsPerMonth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Comparison Results Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
                Savings Verdict
              </h4>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Estimated Annual Fuel Savings
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatINR(compareResult.annualDifference)} / year
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {compareResult.moreEfficient ? (
                    <span>
                      Choosing <strong>Vehicle {compareResult.moreEfficient}</strong> saves approximately{' '}
                      <strong>{formatINR(compareResult.monthlyDifference)}</strong> per month ({compareResult.percentSavings}% fuel economy improvement).
                    </span>
                  ) : (
                    'Both vehicles have identical fuel efficiency for this journey.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 block text-[11px]">Monthly Difference</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {formatINR(compareResult.monthlyDifference)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 block text-[11px]">Single Trip Diff</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {formatINR(compareResult.tripDifference)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Recharts Visualizer */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Cost Comparison Chart
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Comparing single trip vs estimated monthly fuel outlay (₹ INR)
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      formatter={(val) => [formatINR(val), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="Vehicle A" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vehicle A" />
                    <Bar dataKey="Vehicle B" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Vehicle B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> Vehicle A ({compareMileageA} km/L)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" /> Vehicle B ({compareMileageB} km/L)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

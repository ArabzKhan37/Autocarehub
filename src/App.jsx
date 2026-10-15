import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Garage from './pages/Garage';
import Maintenance from './pages/Maintenance';
import FuelCalculatorPage from './pages/FuelCalculatorPage';
import Expenses from './pages/Expenses';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your automobiles, upkeep & running expenses' },
  '/garage': { title: 'My Garage', subtitle: 'Manage your registered vehicles and specs' },
  '/maintenance': { title: 'Maintenance Manager', subtitle: 'Service schedules, intervals & reminder thresholds' },
  '/fuel-calculator': { title: 'Fuel & Trip Calculator', subtitle: 'Estimate journey costs and compare two vehicles' },
  '/expenses': { title: 'Expense Tracker', subtitle: 'Monitor spending, fuel fills, and servicing invoices' },
  '/insights': { title: 'Smart Insights', subtitle: 'Explainable rules-based intelligence for your fleet' },
  '/settings': { title: 'Settings', subtitle: 'Preferences, regional units, theme & data backups' },
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentMeta = PAGE_META[location.pathname] || {
    title: 'AutoCare Hub',
    subtitle: 'Your Car. Your Care. Your Control.',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel-calculator" element={<FuelCalculatorPage />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}

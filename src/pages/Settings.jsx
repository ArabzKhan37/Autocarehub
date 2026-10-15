import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Shield,
  Info,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const {
    settings,
    toggleTheme,
    resetToDemoData,
    clearAllData,
    exportData,
    importData,
    showToast,
  } = useApp();

  const fileInputRef = useRef(null);

  // Confirmation dialog states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        importData(content);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-cyan-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Application Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Customize unit preferences, interface appearance, backups, and garage datasets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Units Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Display & Regional Units
          </h3>

          <div className="space-y-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                  {settings.theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Interface Theme
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Currently set to {settings.theme === 'dark' ? 'Deep Navy (Dark)' : 'Light Mode'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
              >
                Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Currency (INR) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Currency Format
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standard Indian Rupee (INR)
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-navy-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                ₹ INR
              </span>
            </div>

            {/* Distance Unit */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Distance Unit
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Metric odometer standard
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-navy-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Kilometres (km)
              </span>
            </div>

            {/* Fuel Consumption Unit */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Fuel Economy Metric
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kilometres per litre
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-navy-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                km/Litre
              </span>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backups Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Data Management & Backups
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Export and import your garage records as portable JSON backups.
            </p>

            <div className="space-y-3">
              {/* Export JSON */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Export JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Download full copy of vehicles, services & expenses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> Export
                </button>
              </div>

              {/* Import JSON */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Restore JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload and validate a previously exported backup file
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="backup-file-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-400" /> Import
                </button>
              </div>

              {/* Reset to Demo Data */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Reset Demo Dataset
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restore realistic demo vehicles and tasks for hackathon judging
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Clear All Data */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-rose-500">
                    Clear All Garage Records
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Wipe all vehicles and expenses to start completely fresh
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Wipe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security, Privacy & App Architecture Notes */}
      <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />
          Privacy & Technology Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white block">
              100% Client-Side Privacy
            </span>
            <p className="text-slate-400 leading-relaxed">
              All vehicle data, service logs, and expense amounts remain isolated within your browser's localStorage. No tracking or telemetry is dispatched.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Zero External Cloud APIs
            </span>
            <p className="text-slate-400 leading-relaxed">
              Designed specifically for hackathon reliability. Runs completely offline without external paid subscriptions or API rate limits.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Transparent Calculations
            </span>
            <p className="text-slate-400 leading-relaxed">
              Every fuel cost, distance calculation, and service reminder status is generated with fully deterministic, explainable mathematical logic.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset to Realistic Demo Records?"
        message="This will replace current entries with realistic sample vehicles (Honda City & Hyundai Creta) with maintenance intervals and sample expenses. Useful for live demonstrations."
        confirmText="Reset Demo Data"
        confirmVariant="primary"
        onConfirm={() => {
          resetToDemoData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Wipe All Application Data?"
        message="Are you sure you want to clear your garage? All vehicles, service records, and expenses will be removed from your browser."
        confirmText="Wipe Everything"
        confirmVariant="danger"
        onConfirm={() => {
          clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}

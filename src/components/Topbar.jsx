import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReminderCenterModal from './ReminderCenterModal';
import ConfirmDialog from './ConfirmDialog';

export default function Topbar({ title, subtitle, onOpenMobileMenu }) {
  const {
    settings,
    toggleTheme,
    reminders,
    overdueCount,
    resetToDemoData,
  } = useApp();

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Reset Shortcut */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/80 hover:bg-slate-100 dark:hover:bg-navy-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
            title="Reset application to realistic demo records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
            <span>Reset Demo Data</span>
          </button>

          {/* Reminders / Bell button */}
          <button
            type="button"
            onClick={() => setIsReminderOpen(true)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="View maintenance reminders"
          >
            <Bell className="w-5 h-5" />
            {reminders.length > 0 && (
              <span
                className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm ${
                  overdueCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                }`}
              >
                {reminders.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Profile Placeholder */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-navy-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shadow-inner">
              AH
            </div>
            <div className="hidden xl:block text-left text-xs leading-none">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Car Owner
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Hackathon Demo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Reminder Center Modal */}
      <ReminderCenterModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
      />

      {/* Reset Demo Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset to Realistic Demo Data?"
        message="This will overwrite current local records with the official AutoCare Hub demo dataset (2 vehicles, service tasks, and expense records). Ideal for testing or hackathon presentation."
        confirmText="Reset to Demo"
        confirmVariant="primary"
        onConfirm={() => {
          resetToDemoData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
}

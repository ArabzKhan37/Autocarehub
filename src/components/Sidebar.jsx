import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Fuel,
  Receipt,
  Sparkles,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const { reminders, overdueCount, vehicles } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/garage', label: 'My Garage', icon: Car, badge: vehicles.length },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: reminders.length > 0 ? reminders.length : null,
      badgeVariant: overdueCount > 0 ? 'danger' : 'warning',
    },
    { to: '/fuel-calculator', label: 'Fuel Calculator', icon: Fuel },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/insights', label: 'Smart Insights', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  AutoCare
                </span>
                <span className="font-bold text-base text-cyan-500 dark:text-cyan-400">Hub</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                Smart Companion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 dark:text-slate-400 group-hover:text-brand-500 dark:group-hover:text-cyan-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeVariant === 'danger'
                            ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Tagline footer */}
        <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Hackathon MVP</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            "Your Car. Your Care. Your Control."
          </p>
        </div>
      </aside>
    </>
  );
}

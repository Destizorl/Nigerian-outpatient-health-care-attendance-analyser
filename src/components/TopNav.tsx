/**
 * Top navigation bar strictly following the Top Bar Contract:
 * [Brand title, one line] — [Nav links, 1-2 word labels, single-line] — [Actions & User Profile]
 * Includes a persistent academic demonstration banner.
 */

import React from 'react';
import { Activity, FileText, ShieldAlert, Sparkles } from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';

export type PAASNavTab = 
  | 'dashboard'
  | 'datasets'
  | 'cleaning'
  | 'duplicates'
  | 'attendance'
  | 'statistics'
  | 'reports'
  | 'history'
  | 'governance'
  | 'oodm';

interface TopNavProps {
  activeTab: PAASNavTab;
  setActiveTab: (tab: PAASNavTab) => void;
  onOpenReport: () => void;
  onOpenSimulator: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  totalRecordsCount: number;
  isSyntheticDemo?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenSimulator,
  onOpenAuth,
  totalRecordsCount,
  isSyntheticDemo = true
}) => {
  const navItems: { id: PAASNavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'datasets', label: 'Datasets' },
    { id: 'cleaning', label: 'Data Cleaning' },
    { id: 'duplicates', label: 'Duplicates Review' },
    { id: 'attendance', label: 'Attendance & Depts' },
    { id: 'statistics', label: 'Statistical Tests' },
    { id: 'reports', label: 'Reports & Exports' },
    { id: 'history', label: 'Reproducibility' },
    { id: 'governance', label: 'Audit & Roles' },
    { id: 'oodm', label: 'OODM Architecture' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      
      {/* Persistent Academic & Demonstration Mode Indicator */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1 text-center text-[11px] font-medium border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="font-semibold text-white tracking-wide">
          DEMONSTRATION SYSTEM:
        </span>
        <span className="text-slate-300">
          De-identified & simulated health encounter records for Nigerian public hospital outpatient analysis and academic thesis evaluation.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            <Activity className="w-4.5 h-4.5 text-teal-300" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 leading-none">
              PAAS Nigeria
            </div>
            <div className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
              Patient Attendance Analysis System
            </div>
          </div>
        </div>

        {/* Zone 2: Scrollable / responsive concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600 overflow-x-auto py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'text-teal-900 border-b-2 border-teal-800 font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & User Authentication Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cohort Simulator
          </button>

          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Technical Brief</span>
            <span className="sm:hidden">Brief</span>
          </button>

          <div className="border-l border-slate-200 pl-2.5 flex items-center">
            <UserProfileMenu onOpenAuth={onOpenAuth} />
          </div>
        </div>

      </div>

      {/* Mobile & Tablet navigation horizontal strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs no-scrollbar">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-teal-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

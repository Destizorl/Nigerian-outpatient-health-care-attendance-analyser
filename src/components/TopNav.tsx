/**
 * Top navigation bar strictly following the Top Bar Contract:
 * [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
 */

import React from 'react';
import { Activity, FileText } from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';

interface TopNavProps {
  activeTab: 'dashboard' | 'cleaning' | 'oodm' | 'learning';
  setActiveTab: (tab: 'dashboard' | 'cleaning' | 'oodm' | 'learning') => void;
  onOpenReport: () => void;
  onOpenSimulator: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  totalRecordsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenSimulator,
  onOpenAuth,
  totalRecordsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            <Activity className="w-4.5 h-4.5 text-teal-300" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            NaijaOPD Analytics
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'text-teal-900 border-b-2 border-teal-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Attendance Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('cleaning')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cleaning'
                ? 'text-teal-900 border-b-2 border-teal-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Data Cleaning Lab
          </button>

          <button
            onClick={() => setActiveTab('oodm')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'oodm'
                ? 'text-teal-900 border-b-2 border-teal-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            OODM Architecture
          </button>

          <button
            onClick={() => setActiveTab('learning')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'learning'
                ? 'text-teal-900 border-b-2 border-teal-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Learning Scenarios
          </button>
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
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Technical Brief</span>
          </button>

          <div className="border-l border-slate-200 pl-2.5 flex items-center">
            <UserProfileMenu onOpenAuth={onOpenAuth} />
          </div>
        </div>

      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-2 py-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`text-xs px-2 py-1 rounded font-medium ${activeTab === 'dashboard' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('cleaning')}
          className={`text-xs px-2 py-1 rounded font-medium ${activeTab === 'cleaning' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'}`}
        >
          Cleaning Lab
        </button>
        <button
          onClick={() => setActiveTab('oodm')}
          className={`text-xs px-2 py-1 rounded font-medium ${activeTab === 'oodm' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'}`}
        >
          OODM Design
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={`text-xs px-2 py-1 rounded font-medium ${activeTab === 'learning' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'}`}
        >
          Scenarios
        </button>
      </div>
    </header>
  );
};

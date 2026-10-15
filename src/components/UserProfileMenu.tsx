/**
 * User Profile Menu & Authentication Status Trigger for TopNav
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Shield, Building, ChevronDown, CheckCircle2 } from 'lucide-react';

interface UserProfileMenuProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ onOpenAuth }) => {
  const { user, userProfile, signOutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Sign In
        </button>
        <button
          onClick={() => onOpenAuth('signup')}
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Register
        </button>
      </div>
    );
  }

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Analyst';
  const role = userProfile?.role || 'Public Health Analyst';
  const facility = userProfile?.facilityAffiliation || 'Public Referral Hospital';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
          {displayName.charAt(0).toUpperCase()}
        </div>
        
        <div className="hidden lg:block text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
            {displayName}
          </div>
          <div className="text-[10px] text-teal-800 font-mono leading-tight truncate max-w-[120px]">
            {role}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95">
          
          {/* User Details */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <div className="font-bold text-slate-900 truncate">{displayName}</div>
            <div className="text-slate-500 text-[11px] font-mono truncate">{user.email}</div>
            
            <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Shield className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                <span className="font-medium text-slate-800">{role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{facility}</span>
              </div>
            </div>
          </div>

          {/* Status info */}
          <div className="px-4 py-2 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Session Status:</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Authenticated
            </span>
          </div>

          {/* Sign Out */}
          <div className="px-2 pt-1">
            <button
              onClick={() => {
                signOutUser();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

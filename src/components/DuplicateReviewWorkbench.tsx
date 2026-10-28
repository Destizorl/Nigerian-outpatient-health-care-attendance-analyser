/**
 * Duplicate & Repeat Encounter Review Workbench for PAAS.
 * Implements transparent, non-destructive audit for records custodians:
 * Supports distinguishing clerical duplicates from genuine patient repeat attendances.
 */

import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Search, 
  Filter, 
  ShieldAlert, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { DuplicateFlaggedItem, DuplicateDisposition } from '../types/hospital';
import { useAuth } from '../contexts/AuthContext';

interface DuplicateReviewWorkbenchProps {
  flaggedItems: DuplicateFlaggedItem[];
  onUpdateDisposition: (id: string, disposition: DuplicateDisposition, notes: string) => void;
  onAuditAction?: (action: string, summary: string) => void;
}

export const DuplicateReviewWorkbench: React.FC<DuplicateReviewWorkbenchProps> = ({
  flaggedItems,
  onUpdateDisposition,
  onAuditAction
}) => {
  const { currentRole, user } = useAuth();
  const [filterDisposition, setFilterDisposition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<DuplicateFlaggedItem | null>(flaggedItems[0] || null);

  const [editNotes, setEditNotes] = useState<string>('');

  // When selectedItem changes, initialize editNotes
  const handleSelectItem = (item: DuplicateFlaggedItem) => {
    setSelectedItem(item);
    setEditNotes(item.reviewNotes || '');
  };

  const handleApplyDisposition = (disposition: DuplicateDisposition) => {
    if (!selectedItem) return;

    onUpdateDisposition(selectedItem.id, disposition, editNotes);

    if (onAuditAction) {
      onAuditAction(
        'DUPLICATE_DISPOSITION_SET',
        `Encounter ${selectedItem.suspectEncounterId} classified as '${disposition}' by ${user?.displayName || currentRole}. Note: ${editNotes || 'Standard custodian protocol'}`
      );
    }

    // Update local state copy
    setSelectedItem({
      ...selectedItem,
      disposition,
      reviewNotes: editNotes,
      reviewedBy: user?.displayName || currentRole,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    });
  };

  // Filtered list
  const filteredList = flaggedItems.filter(item => {
    const matchesFilter = filterDisposition === 'all' || item.disposition === filterDisposition;
    const matchesSearch = 
      item.hospitalCardNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suspectEncounterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Summary counts
  const countUnresolved = flaggedItems.filter(i => i.disposition === 'Unresolved').length;
  const countConfirmed = flaggedItems.filter(i => i.disposition === 'Confirmed Duplicate').length;
  const countRepeats = flaggedItems.filter(i => i.disposition === 'Genuine Repeat Encounter').length;
  const countExceptions = flaggedItems.filter(i => i.disposition === 'Documented Exception').length;

  const isAuthorisedReviewer = 
    currentRole === 'Records / Data Custodian' || 
    currentRole === 'Data Analyst / Researcher' || 
    currentRole === 'Administrator';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 3: Custodian Review
              </span>
              <span className="text-xs text-slate-500 font-mono">
                NDPA 2023 Non-destructive Audit Protocol
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Duplicate & Repeat Encounter Workbench
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Distinguish between clerical registration double-entries and genuine patient re-attendances. In public hospitals, patients frequently return for malaria therapy reviews or specialist cross-consultations. Never auto-purge records without custodian review.
            </p>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
              <span>Unresolved Queue</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1">{countUnresolved}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Pending archive check</div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-red-800 font-medium">
              <span>Confirmed Duplicates</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-red-900 mt-1">{countConfirmed}</div>
            <div className="text-[11px] text-red-700 mt-0.5">Excluded from analysis</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
              <span>Genuine Repeat Visits</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">{countRepeats}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Retained in working copy</div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-blue-800 font-medium">
              <span>Documented Exceptions</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-blue-900 mt-1">{countExceptions}</div>
            <div className="text-[11px] text-blue-700 mt-0.5">Composite clinic visits</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Flagged List & Detailed Side-by-side Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col h-[700px]">
          {/* Search & Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search card no, ID, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 shrink-0 text-[11px]">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['all', 'Unresolved', 'Confirmed Duplicate', 'Genuine Repeat Encounter', 'Documented Exception'].map(disp => (
                <button
                  key={disp}
                  onClick={() => setFilterDisposition(disp)}
                  className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                    filterDisposition === disp
                      ? 'bg-slate-800 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {disp === 'all' ? 'All (Total)' : disp}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No flagged encounters match your filter criteria.
              </div>
            ) : (
              filteredList.map(item => {
                const isSelected = selectedItem?.id === item.id;
                let badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                if (item.disposition === 'Confirmed Duplicate') badgeClass = 'bg-red-100 text-red-800 border-red-200';
                if (item.disposition === 'Genuine Repeat Encounter') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (item.disposition === 'Documented Exception') badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-semibold text-slate-800">
                        {item.hospitalCardNo}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass}`}>
                        {item.disposition}
                      </span>
                    </div>

                    <div className="mt-1 text-slate-700 font-medium truncate">
                      {item.diagnosis}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Primary: {item.datePrimary}</span>
                      <span>Suspect: {item.dateSuspect}</span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.matchReasons.map(r => (
                        <span key={r} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail & Workbench Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          {selectedItem ? (
            <div className="space-y-6">
              
              {/* Card Title & Match Confidence */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                      Audit Case Ref: {selectedItem.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Patient Card: {selectedItem.hospitalCardNo}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Heuristic Match Score</span>
                    <span className="text-lg font-bold font-mono text-teal-800">
                      {selectedItem.matchScore}% Confidence
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedItem.matchReasons.map(reason => (
                    <span key={reason} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side-by-side Encounter Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Encounter Record */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Primary Encounter
                    </span>
                    <span className="font-mono text-xs text-teal-800 font-semibold">
                      {selectedItem.primaryEncounterId}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Encounter Date:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.datePrimary}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Department:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Clinical Impression:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Registration Status:</span>
                      <span className="text-emerald-700 font-medium">Verified in Register</span>
                    </div>
                  </div>
                </div>

                {/* Suspect / Repeat Encounter Record */}
                <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                  <div className="flex items-center justify-between mb-3 border-b border-teal-200 pb-2">
                    <span className="text-xs font-bold text-teal-900 uppercase">
                      Flagged Encounter
                    </span>
                    <span className="font-mono text-xs text-teal-900 font-semibold">
                      {selectedItem.suspectEncounterId}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Encounter Date:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.dateSuspect}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Department:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Clinical Impression:</span>
                      <span className="font-semibold text-slate-800">{selectedItem.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Review Disposition:</span>
                      <span className="font-semibold text-slate-900">{selectedItem.disposition}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custodian Notes & Decision Rationale */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Records Custodian Technical Rationale & Audit Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Document clinical context (e.g. 48hr follow-up, registration re-entry, prescription refill, casualty transfer)..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Last Reviewed: {selectedItem.reviewedAt || 'Pending review'} by {selectedItem.reviewedBy || 'N/A'}</span>
                  <span>Required for NDPA 2023 compliance audit</span>
                </div>
              </div>

              {/* Action Buttons to Set Disposition */}
              <div className="pt-4 border-t border-slate-200">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Assign Custodian Disposition:
                </span>

                {!isAuthorisedReviewer ? (
                  <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
                    Viewing mode: Only <strong>Records Custodians</strong>, <strong>Analysts</strong>, or <strong>Admins</strong> can commit duplicate dispositions.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleApplyDisposition('Confirmed Duplicate')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedItem.disposition === 'Confirmed Duplicate'
                          ? 'border-red-600 bg-red-600 text-white shadow-xs'
                          : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Confirmed Duplicate</span>
                      <span className="text-[10px] opacity-80 font-normal">Exclude from stats</span>
                    </button>

                    <button
                      onClick={() => handleApplyDisposition('Genuine Repeat Encounter')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedItem.disposition === 'Genuine Repeat Encounter'
                          ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Genuine Repeat</span>
                      <span className="text-[10px] opacity-80 font-normal">Retain in stats</span>
                    </button>

                    <button
                      onClick={() => handleApplyDisposition('Documented Exception')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedItem.disposition === 'Documented Exception'
                          ? 'border-blue-700 bg-blue-700 text-white shadow-xs'
                          : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Clinic Exception</span>
                      <span className="text-[10px] opacity-80 font-normal">Multi-clinic visit</span>
                    </button>

                    <button
                      onClick={() => handleApplyDisposition('Unresolved')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedItem.disposition === 'Unresolved'
                          ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                          : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Leave Unresolved</span>
                      <span className="text-[10px] opacity-80 font-normal">Needs archive search</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select an encounter from the flagged list on the left to review.
            </div>
          )}

          {/* Educational Note */}
          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
            <span>
              <strong>Methodological Guidance for Public Hospitals:</strong> In epidemiological analysis, counting multiple encounters for the same chronic patient (e.g. monthly hypertensive refills) as new disease cases creates artificial incidence inflation. Marking them as "Genuine Repeat Encounter" preserves attendance utilization counts while preventing diagnostic duplication.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

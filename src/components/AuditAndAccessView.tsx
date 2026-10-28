/**
 * Role-Based Access Control (RBAC) & System Audit Trail for PAAS.
 * Manages authorized personnel cadres, permissions matrix,
 * immutable security event logs, and NDPA 2023 compliance status.
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Key, 
  Clock, 
  ShieldAlert, 
  FileText,
  UserCheck
} from 'lucide-react';
import { SystemUser, UserRole, AuditEvent } from '../types/hospital';
import { INITIAL_SYSTEM_USERS } from '../data/mockHospitalData';
import { useAuth } from '../contexts/AuthContext';

interface AuditAndAccessViewProps {
  auditLogs: AuditEvent[];
  onAddAuditLog?: (event: AuditEvent) => void;
}

export const AuditAndAccessView: React.FC<AuditAndAccessViewProps> = ({
  auditLogs,
  onAddAuditLog
}) => {
  const { currentRole, setCurrentRole, user } = useAuth();
  const [usersList, setUsersList] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [searchAudit, setSearchAudit] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'roles' | 'ndpa'>('audit');

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = 
      log.summary.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.action.toLowerCase().includes(searchAudit.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Toggle user active status (Admin only)
  const handleToggleUserActive = (uid: string) => {
    if (currentRole !== 'Administrator') return;
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, isActive: !u.isActive } : u));
  };

  const roleDefinitions: { role: UserRole; description: string; permissions: string[] }[] = [
    {
      role: 'Administrator',
      description: 'System security officer responsible for role provisioning, audit trail review, and retention policies.',
      permissions: ['Manage Users', 'View System Audit Logs', 'Configure Retention Policies', 'System Health Check']
    },
    {
      role: 'Data Analyst / Researcher',
      description: 'Epidemiologist or university researcher performing data cleaning, contingency cross-tabs, and hypothesis testing.',
      permissions: ['Import Approved Datasets', 'Configure Field Mappings', 'Apply Cleaning Rules', 'Execute Chi-Square Tests', 'Export XLSX & CSV Reports']
    },
    {
      role: 'Records / Data Custodian',
      description: 'Hospital medical records department officer verifying patient card provenance and resolving duplicate encounters.',
      permissions: ['Review Flagged Duplicates', 'Assign Custodian Dispositions', 'Verify Physical Health Records Card', 'Confirm Ingestion Provenance']
    },
    {
      role: 'Supervisor / Authorised Reviewer',
      description: 'Academic advisor, department head, or FMCPH supervisor auditing analytical rigor and research reproducibility.',
      permissions: ['Audit Methodological Assumptions', 'Inspect Analysis History & Hashes', 'Sign-off on Academic Chapters', 'View Read-only Working Copy']
    },
    {
      role: 'Hospital Manager / Stakeholder',
      description: 'Chief Medical Director (CMD) or Ministry official reviewing departmental workloads, wait times, and drug allocations.',
      permissions: ['View Executive Dashboards', 'Inspect Department Waiting Times', 'Review NHIA Insurance Penetration', 'Download PDF Technical Briefs']
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 7: Governance & Security
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Nigeria Data Protection Act (NDPA 2023)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Access Control & Security Audit Trail
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Role-Based Access Control (RBAC) enforces zero-trust data segregation between hospital record custodians, epidemiological researchers, and administrative executives.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Audit Trail
            </button>
            <button
              onClick={() => setActiveSubTab('roles')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'roles'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              User Roles & Matrix
            </button>
            <button
              onClick={() => setActiveSubTab('ndpa')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'ndpa'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NDPA 2023 Checklist
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'audit' && (
        /* AUDIT TRAIL LOGS */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-800" />
                <span>Immutable System Event Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every dataset import, cleaning transformation, duplicate disposition, and report export is timestamped and cryptographically associated with user session credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700"
              >
                <option value="all">All Actions</option>
                <option value="DATASET_IMPORT">Dataset Import</option>
                <option value="CLEANING_RULE_APPLIED">Cleaning Applied</option>
                <option value="DUPLICATE_DISPOSITION_SET">Duplicate Reviewed</option>
                <option value="STATISTICAL_TEST_EXECUTED">Statistical Test</option>
                <option value="REPORT_EXPORTED_XLSX">Report Exported</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Log ID & Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Role Cadre</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Event Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map(log => {
                  let badge = 'bg-slate-100 text-slate-700';
                  if (log.action === 'DATASET_IMPORT') badge = 'bg-blue-100 text-blue-800';
                  if (log.action === 'CLEANING_RULE_APPLIED') badge = 'bg-teal-100 text-teal-800';
                  if (log.action === 'DUPLICATE_DISPOSITION_SET') badge = 'bg-purple-100 text-purple-800';
                  if (log.action === 'STATISTICAL_TEST_EXECUTED') badge = 'bg-emerald-100 text-emerald-800';
                  if (log.action.includes('EXPORTED')) badge = 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">{log.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.timestamp}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                        {log.userName}
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        {log.userRole}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-md">
                        {log.summary}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'roles' && (
        /* USER MANAGEMENT & ROLE PERMISSION MATRIX */
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-800" />
                  <span>Authorized Personnel Registry</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Users configured with institutional affiliations and assigned privileges.
                </p>
              </div>

              {currentRole === 'Administrator' && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  Admin Management Mode Active
                </span>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">User & Email</th>
                    <th className="p-3">Assigned Cadre</th>
                    <th className="p-3">Hospital / Institutional Affiliation</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Last Session</th>
                    {currentRole === 'Administrator' && <th className="p-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{u.displayName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                      </td>
                      <td className="p-3 font-medium text-teal-900">
                        {u.role}
                      </td>
                      <td className="p-3 text-slate-600">
                        {u.facilityAffiliation}
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 font-mono">
                        {u.lastLoginAt}
                      </td>
                      {currentRole === 'Administrator' && (
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleUserActive(u.uid)}
                            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Definitions & Permissions Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-800" />
              <span>Hierarchical Role Permission Matrix</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleDefinitions.map(def => {
                const isCurrent = currentRole === def.role;
                return (
                  <div
                    key={def.role}
                    className={`p-4 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'border-teal-800 bg-teal-50/30 shadow-xs'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{def.role}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-teal-800 text-white px-2 py-0.5 rounded-full font-semibold">
                          Active Role
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mb-3 leading-relaxed">
                      {def.description}
                    </p>

                    <div className="space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-700">
                      <div className="font-semibold text-slate-800 text-[10px] uppercase">Granted Permissions:</div>
                      {def.permissions.map(perm => (
                        <div key={perm} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-teal-700 shrink-0" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentRole(def.role)}
                      className="mt-4 w-full py-1.5 text-center text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
                    >
                      Switch to this Role (Demo)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ndpa' && (
        /* NDPA 2023 COMPLIANCE CHECKLIST */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Health Data Protection Framework</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Nigeria Data Protection Act (NDPA 2023) Compliance Audit
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Section 30 of the NDPA provides for the lawful processing of sensitive personal data (health records) for research, public health surveillance, and academic purposes under strict safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>De-identification & Anonymisation at Ingestion</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Patient first names, surnames, house addresses, telephone numbers, and next-of-kin contacts are never stored or processed in the analytical database. All encounters are pseudonymized using opaque card hashes (REC-CARD-XXXX).
              </p>
            </div>

            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Non-Destructive Separate Working Copy</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                The original ingested hospital registry file is held in an immutable read-only storage container with a SHA-256 cryptographic digest. Analytical transformations and data cleaning operate solely on a separate working copy.
              </p>
            </div>

            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Role-Segregated Authorization (RBAC)</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Hospital records custodians, health economists, and statistical computing analysts access dedicated functional views. Administrative officers cannot bypass hospital permissions or reveal individual patient identities.
              </p>
            </div>

            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Full Auditability & Transparency</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Every data cleaning heuristic applied (e.g. decimal truncation on temperatures, ICD-10 taxonomy aliasing) is recorded in an audit trail with technical rationale for university defense validation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

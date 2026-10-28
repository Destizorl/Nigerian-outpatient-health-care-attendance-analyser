/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  INITIAL_DATA, 
  INITIAL_PROVENANCE, 
  INITIAL_FLAGGED_DUPLICATES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_ANALYSIS_HISTORY 
} from './data/mockHospitalData';
import { DEFAULT_CLEANING_RULES, executeCleaningPipeline } from './services/cleaningPipeline';
import { 
  CleanOPDRecord, 
  RawMessyOPDRecord, 
  CleaningRule, 
  DatasetProvenance, 
  DuplicateFlaggedItem, 
  DuplicateDisposition, 
  AuditEvent, 
  AnalysisRunRecord 
} from './types/hospital';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TopNav, PAASNavTab } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { DatasetManagementView } from './components/DatasetManagementView';
import { DuplicateReviewWorkbench } from './components/DuplicateReviewWorkbench';
import { AttendanceAnalysisView } from './components/AttendanceAnalysisView';
import { StatisticalAnalysisView } from './components/StatisticalAnalysisView';
import { ReportsAndExportsView } from './components/ReportsAndExportsView';
import { AuditAndAccessView } from './components/AuditAndAccessView';
import { AnalysisHistoryView } from './components/AnalysisHistoryView';
import { DataCleaningLab } from './components/DataCleaningLab';
import { OodmStudio } from './components/OodmStudio';
import { LearningScenarios } from './components/LearningScenarios';
import { TechnicalBriefModal } from './components/TechnicalBriefModal';
import { SimulatorModal } from './components/SimulatorModal';
import { AuthModal } from './components/AuthModal';

function MainApp() {
  const { currentRole, user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<PAASNavTab>('dashboard');

  // Baseline and Raw Datasets
  const [rawRecords, setRawRecords] = useState<RawMessyOPDRecord[]>(INITIAL_DATA.messyRecords);
  const [baselineCleanRecords, setBaselineCleanRecords] = useState<CleanOPDRecord[]>(INITIAL_DATA.cleanRecords);

  // Provenance & Duplicates State
  const [provenance, setProvenance] = useState<DatasetProvenance>(INITIAL_PROVENANCE);
  const [flaggedDuplicates, setFlaggedDuplicates] = useState<DuplicateFlaggedItem[]>(INITIAL_FLAGGED_DUPLICATES);

  // System Audit Trail & Analysis History
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRunRecord[]>(INITIAL_ANALYSIS_HISTORY);

  // Cleaning Rules State
  const [rules, setRules] = useState<CleaningRule[]>(DEFAULT_CLEANING_RULES);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // User Notes per scenario
  const [userNotes, setUserNotes] = useState<{ [scenarioId: string]: string }>({
    'scenario-malaria-surge': 'Recommendation: Procure 65% of artemisinin stock in April before heavy rains. Shift 3 nurses to pediatric triage.',
    'scenario-monday-jam': 'Recommendation: Create express nurse-led refill bays on Monday mornings to reduce waiting times from 195 to 75 minutes.'
  });

  // Log Audit Event Helper
  const logAuditEvent = (action: any, summary: string, metadata?: Record<string, any>) => {
    const newLog: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      userId: user?.uid || 'USR-LOCAL',
      userName: user?.displayName || currentRole,
      userRole: currentRole,
      action,
      summary,
      metadata
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Execute cleaning pipeline reactively based on active rules
  const { processedRecords, metrics, auditTrail } = useMemo(() => {
    return executeCleaningPipeline(rawRecords, rules, baselineCleanRecords);
  }, [rawRecords, rules, baselineCleanRecords]);

  // Rule Handlers
  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    logAuditEvent('CLEANING_RULE_APPLIED', `Toggled state of rule: ${ruleId}`);
  };

  const handleResetRules = () => {
    setRules(DEFAULT_CLEANING_RULES.map(r => ({ ...r, enabled: true })));
    logAuditEvent('CLEANING_RULE_APPLIED', 'Reset all cleaning pipeline rules to benchmark defaults');
  };

  const handleApplyNewCohort = (clean: CleanOPDRecord[], messy: RawMessyOPDRecord[]) => {
    setBaselineCleanRecords(clean);
    setRawRecords(messy);
    logAuditEvent('DATASET_SWITCH', `Cohort simulator applied new synthetic patient sample of ${clean.length} records.`);
  };

  // Duplicate Disposition Handler
  const handleUpdateDuplicateDisposition = (id: string, disposition: DuplicateDisposition, notes: string) => {
    setFlaggedDuplicates(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          disposition,
          reviewNotes: notes,
          reviewedBy: user?.displayName || currentRole,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        };
      }
      return item;
    }));

    // Find suspect encounter ID
    const targetItem = flaggedDuplicates.find(i => i.id === id);
    if (targetItem) {
      setBaselineCleanRecords(prev => prev.map(rec => {
        if (rec.encounterId === targetItem.suspectEncounterId) {
          if (disposition === 'Confirmed Duplicate') {
            return { ...rec, isEligible: false, exclusionReason: 'Confirmed Clerical Duplicate (Excluded by Custodian)' };
          } else {
            return { ...rec, isEligible: true, exclusionReason: undefined };
          }
        }
        return rec;
      }));
    }
  };

  // Dataset Management Handlers
  const handleImportNewDataset = (clean: CleanOPDRecord[], messy: RawMessyOPDRecord[], prov: DatasetProvenance) => {
    setBaselineCleanRecords(clean);
    setRawRecords(messy);
    setProvenance(prov);
    logAuditEvent('DATASET_IMPORT', `Imported new dataset '${prov.title}' with ${clean.length} encounters (SHA-256: ${prov.sha256Checksum.substring(0, 12)}...)`);
  };

  const handleRestoreDemoData = () => {
    setBaselineCleanRecords(INITIAL_DATA.cleanRecords);
    setRawRecords(INITIAL_DATA.messyRecords);
    setProvenance(INITIAL_PROVENANCE);
    setFlaggedDuplicates(INITIAL_FLAGGED_DUPLICATES);
    logAuditEvent('DATASET_SWITCH', 'Restored Nigerian Public Tertiary Outpatient Attendance benchmark cohort.');
  };

  const handleExportCleanCSV = () => {
    const eligible = processedRecords.filter(r => r.isEligible);
    const headers = ['Encounter_ID', 'Card_No', 'Facility', 'Date', 'Day', 'Season', 'Age', 'Gender', 'Department', 'Diagnosis', 'NHIA', 'Wait_Time_Mins'];
    const rows = eligible.map(r => [
      r.encounterId,
      r.patientCardNo,
      `"${r.facilityName}"`,
      r.encounterDate,
      r.dayOfWeek,
      `"${r.season}"`,
      r.ageYears,
      r.gender,
      `"${r.department}"`,
      `"${r.diagnosisName}"`,
      r.nhiaInsured ? 'YES' : 'NO',
      r.waitingTimeMinutes
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PAAS_Hospital_Attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReproduceRun = (run: AnalysisRunRecord) => {
    logAuditEvent('ANALYSIS_REPRODUCED', `Reproduced historical run ${run.runId} with sample size ${run.sampleSizeAnalyzed}.`);
    setActiveTab('statistics');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      
      {/* Top Navigation Bar with Persistent Demonstration Banner */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        totalRecordsCount={processedRecords.length}
        isSyntheticDemo={provenance.isSyntheticDemo}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Module 1: Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            records={processedRecords}
            onOpenReport={() => setIsReportOpen(true)}
            onSelectScenario={() => setActiveTab('attendance')}
          />
        )}

        {/* Module 2: Dataset Management & Ingestion */}
        {activeTab === 'datasets' && (
          <DatasetManagementView
            provenance={provenance}
            onUpdateProvenance={setProvenance}
            rawRecordsCount={rawRecords.length}
            cleanedRecordsCount={processedRecords.length}
            onImportNewDataset={handleImportNewDataset}
            onRestoreDemoData={handleRestoreDemoData}
            onExportCleanCSV={handleExportCleanCSV}
          />
        )}

        {/* Module 3: Data Cleaning Laboratory */}
        {activeTab === 'cleaning' && (
          <DataCleaningLab
            rawRecords={rawRecords}
            cleanedRecords={processedRecords}
            rules={rules}
            onToggleRule={handleToggleRule}
            onResetRules={handleResetRules}
            metrics={metrics}
            auditTrail={auditTrail}
          />
        )}

        {/* Module 4: Duplicate & Repeat Encounter Review */}
        {activeTab === 'duplicates' && (
          <DuplicateReviewWorkbench
            flaggedItems={flaggedDuplicates}
            onUpdateDisposition={handleUpdateDuplicateDisposition}
            onAuditAction={logAuditEvent}
          />
        )}

        {/* Module 5: Attendance, Temporal & Department Analysis */}
        {activeTab === 'attendance' && (
          <AttendanceAnalysisView
            records={processedRecords}
          />
        )}

        {/* Module 6: Statistical Analysis & Hypothesis Testing */}
        {activeTab === 'statistics' && (
          <StatisticalAnalysisView
            records={processedRecords}
            onAuditAction={logAuditEvent}
          />
        )}

        {/* Module 7: Reports & Exports Hub */}
        {activeTab === 'reports' && (
          <ReportsAndExportsView
            records={processedRecords}
            provenance={provenance}
            metrics={metrics}
            onOpenPrintableBrief={() => setIsReportOpen(true)}
            onAuditAction={logAuditEvent}
          />
        )}

        {/* Module 8: Analysis History & Reproducibility */}
        {activeTab === 'history' && (
          <AnalysisHistoryView
            historyRecords={analysisHistory}
            onReproduceRun={handleReproduceRun}
            onAuditAction={logAuditEvent}
          />
        )}

        {/* Module 9: Access Control & System Audit Trail */}
        {activeTab === 'governance' && (
          <AuditAndAccessView
            auditLogs={auditLogs}
          />
        )}

        {/* Module 10: OODM Architecture */}
        {activeTab === 'oodm' && (
          <OodmStudio
            records={processedRecords}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PAAS Nigeria</span>
            <span>·</span>
            <span>Patient Attendance Analysis System for Nigerian Public Hospitals</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Aligned with WHO ICD-10, NCDC Disease Surveillance & NDPA 2023 Section 30
          </div>
        </div>
      </footer>

      {/* Ministerial Technical Brief Modal */}
      {isReportOpen && (
        <TechnicalBriefModal
          records={processedRecords}
          metrics={metrics}
          userNotes={userNotes}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Cohort Simulator Modal */}
      {isSimulatorOpen && (
        <SimulatorModal
          onApplyNewCohort={handleApplyNewCohort}
          onClose={() => setIsSimulatorOpen(false)}
        />
      )}

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

import React, { useState, useMemo } from 'react';
import { INITIAL_DATA } from './data/mockHospitalData';
import { DEFAULT_CLEANING_RULES, executeCleaningPipeline } from './services/cleaningPipeline';
import { CleanOPDRecord, RawMessyOPDRecord, CleaningRule } from './types/hospital';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { DataCleaningLab } from './components/DataCleaningLab';
import { OodmStudio } from './components/OodmStudio';
import { LearningScenarios } from './components/LearningScenarios';
import { TechnicalBriefModal } from './components/TechnicalBriefModal';
import { SimulatorModal } from './components/SimulatorModal';
import { AuthModal } from './components/AuthModal';

function MainApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaning' | 'oodm' | 'learning'>('dashboard');

  // Baseline and Raw Datasets
  const [rawRecords, setRawRecords] = useState<RawMessyOPDRecord[]>(INITIAL_DATA.messyRecords);
  const [baselineCleanRecords, setBaselineCleanRecords] = useState<CleanOPDRecord[]>(INITIAL_DATA.cleanRecords);

  // Cleaning Rules State
  const [rules, setRules] = useState<CleaningRule[]>(DEFAULT_CLEANING_RULES);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Active scenario for learning tab
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-malaria-surge');

  // User Notes per scenario
  const [userNotes, setUserNotes] = useState<{ [scenarioId: string]: string }>({
    'scenario-malaria-surge': 'Recommendation: Procure 65% of artemisinin stock in April before heavy rains. Shift 3 nurses to pediatric triage.',
    'scenario-monday-jam': 'Recommendation: Create express nurse-led refill bays on Monday mornings to reduce waiting times from 195 to 75 minutes.'
  });

  // Execute cleaning pipeline reactively based on active rules
  const { processedRecords, metrics, auditTrail } = useMemo(() => {
    return executeCleaningPipeline(rawRecords, rules, baselineCleanRecords);
  }, [rawRecords, rules, baselineCleanRecords]);

  // Rule Handlers
  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const handleResetRules = () => {
    setRules(DEFAULT_CLEANING_RULES.map(r => ({ ...r, enabled: true })));
  };

  const handleApplyNewCohort = (clean: CleanOPDRecord[], messy: RawMessyOPDRecord[]) => {
    setBaselineCleanRecords(clean);
    setRawRecords(messy);
  };

  const handleSaveNote = (scenarioId: string, note: string) => {
    setUserNotes(prev => ({
      ...prev,
      [scenarioId]: note
    }));
  };

  const handleNavigateToScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setActiveTab('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      
      {/* Top Navigation Bar following Top Bar Contract */}
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
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            records={processedRecords}
            onOpenReport={() => setIsReportOpen(true)}
            onSelectScenario={handleNavigateToScenario}
          />
        )}

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

        {activeTab === 'oodm' && (
          <OodmStudio
            records={processedRecords}
          />
        )}

        {activeTab === 'learning' && (
          <LearningScenarios
            records={processedRecords}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={setSelectedScenarioId}
            userNotes={userNotes}
            onSaveNote={handleSaveNote}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NaijaOPD Analytics</span>
            <span>·</span>
            <span>Nigerian Public Hospital Outpatient & OODM Health Systems Lab</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Aligned with WHO ICD-10 & NCDC Integrated Disease Surveillance
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

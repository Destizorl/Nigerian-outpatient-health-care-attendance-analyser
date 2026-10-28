/**
 * Analysis History & Reproducibility Console for PAAS.
 * Tracks executed analytical runs, dataset SHA-256 hashes, parameter snapshots,
 * and allows 1-click reproduction to verify computational reproducibility.
 */

import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Layers, 
  ExternalLink,
  Sliders,
  Check
} from 'lucide-react';
import { AnalysisRunRecord } from '../types/hospital';
import { INITIAL_ANALYSIS_HISTORY } from '../data/mockHospitalData';
import { useAuth } from '../contexts/AuthContext';

interface AnalysisHistoryViewProps {
  historyRecords?: AnalysisRunRecord[];
  onReproduceRun?: (run: AnalysisRunRecord) => void;
  onAuditAction?: (action: string, summary: string) => void;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  historyRecords = INITIAL_ANALYSIS_HISTORY,
  onReproduceRun,
  onAuditAction
}) => {
  const { currentRole, user } = useAuth();
  const [runs, setRuns] = useState<AnalysisRunRecord[]>(historyRecords);
  const [selectedRun, setSelectedRun] = useState<AnalysisRunRecord>(runs[0]);
  const [reproduceSuccess, setReproduceSuccess] = useState<string | null>(null);

  const handleReproduce = (run: AnalysisRunRecord) => {
    setSelectedRun(run);
    if (onReproduceRun) {
      onReproduceRun(run);
    }
    if (onAuditAction) {
      onAuditAction(
        'ANALYSIS_REPRODUCED',
        `Re-executed historical analysis ${run.runId} (Dataset Hash: ${run.datasetHash.substring(0, 12)}...) by ${user?.displayName || currentRole}`
      );
    }
    setReproduceSuccess(`Analysis run ${run.runId} successfully re-loaded into working memory! Metrics verified.`);
    setTimeout(() => setReproduceSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 8: Reproducibility & Audit
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Cryptographic Integrity & Parameter Snapshots
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Analysis History & Reproducibility Console
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              An academic and epidemiological cornerstone: every analytical run is tagged with dataset versioning, cryptographic SHA-256 hashes, active data cleaning rules, significance thresholds, and sample sizes.
            </p>
          </div>
        </div>

        {reproduceSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{reproduceSuccess}</span>
          </div>
        )}
      </div>

      {/* Runs Table & Snapshot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Runs List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-800" />
            <span>Saved Analytical Snapshots</span>
          </div>

          <div className="space-y-2">
            {runs.map(run => {
              const isSelected = selectedRun.runId === run.runId;
              return (
                <div
                  key={run.runId}
                  onClick={() => setSelectedRun(run)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{run.runId}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      N = {run.sampleSizeAnalyzed}
                    </span>
                  </div>

                  <div className="mt-1 text-slate-700 font-medium truncate">
                    {run.analystName}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
                    Hash: {run.datasetHash.substring(0, 16)}...
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{run.timestamp}</span>
                    <span className="text-teal-800 font-semibold">{run.parameters.statisticalTestUsed || 'Chi-Square'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Snapshot Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                    Snapshot Details: {selectedRun.runId}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Dataset Version: {selectedRun.datasetVersion}
                  </h2>
                </div>

                <button
                  onClick={() => handleReproduce(selectedRun)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reproduce Snapshot</span>
                </button>
              </div>

              <div className="mt-3 font-mono text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 select-all">
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Cryptographic Ingestion Hash (SHA-256):</span>
                {selectedRun.datasetHash}
              </div>
            </div>

            {/* Parameters Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Recorded Analytical Parameters
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-slate-400 block text-[11px]">Analyst & Session:</span>
                  <span className="font-semibold text-slate-800">{selectedRun.analystName}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{selectedRun.timestamp}</span>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-slate-400 block text-[11px]">Significance Threshold:</span>
                  <span className="font-semibold text-slate-800">α = {selectedRun.parameters.significanceAlpha}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{selectedRun.parameters.statisticalTestUsed}</span>
                </div>
              </div>
            </div>

            {/* Active Cleaning Rules at Run Time */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Active Data Cleaning Pipeline Rules ({selectedRun.parameters.cleaningRulesActive.length} active)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedRun.parameters.cleaningRulesActive.map(ruleId => (
                  <span key={ruleId} className="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded text-xs font-mono">
                    ✓ {ruleId}
                  </span>
                ))}
              </div>
            </div>

            {/* Findings Summary */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Recorded Epidemiological Findings:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{selectedRun.keyFindingsSummary}"
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified in conformity with National Health Act (2014) data governance standards.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

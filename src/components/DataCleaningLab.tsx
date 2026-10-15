/**
 * Interactive Data Cleaning & Health Informatics Laboratory.
 * Teaches how messy real-world paper hospital records are cleaned, standardized, and audited for epidemiology.
 */

import React, { useState, useMemo } from 'react';
import { RawMessyOPDRecord, CleanOPDRecord, CleaningRule } from '../types/hospital';
import { QualityMetrics } from '../services/cleaningPipeline';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';

interface DataCleaningLabProps {
  rawRecords: RawMessyOPDRecord[];
  cleanedRecords: CleanOPDRecord[];
  rules: CleaningRule[];
  onToggleRule: (ruleId: string) => void;
  onResetRules: () => void;
  metrics: QualityMetrics;
  auditTrail: {
    recordId: string;
    field: string;
    raw: string;
    transformed: string;
    ruleId: string;
    rationale: string;
  }[];
}

export const DataCleaningLab: React.FC<DataCleaningLabProps> = ({
  rawRecords,
  cleanedRecords,
  rules,
  onToggleRule,
  onResetRules,
  metrics,
  auditTrail
}) => {
  const [filterAnomalyType, setFilterAnomalyType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectRawRecord, setInspectRawRecord] = useState<RawMessyOPDRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'audit' | 'dictionary'>('records');

  // Custom taxonomy sandbox state
  const [aliasTesterInput, setAliasTesterInput] = useState<string>('Malaria ++');

  // Filter raw records with anomalies
  const dirtyRecords = useMemo(() => {
    return rawRecords.filter(r => {
      if (filterAnomalyType !== 'all') {
        const hasType = r.anomaliesDetected.some(a => a.issueType === filterAnomalyType);
        if (!hasType) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCard = r.hospital_card_no.toLowerCase().includes(q);
        const matchDiag = r.diagnosis_raw.toLowerCase().includes(q);
        const matchDate = r.raw_date.toLowerCase().includes(q);
        if (!matchCard && !matchDiag && !matchDate) return false;
      }
      return true;
    });
  }, [rawRecords, filterAnomalyType, searchQuery]);

  // Taxonomy dictionary test result
  const dictionaryResult = useMemo(() => {
    const term = aliasTesterInput.trim().toLowerCase();
    if (term.includes('malaria') || term.includes('mp')) {
      return {
        standardName: 'Uncomplicated Plasmodium Falciparum Malaria',
        icd10: 'B54',
        category: 'Malaria & Parasitic',
        matchRule: 'Regex: /(malaria|mp\\s*\\+)/i',
        status: 'Resolved Successfully'
      };
    }
    if (term.includes('htn') || term.includes('bp') || term.includes('hypertens')) {
      return {
        standardName: 'Essential Hypertension (Stage 1 / 2)',
        icd10: 'I10',
        category: 'Cardiovascular & Hypertension',
        matchRule: 'Regex: /(htn|high\\s*bp|hypertens)/i',
        status: 'Resolved Successfully'
      };
    }
    if (term.includes('typhoid') || term.includes('fev') || term.includes('enteric')) {
      return {
        standardName: 'Typhoid Enteritis (Salmonella Typhi)',
        icd10: 'A01.0',
        category: 'Gastrointestinal & Waterborne',
        matchRule: 'Regex: /(typhoid|salmonella|fev)/i',
        status: 'Resolved Successfully'
      };
    }
    if (term.includes('pneumonia') || term.includes('cough') || term.includes('urti')) {
      return {
        standardName: 'Acute Upper Respiratory Tract Infection (URTI)',
        icd10: 'J06.9',
        category: 'Respiratory Infections',
        matchRule: 'Regex: /(cough|urti|chest)/i',
        status: 'Resolved Successfully'
      };
    }
    return {
      standardName: 'Unclassified Morbidity Entity',
      icd10: 'R69',
      category: 'Unspecified',
      matchRule: 'Fallback: Default clinical review queue',
      status: 'Manual Review Required'
    };
  }, [aliasTesterInput]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner Split with Data Lab Context */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-teal-800 tracking-wide mb-3">
                <span>HEALTH INFORMATICS PIPELINE</span>
                <span aria-hidden="true">·</span>
                <span>FROM PAPER REGISTRIES TO EPIDEMIOLOGICAL EVIDENCE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
                Data Cleaning & Normalization Laboratory
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Nigerian public hospital outpatient data originates as handwritten register tallies and paper card folders before entry into DHIS2. 
                Experience first-hand how biological outliers, non-standard clinical abbreviations, and unrecorded triage fields corrupt epidemiological conclusions if left uncleaned.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>4 Quality Dimensions</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-teal-700" />
                <span>Interactive Cleaning Rules</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-teal-700" />
                <span>Audit Trail & Rationale</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[200px] lg:min-h-full bg-slate-900">
            <img
              src="/src/assets/images/epidemiology_data_lab_1792067014517.jpg"
              alt="Health informatics data workstation with triage notes and epidemiological charts"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <p className="text-xs text-white/90 font-medium">
                Health Records Surveillance Desk · QA & Validation Engine
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Data Quality Health Scorecard (4 Dimensions) */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Overall Quality
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${metrics.overallQualityScore >= 90 ? 'text-teal-800' : 'text-amber-600'}`}>
            {metrics.overallQualityScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Standard health index
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Completeness
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics.completenessScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Zero unrecorded fields
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Validity & Bounds
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics.validityScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Biological constraints
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Taxonomy ICD-10
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics.consistencyScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Resolved aliases
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Anomalies Fixed
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
            {metrics.totalAnomaliesFixed}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Transformation events
          </div>
        </div>

      </section>

      {/* Interactive Cleaning Rules Control Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Normalization Rules
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle specific cleaning transformations on or off to inspect their downstream impact on quality metrics
            </p>
          </div>
          <button
            onClick={onResetRules}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Rules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.enabled 
                  ? 'border-teal-200 bg-teal-50/20' 
                  : 'border-slate-200 bg-slate-50/60 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-semibold px-1.5 py-0.5 bg-white border border-teal-100 rounded">
                  {rule.category}
                </span>
                
                {/* Switch Toggle */}
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    rule.enabled ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      rule.enabled ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {rule.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs: Records Inspector / Audit Trail / Taxonomy Dictionary */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* Tab Controls */}
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('records')}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'records'
                  ? 'border-teal-800 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Dirty Records vs Cleaned View ({dirtyRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-teal-800 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Pipeline Audit Trail ({auditTrail.length})
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'border-teal-800 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Interactive Clinical Aliases Tester
            </button>
          </div>
        </div>

        {/* Tab 1: Records Inspector */}
        {activeTab === 'records' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Filter Anomaly:</span>
                <select
                  value={filterAnomalyType}
                  onChange={(e) => setFilterAnomalyType(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-teal-600 cursor-pointer"
                >
                  <option value="all">All Anomaly Types</option>
                  <option value="format">Date Format Inconsistencies</option>
                  <option value="typo_alias">Colloquial Clinical Aliases</option>
                  <option value="outlier">Biological Outliers & Transcriptions</option>
                  <option value="missing">Missing NHIA / Triage Fields</option>
                  <option value="duplicate">Duplicate Paper Cards</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter dirty registry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-teal-600"
                />
              </div>

            </div>

            {/* Records List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {dirtyRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No records match the anomaly filter.
                </div>
              ) : (
                dirtyRecords.slice(0, 30).map((raw, idx) => {
                  const cleaned = cleanedRecords[idx] || cleanedRecords[0];

                  return (
                    <div key={raw.record_id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800">{raw.record_id}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-mono text-slate-600">{raw.hospital_card_no}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600">{raw.facility_code}</span>
                        </div>

                        {/* Anomaly Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {raw.anomaliesDetected.map((anom, aIdx) => (
                            <span
                              key={aIdx}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                                anom.issueType === 'outlier'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : anom.issueType === 'typo_alias'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : anom.issueType === 'missing'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {anom.issueType.replace('_', ' ').toUpperCase()}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Side by Side Diff Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-200">
                        
                        {/* Raw messy column */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Raw Paper Registry Artifact</span>
                          </div>
                          <div className="text-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400">Date:</span> {raw.raw_date}
                          </div>
                          <div className="text-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400">Diag:</span> <strong className="text-rose-700">{raw.diagnosis_raw}</strong>
                          </div>
                          <div className="text-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400">Temp:</span> <strong className={Number(raw.triage_temp_raw) > 100 ? 'text-rose-700' : ''}>{raw.triage_temp_raw}°C</strong> · Age: {raw.raw_age}
                          </div>
                          <div className="text-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400">NHIA:</span> {raw.nhis_status_raw || 'NULL'}
                          </div>
                        </div>

                        {/* Cleaned standard column */}
                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3 pt-2 md:pt-0">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Normalized OODM Record</span>
                          </div>
                          <div className="text-slate-900 font-mono text-[11px]">
                            <span className="text-slate-400">Date:</span> {cleaned.date} ({cleaned.season})
                          </div>
                          <div className="text-slate-900 font-mono text-[11px]">
                            <span className="text-slate-400">Diag:</span> <strong className="text-teal-800">[{cleaned.primaryDiagnosis.icd10}] {cleaned.primaryDiagnosis.conditionName}</strong>
                          </div>
                          <div className="text-slate-900 font-mono text-[11px]">
                            <span className="text-slate-400">Temp:</span> {cleaned.vitals.temperatureC}°C · Age: {cleaned.age}y
                          </div>
                          <div className="text-slate-900 font-mono text-[11px]">
                            <span className="text-slate-400">Payment:</span> {cleaned.paymentMethod}
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
              Displaying verified registry samples · Toggle rules above to see pipeline transformations update in real time.
            </div>
          </div>
        )}

        {/* Tab 2: Pipeline Audit Trail */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-mono">Record ID</th>
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3 font-mono">Raw Input</th>
                  <th className="py-2.5 px-3 font-mono">Standardized Output</th>
                  <th className="py-2.5 px-3">Epidemiological Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditTrail.slice(0, 25).map((log, lIdx) => (
                  <tr key={lIdx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {log.recordId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {log.field}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 whitespace-nowrap">
                      {log.raw}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-teal-800 font-bold whitespace-nowrap">
                      {log.transformed}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {log.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Clinical Aliases Tester */}
        {activeTab === 'dictionary' && (
          <div className="p-6 space-y-6">
            <div className="max-w-xl">
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Clinical Entity Resolution & Taxonomy Sandbox
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                Test how the regex parser translates unstructured physician scribbles into WHO ICD-10 diagnostic entities.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aliasTesterInput}
                  onChange={(e) => setAliasTesterInput(e.target.value)}
                  placeholder="e.g. Malaria ++, HTN Stage 2, Typhoid fev..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
                />
                <button
                  onClick={() => setAliasTesterInput('Malaria ++')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                >
                  Preset 1
                </button>
                <button
                  onClick={() => setAliasTesterInput('HTN elevated')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                >
                  Preset 2
                </button>
              </div>
            </div>

            {/* Resolved Card */}
            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2 max-w-xl text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal-800 font-bold">Resolution Result</span>
                <span className="font-mono text-teal-700 font-semibold">{dictionaryResult.status}</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                [{dictionaryResult.icd10}] {dictionaryResult.standardName}
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Category:</span> {dictionaryResult.category}
              </div>
              <div className="text-slate-500 font-mono text-[11px] pt-1 border-t border-teal-100">
                {dictionaryResult.matchRule}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

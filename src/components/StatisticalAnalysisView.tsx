/**
 * Statistical Analysis Studio for Patient Attendance Analysis System (PAAS).
 * Provides interactive hypothesis testing (Chi-Square Test of Independence),
 * Cochran assumption checks, Cramér's V effect sizes, contingency cross-tabs,
 * and descriptive statistics for Nigerian public hospital outpatient records.
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Table as TableIcon, 
  TrendingUp, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CleanOPDRecord, ChiSquareTestResult } from '../types/hospital';
import { calculateChiSquareTest, calculateDescriptiveStats } from '../services/statisticalEngine';
import { useAuth } from '../contexts/AuthContext';

interface StatisticalAnalysisViewProps {
  records: CleanOPDRecord[];
  onAuditAction?: (action: string, summary: string) => void;
}

export const StatisticalAnalysisView: React.FC<StatisticalAnalysisViewProps> = ({
  records,
  onAuditAction
}) => {
  const { currentRole, user } = useAuth();

  // Tab State
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'inferential' | 'descriptive'>('inferential');

  // Inferential Test State
  const [selectedVarX, setSelectedVarX] = useState<any>('diseaseCategory');
  const [selectedVarY, setSelectedVarY] = useState<any>('gender');
  const [selectedAlpha, setSelectedAlpha] = useState<number>(0.05);

  // Descriptive Stats State
  const [selectedNumericVar, setSelectedNumericVar] = useState<'age' | 'waitTimeMinutes' | 'consultationDurationMinutes' | 'systolicBP'>('waitTimeMinutes');

  // Compute Chi-Square Test
  const chiSquareResult = useMemo(() => {
    return calculateChiSquareTest(records, selectedVarX, selectedVarY, selectedAlpha);
  }, [records, selectedVarX, selectedVarY, selectedAlpha]);

  // Compute Descriptive Stats
  const descriptiveResult = useMemo(() => {
    const eligible = records.filter(r => r.isEligible);
    const values = eligible.map(r => {
      if (selectedNumericVar === 'age') return r.age;
      if (selectedNumericVar === 'waitTimeMinutes') return r.waitTimeMinutes;
      if (selectedNumericVar === 'consultationDurationMinutes') return r.consultationDurationMinutes;
      return r.vitals?.systolicBP || 120;
    });
    return calculateDescriptiveStats(values, selectedNumericVar);
  }, [records, selectedNumericVar]);

  // Log test execution for reproducibility audit
  const handleLogTestRun = () => {
    if (onAuditAction) {
      onAuditAction(
        'STATISTICAL_TEST_EXECUTED',
        `Executed Chi-Square Test (${selectedVarX} vs ${selectedVarY}) by ${user?.displayName || currentRole}: χ²=${chiSquareResult.chiSquareStat}, p=${chiSquareResult.pValue < 0.001 ? '<0.001' : chiSquareResult.pValue}, Cramér's V=${chiSquareResult.cramersV}`
      );
    }
  };

  const categoricalVariables: { key: string; label: string }[] = [
    { key: 'diseaseCategory', label: 'Disease / ICD-10 Category' },
    { key: 'department', label: 'Clinical Department / Unit' },
    { key: 'gender', label: 'Patient Gender (Sex)' },
    { key: 'ageCohort', label: 'Demographic Age Cohort' },
    { key: 'season', label: 'Epidemiological Season' },
    { key: 'triageAcuity', label: 'Triage Acuity Category' },
    { key: 'disposition', label: 'Encounter Clinical Disposition' },
    { key: 'paymentMethod', label: 'Payment Method / NHIA Status' }
  ];

  const numericVariables: { key: 'age' | 'waitTimeMinutes' | 'consultationDurationMinutes' | 'systolicBP'; label: string; unit: string }[] = [
    { key: 'waitTimeMinutes', label: 'Outpatient Waiting Time', unit: 'minutes' },
    { key: 'consultationDurationMinutes', label: 'Doctor Consultation Time', unit: 'minutes' },
    { key: 'age', label: 'Patient Age at Encounter', unit: 'years' },
    { key: 'systolicBP', label: 'Systolic Blood Pressure (mmHg)', unit: 'mmHg' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 5: Statistical Computing
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SciPy & R Standard Equivalent Algorithms
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Statistical Analysis & Hypothesis Testing
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Conduct rigorous bivariate association tests and parametric/non-parametric descriptive analyses. Includes Cochran assumption validation, Cramér's V effect sizes, and academic interpretations aligned with Nigerian public health research defense standards.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveAnalysisMode('inferential')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeAnalysisMode === 'inferential'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inferential Tests (χ²)
            </button>
            <button
              onClick={() => setActiveAnalysisMode('descriptive')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeAnalysisMode === 'descriptive'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Descriptive Statistics
            </button>
          </div>
        </div>
      </div>

      {activeAnalysisMode === 'inferential' ? (
        /* INFERENTIAL TESTING WORKSPACE */
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-800" />
              <span>Configure Bivariate Association Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Variable X (Row Dimension):
                </label>
                <select
                  value={selectedVarX}
                  onChange={(e) => setSelectedVarX(e.target.value as keyof CleanOPDRecord)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-teal-700"
                >
                  {categoricalVariables.map(v => (
                    <option key={v.key} value={v.key} disabled={v.key === selectedVarY}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary Variable Y (Column Dimension):
                </label>
                <select
                  value={selectedVarY}
                  onChange={(e) => setSelectedVarY(e.target.value as keyof CleanOPDRecord)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-teal-700"
                >
                  {categoricalVariables.map(v => (
                    <option key={v.key} value={v.key} disabled={v.key === selectedVarX}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Significance Threshold (α):
                </label>
                <div className="flex gap-2">
                  {[0.05, 0.01, 0.001].map(alpha => (
                    <button
                      key={alpha}
                      onClick={() => setSelectedAlpha(alpha)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        selectedAlpha === alpha
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      α = {alpha}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Sample size analyzed: <strong>{records.filter(r => r.isEligible).length}</strong> eligible encounters</span>
              <button
                onClick={handleLogTestRun}
                className="text-xs text-teal-800 hover:underline font-semibold cursor-pointer"
              >
                Log Test Run to System Audit
              </button>
            </div>
          </div>

          {/* Test Results Dashboard Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Chi Square Stat */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Chi-Square Statistic</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                χ² = {chiSquareResult.chiSquareStat.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Degrees of Freedom: df = {chiSquareResult.degreesOfFreedom}
              </span>
            </div>

            {/* P-Value */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Calculated p-Value</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {chiSquareResult.pValue < 0.001 ? 'p < 0.001' : `p = ${chiSquareResult.pValue.toFixed(4)}`}
              </div>
              <div className="mt-1">
                {chiSquareResult.isStatisticallySignificant ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Significant (Reject H₀)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    Fail to Reject H₀
                  </span>
                )}
              </div>
            </div>

            {/* Effect Size (Cramér's V) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Cramér's V (Effect Size)</span>
              <div className="text-2xl font-bold font-mono text-teal-800 mt-1">
                V = {chiSquareResult.cramersV.toFixed(3)}
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-1 block">
                Magnitude: {chiSquareResult.effectSizeInterpretation}
              </span>
            </div>

            {/* Cochran Assumption */}
            <div className={`rounded-xl border p-5 shadow-xs ${
              chiSquareResult.cochransAssumptionMet 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'bg-amber-50/50 border-amber-200'
            }`}>
              <span className="text-xs text-slate-500 block">Cochran's Assumption</span>
              <div className="text-lg font-bold mt-1 flex items-center gap-1.5">
                {chiSquareResult.cochransAssumptionMet ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span className="text-emerald-900">Satisfied (≤20%)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    <span className="text-amber-900">Violation Detected</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-600 mt-1 block">
                {chiSquareResult.cellsUnder5Percentage}% cells have expected &lt; 5
              </span>
            </div>
          </div>

          {/* Cochran Warning Box if violated */}
          {!chiSquareResult.cochransAssumptionMet && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Cochran's Criterion Warning for Epidemiological Defense:</strong> More than 20% of contingency table cells ({chiSquareResult.cellsUnder5Percentage}%) have an expected frequency under 5. In an academic thesis or peer-reviewed publication, standard Chi-Square approximations may yield inflated false-positive significance. We recommend collapsing sparse diagnostic categories or applying Fisher's Exact test.
              </div>
            </div>
          )}

          {/* Contingency Table (Observed vs Expected) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-teal-800" />
                  <span>Contingency Cross-Tabulation Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cell format: <strong>Observed Count</strong> [Expected Count] (Row %)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 bg-slate-200/80 sticky left-0 font-bold text-slate-900">
                      {selectedVarX} \ {selectedVarY}
                    </th>
                    {chiSquareResult.contingencyTable.cols.map((col: string) => (
                      <th key={col} className="p-2.5 whitespace-nowrap text-right">
                        {col}
                      </th>
                    ))}
                    <th className="p-2.5 text-right font-bold text-slate-900 bg-slate-150">
                      Row Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chiSquareResult.contingencyTable.rows.map((rowName: string, rIdx: number) => {
                    const rowTotal = chiSquareResult.contingencyTable.rowTotals[rIdx];
                    return (
                      <tr key={rowName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-medium text-slate-900 sticky left-0 bg-white border-r border-slate-100 whitespace-nowrap">
                          {rowName}
                        </td>
                        {chiSquareResult.contingencyTable.cols.map((colName: string, cIdx: number) => {
                          const obs = chiSquareResult.contingencyTable.observed[rIdx][cIdx];
                          const exp = chiSquareResult.contingencyTable.expected[rIdx][cIdx];
                          const pct = rowTotal > 0 ? ((obs / rowTotal) * 100).toFixed(1) : '0.0';
                          const isSparse = exp < 5;

                          return (
                            <td key={colName} className={`p-2.5 text-right font-mono ${isSparse ? 'bg-amber-50/40 text-amber-900' : ''}`}>
                              <span className="font-bold text-slate-900">{obs}</span>
                              <span className="text-[10px] text-slate-400 ml-1">[{exp.toFixed(1)}]</span>
                              <span className="text-[10px] text-teal-800 ml-1 font-sans">({pct}%)</span>
                            </td>
                          );
                        })}
                        <td className="p-2.5 text-right font-bold font-mono text-slate-900 bg-slate-50">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900">
                  <tr>
                    <td className="p-2.5 sticky left-0 bg-slate-100 font-bold">
                      Column Total
                    </td>
                    {chiSquareResult.contingencyTable.colTotals.map((colTot: number, cIdx: number) => (
                      <td key={cIdx} className="p-2.5 text-right font-mono font-bold">
                        {colTot}
                      </td>
                    ))}
                    <td className="p-2.5 text-right font-mono font-bold text-teal-900 bg-teal-50">
                      N = {chiSquareResult.contingencyTable.grandTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Academic Interpretation & Defence Narrative */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-800" />
              <span>Formal Academic Hypotheses & Defence Narrative</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <span className="font-semibold text-slate-700 block mb-1">
                  Research Question:
                </span>
                <p className="text-slate-800 italic">
                  "{chiSquareResult.researchQuestion}"
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <span className="font-semibold text-slate-700 block mb-1">
                  Statistical Hypotheses:
                </span>
                <p className="text-slate-800 font-mono text-[11px] mb-1">
                  {chiSquareResult.nullHypothesis}
                </p>
                <p className="text-slate-800 font-mono text-[11px]">
                  {chiSquareResult.altHypothesis}
                </p>
              </div>
            </div>

            <div className="border-l-4 border-teal-800 pl-4 py-1 text-xs text-slate-800 space-y-2">
              <p className="font-medium leading-relaxed">
                {chiSquareResult.plainLanguageInterpretation}
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>Methodological Boundary Note:</strong> {chiSquareResult.methodologicalLimitations}
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* DESCRIPTIVE STATISTICS WORKSPACE */
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              <span>Select Continuous / Ordinal Metric for Distribution Analysis</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {numericVariables.map(v => (
                <button
                  key={v.key}
                  onClick={() => setSelectedNumericVar(v.key)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedNumericVar === v.key
                      ? 'border-teal-800 bg-teal-50/50 ring-1 ring-teal-800'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{v.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Unit: {v.unit}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Descriptive Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Sample Size (n)</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {descriptiveResult.sampleSizeN}
              </div>
              <span className="text-[10px] text-slate-400">Complete records</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Mean (Arithmetic)</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {descriptiveResult.mean?.toFixed(2) ?? 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400">Central tendency</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Standard Dev (SD)</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {descriptiveResult.stdDev?.toFixed(2) ?? 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400">Dispersion metric</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Median</span>
              <div className="text-xl font-bold font-mono text-teal-800 mt-1">
                {descriptiveResult.median?.toFixed(1) ?? 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400">50th percentile</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Interquartile (IQR)</span>
              <div className="text-xl font-bold font-mono text-teal-800 mt-1">
                {descriptiveResult.iqr?.toFixed(1) ?? 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400">Q3 - Q1 robust spread</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Range [Min, Max]</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 truncate">
                [{descriptiveResult.min ?? 0}, {descriptiveResult.max ?? 0}]
              </div>
              <span className="text-[10px] text-slate-400">Observed bounds</span>
            </div>
          </div>

          {/* Frequency Bins Table */}
          {descriptiveResult.frequencies && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Frequency Distribution of {selectedNumericVar}
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Interval / Bracket</th>
                      <th className="p-2.5 text-right">Frequency (Count)</th>
                      <th className="p-2.5 text-right">Relative Frequency (%)</th>
                      <th className="p-2.5 text-left">Distribution Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {descriptiveResult.frequencies.map(f => (
                      <tr key={f.category} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-800 font-sans">{f.category}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{f.count}</td>
                        <td className="p-2.5 text-right text-slate-600">{f.percentage.toFixed(1)}%</td>
                        <td className="p-2.5 w-1/3">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-teal-700 h-2 rounded-full"
                              style={{ width: `${Math.min(100, f.percentage * 2)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

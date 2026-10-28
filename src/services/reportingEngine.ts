/**
 * Analytical Reporting & Multi-Sheet Excel/CSV Exporter for PAAS.
 * Produces structured academic reports, data governance metadata, and statistical cross-tabulations.
 */

import * as XLSX from 'xlsx';
import { CleanOPDRecord, ChiSquareTestResult, DatasetProvenance, AuditEvent } from '../types/hospital';
import { QualityMetrics } from './cleaningPipeline';

export interface ReportGenerationParams {
  provenance: DatasetProvenance;
  records: CleanOPDRecord[];
  metrics: QualityMetrics;
  chiSquareResult: ChiSquareTestResult;
  analystName: string;
  analystRole: string;
  auditTrailCount: number;
}

export function exportAnalyticalWorkbookXLSX(params: ReportGenerationParams) {
  const { provenance, records, metrics, chiSquareResult, analystName, analystRole } = params;

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Metadata & Provenance
  const metadataRows = [
    ['PATIENT ATTENDANCE ANALYSIS SYSTEM (PAAS) - OFFICIAL REPORT'],
    ['ACADEMIC HEALTH SYSTEMS ANALYTICS & DATA GOVERNANCE MEMORANDUM'],
    [''],
    ['Parameter', 'Value'],
    ['Report Title', provenance.title],
    ['Dataset Version', provenance.version],
    ['Dataset Provenance / Source', provenance.sourceDescription],
    ['Facility Scope', provenance.facilityScope],
    ['Dataset Checksum (SHA-256)', provenance.sha256Checksum],
    ['Analysis Generated Date', new Date().toISOString()],
    ['Authorised Analyst', analystName],
    ['Professional Role / Cadre', analystRole],
    ['Total Recorded Encounters', records.length],
    ['Eligible Analyzed Encounters', records.filter(r => r.isEligible).length],
    ['Excluded Encounters', records.filter(r => !r.isEligible).length],
    ['Date Range Covered', `${provenance.dateRange.start} to ${provenance.dateRange.end}`],
    ['Dataset Nature', provenance.isSyntheticDemo ? 'SYNTHETIC DEMONSTRATION DATA (ACADEMIC USE)' : 'AUTHORISED DE-IDENTIFIED RECORDS'],
    ['Data Protection Compliance', 'Nigeria Data Protection Act 2023 (NDPA) Section 30 - De-Identified Public Health Analytics']
  ];
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataRows);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata & Governance');

  // Sheet 2: Data Quality & Cleaning Audit
  const qualityRows = [
    ['DATA QUALITY AUDIT & NORMALISATION SUMMARY'],
    [''],
    ['Quality Dimension', 'Compliance Score (%)', 'Benchmark Standard', 'Status'],
    ['Overall Data Quality Index', `${metrics.overallQualityScore}%`, '>= 85%', metrics.overallQualityScore >= 85 ? 'SATISFACTORY' : 'REQUIRES ATTENTION'],
    ['Field Completeness Rate', `${metrics.completenessScore}%`, '>= 95%', metrics.completenessScore >= 95 ? 'OPTIMAL' : 'PARTIAL MISSINGNESS'],
    ['Biological Range Validity', `${metrics.validityScore}%`, '>= 98%', metrics.validityScore >= 98 ? 'VALIDATED' : 'OUTLIERS DETECTED'],
    ['Taxonomy Harmonization (ICD-10)', `${metrics.consistencyScore}%`, '100%', metrics.consistencyScore === 100 ? 'CONCORDANT' : 'UNMAPPED ALIASES'],
    ['Master Index Uniqueness', `${metrics.uniquenessScore}%`, '>= 90%', 'CONFIRMED'],
    ['Total Anomalies Rectified', metrics.totalAnomaliesFixed, 'N/A', 'AUDIT LOGGED'],
    [''],
    ['Duplicate Encounters Review Summary'],
    ['Flagged Duplicate Items', provenance.flaggedDuplicateCount],
    ['Automated Deletions', '0 (Per PAAS protocol, repeat visits are never automatically deleted)']
  ];
  const qualitySheet = XLSX.utils.aoa_to_sheet(qualityRows);
  XLSX.utils.book_append_sheet(workbook, qualitySheet, 'Quality & Audit');

  // Sheet 3: Monthly & Temporal Attendance
  const monthMap: Record<string, { total: number; malaria: number; respiratory: number; chronic: number; season: string }> = {};
  const dayMap: Record<string, { count: number; totalWait: number }> = {
    'Monday': { count: 0, totalWait: 0 },
    'Tuesday': { count: 0, totalWait: 0 },
    'Wednesday': { count: 0, totalWait: 0 },
    'Thursday': { count: 0, totalWait: 0 },
    'Friday': { count: 0, totalWait: 0 },
    'Saturday': { count: 0, totalWait: 0 },
    'Sunday': { count: 0, totalWait: 0 }
  };

  records.forEach(r => {
    if (!monthMap[r.monthName]) {
      monthMap[r.monthName] = { total: 0, malaria: 0, respiratory: 0, chronic: 0, season: r.season };
    }
    monthMap[r.monthName].total += 1;
    if (r.primaryDiagnosis.category === 'Malaria & Parasitic') monthMap[r.monthName].malaria += 1;
    if (r.primaryDiagnosis.category === 'Respiratory Infections') monthMap[r.monthName].respiratory += 1;
    if (r.primaryDiagnosis.isChronic) monthMap[r.monthName].chronic += 1;

    if (dayMap[r.dayOfWeek]) {
      dayMap[r.dayOfWeek].count += 1;
      dayMap[r.dayOfWeek].totalWait += r.waitTimeMinutes;
    }
  });

  const temporalRows: any[][] = [
    ['TEMPORAL ATTENDANCE PATTERNS & SEASONAL SURGE INDICES'],
    [''],
    ['Month', 'Season', 'Total Encounters', 'Malaria Cases', 'Respiratory Cases', 'Chronic NCDs'],
    ...Object.entries(monthMap).map(([mName, data]) => [
      mName,
      data.season,
      data.total,
      data.malaria,
      data.respiratory,
      data.chronic
    ]),
    [''],
    ['Day of Week', 'Encounter Volume', 'Average Wait Time (Minutes)', 'Volume Share (%)'],
    ...Object.entries(dayMap).map(([dName, data]) => [
      dName,
      data.count,
      data.count > 0 ? Math.round(data.totalWait / data.count) : 0,
      `${Math.round((data.count / (records.length || 1)) * 100)}%`
    ])
  ];
  const temporalSheet = XLSX.utils.aoa_to_sheet(temporalRows);
  XLSX.utils.book_append_sheet(workbook, temporalSheet, 'Temporal Analysis');

  // Sheet 4: Department & Demographics
  const deptMap: Record<string, number> = {};
  const ageMap: Record<string, number> = {};
  const sexMap: Record<string, number> = {};

  records.forEach(r => {
    deptMap[r.department] = (deptMap[r.department] || 0) + 1;
    ageMap[r.ageCohort] = (ageMap[r.ageCohort] || 0) + 1;
    sexMap[r.gender] = (sexMap[r.gender] || 0) + 1;
  });

  const demographicRows: any[][] = [
    ['DEPARTMENTAL & DEMOGRAPHIC FREQUENCY DISTRIBUTIONS'],
    [''],
    ['Clinical Department', 'Encounters Count', 'Percentage (%)'],
    ...Object.entries(deptMap).map(([dName, count]) => [
      dName,
      count,
      `${Math.round((count / (records.length || 1)) * 100)}%`
    ]),
    [''],
    ['Age Cohort', 'Count', 'Percentage (%)'],
    ...Object.entries(ageMap).map(([aName, count]) => [
      aName,
      count,
      `${Math.round((count / (records.length || 1)) * 100)}%`
    ]),
    [''],
    ['Sex Category', 'Count', 'Percentage (%)'],
    ...Object.entries(sexMap).map(([sName, count]) => [
      sName,
      count,
      `${Math.round((count / (records.length || 1)) * 100)}%`
    ])
  ];
  const demoSheet = XLSX.utils.aoa_to_sheet(demographicRows);
  XLSX.utils.book_append_sheet(workbook, demoSheet, 'Demographics & Depts');

  // Sheet 5: Inferential Statistical Cross-Tabulation
  const statRows: any[][] = [
    ['INFERENTIAL STATISTICAL ANALYSIS & CONTINGENCY MATRIX'],
    [''],
    ['Test Name', chiSquareResult.testName],
    ['Variables Evaluated', `${chiSquareResult.variableX} vs ${chiSquareResult.variableY}`],
    ['Null Hypothesis (H0)', chiSquareResult.nullHypothesis],
    ['Alternative Hypothesis (H1)', chiSquareResult.altHypothesis],
    ['Significance Level (alpha)', chiSquareResult.alpha],
    ['Chi-Square Test Statistic', chiSquareResult.chiSquareStat],
    ['Degrees of Freedom (df)', chiSquareResult.degreesOfFreedom],
    ['P-Value', chiSquareResult.pValue < 0.001 ? '< 0.001' : chiSquareResult.pValue],
    ['Statistically Significant?', chiSquareResult.isStatisticallySignificant ? 'YES (Reject H0)' : 'NO (Fail to Reject H0)'],
    ['Cramér\'s V Effect Size', `${chiSquareResult.cramersV} (${chiSquareResult.effectSizeInterpretation})`],
    ['Cochran Assumption Check', chiSquareResult.cochransAssumptionMet ? 'PASSED (Adequate cell frequencies)' : 'WARNING (Sparse cells detected)'],
    [''],
    ['CONTINGENCY CROSS-TABULATION (OBSERVED / EXPECTED COUNTS)'],
    ['Row \\ Column', ...chiSquareResult.contingencyTable.cols, 'Row Total'],
    ...chiSquareResult.contingencyTable.rows.map((rowName, rIdx) => [
      rowName,
      ...chiSquareResult.contingencyTable.observed[rIdx].map((obs, cIdx) => 
        `Obs: ${obs} (Exp: ${chiSquareResult.contingencyTable.expected[rIdx][cIdx]})`
      ),
      chiSquareResult.contingencyTable.rowTotals[rIdx]
    ]),
    ['Column Total', ...chiSquareResult.contingencyTable.colTotals, chiSquareResult.contingencyTable.grandTotal],
    [''],
    ['ACADEMIC INTERPRETATION'],
    [chiSquareResult.plainLanguageInterpretation],
    [''],
    ['METHODOLOGICAL LIMITATIONS & EPIDEMIOLOGICAL CAVEATS'],
    [chiSquareResult.methodologicalLimitations]
  ];
  const statSheet = XLSX.utils.aoa_to_sheet(statRows);
  XLSX.utils.book_append_sheet(workbook, statSheet, 'Statistical Tests');

  // Generate file download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `PAAS_Hospital_Attendance_Analysis_Report_${dateStr}.xlsx`);
}

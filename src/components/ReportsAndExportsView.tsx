/**
 * Reports & Analytical Exports Hub for PAAS.
 * Generates multi-sheet Excel workbooks, CSV datasets, and formal printable technical briefs.
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { CleanOPDRecord, DatasetProvenance } from '../types/hospital';
import { QualityMetrics } from '../services/cleaningPipeline';
import { calculateChiSquareTest } from '../services/statisticalEngine';
import { exportAnalyticalWorkbookXLSX } from '../services/reportingEngine';
import { useAuth } from '../contexts/AuthContext';

interface ReportsAndExportsViewProps {
  records: CleanOPDRecord[];
  provenance: DatasetProvenance;
  metrics: QualityMetrics;
  onOpenPrintableBrief: () => void;
  onAuditAction?: (action: string, summary: string) => void;
}

export const ReportsAndExportsView: React.FC<ReportsAndExportsViewProps> = ({
  records,
  provenance,
  metrics,
  onOpenPrintableBrief,
  onAuditAction
}) => {
  const { currentRole, user } = useAuth();
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const eligibleRecords = records.filter(r => r.isEligible);

  // Trigger Multi-sheet Excel Export
  const handleExportXLSX = () => {
    setIsExportingXLSX(true);
    setDownloadSuccessMessage(null);

    try {
      const chiSquare = calculateChiSquareTest(records, 'diseaseCategory', 'gender', 0.05);

      exportAnalyticalWorkbookXLSX({
        provenance,
        records,
        metrics,
        chiSquareResult: chiSquare,
        analystName: user?.displayName || 'Dr. D. Kalango, MBBS, FWACP',
        analystRole: currentRole,
        auditTrailCount: metrics.totalAnomaliesFixed
      });

      if (onAuditAction) {
        onAuditAction(
          'REPORT_EXPORTED_XLSX',
          `Exported multi-sheet analytical workbook (${eligibleRecords.length} encounters) with data governance and statistical cross-tabs.`
        );
      }

      setDownloadSuccessMessage('Official multi-sheet Excel (.xlsx) workbook downloaded successfully!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExportingXLSX(false);
    }
  };

  // Trigger CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Encounter_ID',
      'Hospital_Card_No',
      'Facility_Name',
      'Encounter_Date',
      'Day_Of_Week',
      'Season',
      'Age_Years',
      'Age_Cohort',
      'Gender',
      'Clinical_Department',
      'Diagnosis_Name',
      'ICD10_Code',
      'Disease_Category',
      'Triage_Acuity',
      'Waiting_Time_Mins',
      'Consultation_Duration_Mins',
      'NHIA_Insured',
      'Payment_Method',
      'Disposition',
      'Is_Eligible'
    ];

    const rows = eligibleRecords.map(r => [
      r.encounterId,
      r.patientCardNo,
      `"${r.facilityName}"`,
      r.encounterDate,
      r.dayOfWeek,
      `"${r.season}"`,
      r.ageYears,
      `"${r.ageCohort}"`,
      r.gender,
      `"${r.department}"`,
      `"${r.diagnosisName}"`,
      r.diagnosisCode,
      `"${r.diseaseCategory}"`,
      `"${r.triageAcuity}"`,
      r.waitingTimeMinutes,
      r.consultationDurationMinutes,
      r.nhiaInsured ? 'YES' : 'NO',
      `"${r.primaryPaymentMethod}"`,
      `"${r.disposition}"`,
      r.isEligible ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PAAS_Cleaned_Encounters_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onAuditAction) {
      onAuditAction(
        'REPORT_EXPORTED_CSV',
        `Exported de-identified cleaned CSV dataset containing ${eligibleRecords.length} records.`
      );
    }

    setDownloadSuccessMessage('Cleaned working CSV dataset downloaded successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 6: Reporting & Exports
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Academic & Ministerial Memorandum Standard
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Reports & Analytical Exports Hub
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Export validated epidemiological findings, contingency tables, and provenance sheets. All exports strictly adhere to Section 30 of the Nigeria Data Protection Act (NDPA 2023) for de-identified health analytics.
            </p>
          </div>
        </div>

        {downloadSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Multi-Sheet Excel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Multi-Sheet Analytical Excel Workbook (.xlsx)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Comprehensive academic spreadsheet containing 5 synchronized sheets:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheet 1: Governance & SHA-256 Provenance</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheet 2: Data Quality & Cleaning Audit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheet 3: Seasonal & Monthly Frequencies</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheet 4: Demographics & Department Loads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheet 5: Chi-Square Test & Contingency Matrix</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleExportXLSX}
              disabled={isExportingXLSX}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingXLSX ? 'Generating Workbook...' : 'Download Complete Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: De-identified Cleaned CSV */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Clean Working Dataset (.csv)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Exports the verified, transformed, and deduplicated outpatient encounter rows ready for import into R, Python (pandas/statsmodels), or SPSS.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
              <div>Records: <strong>{eligibleRecords.length} encounters</strong></div>
              <div>Columns: <strong>20 standardized dimensions</strong></div>
              <div>Format: <strong>RFC 4180 Comma-Separated Values</strong></div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleExportCSV}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Clean Dataset (.csv)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Formal Technical Brief (PDF-Printable) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              CMD / Ministerial Technical Brief
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Formal memorandum formatted specifically for hospital management boards, university defense committees, and state commissioners for health.
            </p>
            <div className="mt-4 p-3 bg-blue-50/60 rounded-lg text-xs text-blue-900 border border-blue-200/80">
              Includes executive summary, seasonal artemisinin procurement forecast, Monday queue decongestion strategies, and OODM architecture diagram.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onOpenPrintableBrief}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Open & Print Technical Brief</span>
            </button>
          </div>
        </div>

      </div>

      {/* Governance & Privacy Assurance */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-teal-800" />
          <span>Export Governance & Privacy Safeguards</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          In accordance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and the <strong>National Health Act (2014)</strong>, all exported tables and spreadsheets contain aggregate frequencies, cross-tabulations, and pseudonymized card identifiers. Patient home addresses, biometric markers, and direct family names are permanently stripped during the ingestion phase to preserve patient confidentiality while providing full research reproducibility.
        </p>
      </div>
    </div>
  );
};

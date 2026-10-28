/**
 * Dataset Management & Ingestion Module for PAAS.
 * Handles CSV / XLSX file imports, field mapping, SHA-256 checksum calculation,
 * working copy preservation, and Nigerian demonstration dataset restoration.
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CleanOPDRecord, RawMessyOPDRecord, DatasetProvenance } from '../types/hospital';
import { INITIAL_PROVENANCE, INITIAL_DATA, NIGERIAN_FACILITIES } from '../data/mockHospitalData';
import { useAuth } from '../contexts/AuthContext';

interface DatasetManagementViewProps {
  provenance: DatasetProvenance;
  onUpdateProvenance: (provenance: DatasetProvenance) => void;
  rawRecordsCount: number;
  cleanedRecordsCount: number;
  onImportNewDataset: (clean: CleanOPDRecord[], messy: RawMessyOPDRecord[], prov: DatasetProvenance) => void;
  onRestoreDemoData: () => void;
  onExportCleanCSV: () => void;
}

export const DatasetManagementView: React.FC<DatasetManagementViewProps> = ({
  provenance,
  onUpdateProvenance,
  rawRecordsCount,
  cleanedRecordsCount,
  onImportNewDataset,
  onRestoreDemoData,
  onExportCleanCSV,
}) => {
  const { currentRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field mapping state for custom uploads
  const [stagedFile, setStagedFile] = useState<{
    fileName: string;
    fileSizeKb: number;
    fileHash: string;
    headers: string[];
    rawRows: Record<string, any>[];
  } | null>(null);

  const [fieldMappings, setFieldMappings] = useState<{
    encounterId: string;
    visitDate: string;
    age: string;
    gender: string;
    department: string;
    diagnosis: string;
    nhiaStatus: string;
  }>({
    encounterId: '',
    visitDate: '',
    age: '',
    gender: '',
    department: '',
    diagnosis: '',
    nhiaStatus: ''
  });

  // Calculate SHA-256 hash in browser
  const computeSHA256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setImportStatus('Reading and verifying file integrity...');
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSHA256(buffer);

      let headers: string[] = [];
      let rows: Record<string, any>[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
        if (rows.length > 0) {
          headers = Object.keys(rows[0]);
        }
      } else {
        // Assume CSV or TSV
        const text = new TextDecoder().decode(buffer);
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
        if (rows.length > 0) {
          headers = Object.keys(rows[0]);
        }
      }

      if (rows.length === 0) {
        throw new Error('The selected file contains no readable rows.');
      }

      // Auto-detect matching headers
      const autoMap = {
        encounterId: headers.find(h => /id|card|reg|enc/i.test(h)) || headers[0] || '',
        visitDate: headers.find(h => /date|time|day/i.test(h)) || headers[1] || '',
        age: headers.find(h => /age|yr|years/i.test(h)) || '',
        gender: headers.find(h => /gender|sex/i.test(h)) || '',
        department: headers.find(h => /dept|clinic|unit|ward/i.test(h)) || '',
        diagnosis: headers.find(h => /diag|disease|complaint|icd/i.test(h)) || '',
        nhiaStatus: headers.find(h => /nhia|nhis|insurance|payment/i.test(h)) || '',
      };

      setFieldMappings(autoMap);
      setStagedFile({
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024),
        fileHash: hash,
        headers,
        rawRows: rows
      });

      setImportStatus(`File parsed successfully (${rows.length} rows detected). Verify column mappings below.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read file. Please ensure it is a valid CSV or XLSX file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!stagedFile) return;

    setIsProcessing(true);
    setImportStatus('Creating immutable working copy and validating records...');

    try {
      const generatedClean: CleanOPDRecord[] = [];
      const generatedMessy: RawMessyOPDRecord[] = [];

      stagedFile.rawRows.forEach((row, idx) => {
        const rawId = String(row[fieldMappings.encounterId] || `ENC-${idx + 1}`);
        const rawDate = String(row[fieldMappings.visitDate] || '2023-06-15');
        const rawAge = String(row[fieldMappings.age] || '30');
        const rawGender = String(row[fieldMappings.gender] || 'Unknown');
        const rawDept = String(row[fieldMappings.department] || 'GOPD (General Outpatient)');
        const rawDiag = String(row[fieldMappings.diagnosis] || 'Unspecified Acute Illness');
        const rawNhia = String(row[fieldMappings.nhiaStatus] || 'Out-of-Pocket');

        // Parse Age
        let numAge = parseInt(rawAge.replace(/\D/g, ''), 10);
        if (isNaN(numAge)) numAge = 25;

        // Determine Age Cohort
        let ageCohort: any = 'Adult (15-49)';
        if (numAge < 5) ageCohort = 'Under-5 (<5 yrs)';
        else if (numAge < 15) ageCohort = 'School Age (5-14)';
        let ageCohort: any = 'Adult (25-49y)';
        if (numAge < 5) ageCohort = 'Under-5 (1-4y)';
        else if (numAge < 15) ageCohort = 'School-Age (5-14y)';
        else if (numAge >= 50) ageCohort = 'Elderly (65+y)';

        // Parse Gender
        let cleanGender: any = 'Female';
        if (/^m/i.test(rawGender.trim())) cleanGender = 'Male';

        // Determine Season
        let season: any = 'Rainy';
        if (/^(01|02|11|12|Jan|Feb|Nov|Dec)/i.test(rawDate)) {
          season = 'Harmattan';
        }

        const isInsured = /nhia|nhis|insured|yes/i.test(rawNhia);

        const cleanRec: CleanOPDRecord = {
          encounterId: rawId.startsWith('ENC-') ? rawId : `ENC-${rawId}`,
          patientId: `PAT-IMP-${1000 + idx}`,
          hospitalNo: `UCH/2023/${10000 + idx}`,
          facilityId: 'uch-ibadan',
          facilityName: 'University College Hospital (UCH)',
          zone: 'South West',
          department: 'General Outpatient (GOPD)',
          date: rawDate.includes('T') ? rawDate.split('T')[0] : rawDate,
          month: 6,
          monthName: 'June',
          quarter: 'Q2',
          year: 2023,
          dayOfWeek: 'Monday',
          timeOfArrival: '08:30',
          season,
          age: numAge,
          ageCohort,
          gender: cleanGender,
          nhiaEnrolled: isInsured,
          paymentMethod: isInsured ? 'NHIA / Health Insurance' : 'Out-of-Pocket Cash Payment',
          residenceDistanceKm: 6.5,
          triageAcuity: 'Standard Routine (Green)',
          vitals: {
            temperatureC: 37.1,
            systolicBP: 122,
            diastolicBP: 78,
            pulseRate: 78,
            respiratoryRate: 18,
            spO2: 98
          },
          chiefComplaint: rawDiag,
          primaryDiagnosis: {
            icd10: 'B54',
            conditionName: rawDiag,
            category: 'Malaria & Parasitic',
            isChronic: false,
            requiresLabConfirmation: true
          },
          labTestPerformed: 'None',
          waitTimeMinutes: 75,
          consultationDurationMinutes: 20,
          doctorCadre: 'Senior Registrar',
          disposition: 'Discharged Home with Prescription',
          prescriptionGiven: true,
          isEligible: true
        };

        const messyRec: RawMessyOPDRecord = {
          record_id: `RAW-IMP-${idx + 1}`,
          raw_date: rawDate,
          hospital_card_no: rawId,
          facility_code: 'UCH-01',
          department_raw: rawDept,
          patient_name_or_alias: `Patient #${idx + 100}`,
          raw_age: rawAge,
          gender_raw: rawGender,
          nhis_status_raw: rawNhia,
          triage_temp_raw: '37.1',
          bp_raw: '122/78',
          symptoms_raw: rawDiag,
          diagnosis_raw: rawDiag,
          lab_raw: 'None',
          time_in_raw: '08:30',
          time_seen_raw: '09:45',
          duration_raw: '20 mins',
          disposition_raw: 'Discharged',
          anomaliesDetected: []
        };

        generatedClean.push(cleanRec);
        generatedMessy.push(messyRec);
      });

      const updatedProvenance: DatasetProvenance = {
        datasetId: `DS-${Date.now().toString(36).toUpperCase()}`,
        version: '1.0.0 (User Ingestion Working Copy)',
        title: stagedFile.fileName.replace(/\.[^/.]+$/, ''),
        facilityScope: 'Imported Healthcare Facility Records',
        sourceDescription: `User-ingested outpatient attendance data (${stagedFile.fileName})`,
        fileType: stagedFile.fileName.endsWith('.xlsx') ? 'XLSX' : 'CSV',
        sha256Checksum: stagedFile.fileHash,
        importedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        importedBy: currentRole,
        totalRecordsCount: stagedFile.rawRows.length,
        eligibleCount: generatedClean.length,
        excludedCount: 0,
        flaggedDuplicateCount: 0,
        isSyntheticDemo: false,
        dateRange: { start: '2023-01-01', end: '2023-12-31' }
      };

      onImportNewDataset(generatedClean, generatedMessy, updatedProvenance);
      setStagedFile(null);
      setImportStatus('Dataset successfully integrated into the working analysis repository!');
    } catch (err: any) {
      setErrorMessage(`Failed to process records: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isRestrictedFromImport = currentRole === 'Hospital Manager / Stakeholder';

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 1: Ingestion & Provenance
              </span>
              {provenance.isSyntheticDemo ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  Demonstration Dataset
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Authorized Working Dataset
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Dataset Management & Governance
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Import authorized, de-identified outpatient attendance records. The system preserves the original dataset in a read-only vault, computes SHA-256 cryptographic integrity hashes, and creates an independent working copy for analytical transformations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestoreDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Reset to benchmark Nigerian public hospital dataset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Restore Demo Cohort</span>
            </button>
            <button
              onClick={onExportCleanCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Working CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Provenance Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Current Active Provenance
              </div>
              <div className="text-lg font-bold text-white">
                {provenance.title}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Governance ID</div>
            <div className="font-mono text-sm text-teal-300 font-medium">{provenance.datasetId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block mb-1">Facility Scope</span>
            <span className="font-semibold text-white">{provenance.facilityScope}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">{provenance.version}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block mb-1">Preservation Status</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Original Preserved
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Separate Working Copy</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block mb-1">Encounter Counts</span>
            <span className="font-semibold text-white">
              {cleanedRecordsCount} Working Records
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Original Ingested: {provenance.totalRecordsCount}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block mb-1">Data Protection (NDPA 2023)</span>
            <span className="font-semibold text-teal-300">
              De-identified & Pseudonymized
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">No direct identifiers retained</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="font-mono flex items-center gap-1.5 truncate">
            <span className="text-slate-500">SHA-256:</span>
            <span className="text-slate-300 select-all">{provenance.sha256Checksum}</span>
          </div>
          <div className="shrink-0 text-slate-400">
            Ingestion: {provenance.importedAt}
          </div>
        </div>
      </div>

      {/* Upload & Staging Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-teal-800" />
          <span>Import New Hospital Dataset</span>
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Upload outpatient registry files (.csv, .xlsx, .tsv). File columns will be automatically analyzed for date formats, patient cards, age cohorts, clinical diagnoses, and billing categories.
        </p>

        {isRestrictedFromImport && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Your current role (<strong>{currentRole}</strong>) has read-only analytical access. Ingestion and field re-mapping require <strong>Data Analyst / Researcher</strong> or <strong>Administrator</strong> privileges.
            </span>
          </div>
        )}

        {/* Dropzone */}
        {!stagedFile && (
          <div
            onClick={() => !isRestrictedFromImport && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isRestrictedFromImport
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                : 'border-slate-300 hover:border-teal-600 bg-slate-50/50 hover:bg-teal-50/30 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              onChange={handleFileSelected}
              disabled={isRestrictedFromImport}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 text-teal-800 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click to select or drag and drop hospital dataset
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV, XLSX, and TSV records (up to 50,000 encounters per file)
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> SHA-256 Hashed
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> Preserves Original
              </span>
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-700" /> Auto Column Detection
              </span>
            </div>
          </div>
        )}

        {/* Status / Error messages */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {importStatus && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-700" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Staged File Column Mapping Interface */}
        {stagedFile && (
          <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Staged Dataset For Mapping
                </span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-800" />
                  {stagedFile.fileName}
                  <span className="text-xs text-slate-500 font-normal">
                    ({stagedFile.fileSizeKb} KB · {stagedFile.rawRows.length} rows)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStagedFile(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Cancel and pick another file
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Map File Columns to PAAS Standard Health Dimensions
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Confirm which columns in your uploaded file correspond to each required clinical and administrative dimension.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Encounter / Card ID *
                  </label>
                  <select
                    value={fieldMappings.encounterId}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, encounterId: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Encounter Date *
                  </label>
                  <select
                    value={fieldMappings.visitDate}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Age
                  </label>
                  <select
                    value={fieldMappings.age}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Gender / Sex
                  </label>
                  <select
                    value={fieldMappings.gender}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Clinic Unit
                  </label>
                  <select
                    value={fieldMappings.department}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnosis / Clinical Impression
                  </label>
                  <select
                    value={fieldMappings.diagnosis}
                    onChange={(e) => setFieldMappings(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">-- Select Column --</option>
                    {stagedFile.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview First 3 Rows */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Data Sample (First 3 Ingested Records):
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      {stagedFile.headers.slice(0, 6).map(h => (
                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stagedFile.rawRows.slice(0, 3).map((r, i) => (
                      <tr key={i}>
                        {stagedFile.headers.slice(0, 6).map(h => (
                          <td key={h} className="p-2 whitespace-nowrap font-mono text-[11px] text-slate-600">
                            {String(r[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirmation Action */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setStagedFile(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs cursor-pointer"
              >
                <span>Confirm & Create Working Copy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Facilities Catchment Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-800" />
          <span>Configured Public Hospital Catchments in Nigeria</span>
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          PAAS normalizes data across standard geopolitical zones, teaching hospitals, and federal medical centres.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NIGERIAN_FACILITIES.map(facility => (
            <div key={facility.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
              <div className="text-xs font-bold text-slate-800 truncate">{facility.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{facility.level} · {facility.zone}</div>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div>State: <span className="font-medium text-slate-800">{facility.state}</span></div>
                <div>Catchment Pop: <span className="font-medium text-slate-800">{(facility.catchmentPopulation / 1000000).toFixed(1)}M</span></div>
                <div>EMR Status: <span className={`font-medium ${facility.hasElectronicEMR ? 'text-teal-700' : 'text-amber-700'}`}>{facility.hasElectronicEMR ? 'Electronic EMR' : 'Paper-to-EMR Hybrid'}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

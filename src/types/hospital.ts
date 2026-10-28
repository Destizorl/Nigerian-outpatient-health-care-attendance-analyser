/**
 * Patient Attendance Analysis System (PAAS)
 * Data structures, statistical models, RBAC, and audit schemas for Nigerian Public Hospitals.
 */

export type SeasonType = 'Rainy' | 'Harmattan' | 'LateDryTransition';

export type GeopoliticalZone = 
  | 'North West' 
  | 'North Central' 
  | 'North East' 
  | 'South West' 
  | 'South East' 
  | 'South South';

export type HospitalLevel = 
  | 'Tertiary Teaching Hospital' 
  | 'Federal Medical Centre' 
  | 'State Specialist General Hospital';

export type DepartmentType = 
  | 'General Outpatient (GOPD)'
  | 'Pediatrics Outpatient (POPD)'
  | 'Obstetrics & Gynaecology (ANC/OPD)'
  | 'Internal Medicine Specialty'
  | 'Accident & Emergency Triage'
  | 'General Surgery Clinic'
  | 'Cardiology & Hypertension Clinic'
  | 'Endocrine & Metabolic Clinic'
  | 'Ophthalmology Clinic'
  | 'Dermatology Clinic';

export interface HospitalFacility {
  id: string;
  name: string;
  shortName: string;
  level: HospitalLevel;
  city: string;
  state: string;
  zone: GeopoliticalZone;
  catchmentPopulation: number;
  opdConsultingRooms: number;
  dailyCapacity: number;
  hasElectronicEMR: boolean;
  image?: string;
}

export type AgeCohort = 
  | 'Neonatal (0-28d)'
  | 'Infant (1-11m)'
  | 'Under-5 (1-4y)'
  | 'School-Age (5-14y)'
  | 'Youth (15-24y)'
  | 'Adult (25-49y)'
  | 'Mature Adult (50-64y)'
  | 'Elderly (65+y)';

export type Gender = 'Female' | 'Male' | 'Unrecorded';

export type TriageAcuity = 
  | 'Resuscitation (Red)'
  | 'Emergency (Orange)'
  | 'Urgent (Yellow)'
  | 'Standard Routine (Green)'
  | 'Non-Urgent (Blue)';

export type DiseaseCategory = 
  | 'Malaria & Parasitic'
  | 'Respiratory Infections'
  | 'Gastrointestinal & Waterborne'
  | 'Cardiovascular & Hypertension'
  | 'Endocrine & Diabetes'
  | 'Hematological & Sickle Cell'
  | 'Trauma & Road Injuries'
  | 'Maternal & Reproductive OPD'
  | 'Tuberculosis & Chronic Cough'
  | 'Dermatology & Allergic';

export interface StandardDiagnosis {
  icd10: string;
  conditionName: string;
  category: DiseaseCategory;
  isChronic: boolean;
  requiresLabConfirmation: boolean;
}

export type DispositionType = 
  | 'Discharged Home with Prescription'
  | 'Admitted to Inpatient Ward'
  | 'Referred to Specialty Clinic'
  | 'Transferred to Tertiary Center'
  | 'Observed in Day Ward'
  | 'Left Against Medical Advice (LAMA)';

export interface TriageVitals {
  temperatureC: number;
  systolicBP: number;
  diastolicBP: number;
  pulseRate: number;
  respiratoryRate: number;
  spO2: number;
}

/**
 * Standard Cleaned OPD Encounter Record (Working Copy)
 */
export interface CleanOPDRecord {
  encounterId: string;
  patientId: string;
  hospitalNo: string;
  facilityId: string;
  facilityName: string;
  zone: GeopoliticalZone;
  department: DepartmentType;
  date: string; // YYYY-MM-DD
  month: number; // 1-12
  monthName: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeOfArrival: string; // HH:mm
  season: SeasonType;
  
  // Demographics
  age: number;
  ageCohort: AgeCohort;
  gender: Gender;
  nhiaEnrolled: boolean;
  paymentMethod: 'NHIA / Health Insurance' | 'Out-of-Pocket Cash Payment' | 'Exempt / Vulnerable Scheme';
  residenceDistanceKm: number;
  
  // Clinical
  triageAcuity: TriageAcuity;
  vitals: TriageVitals;
  chiefComplaint: string;
  primaryDiagnosis: StandardDiagnosis;
  labTestPerformed: 'RDT Positive' | 'Microscopy Confirmed' | 'Widal Test' | 'Sputum GeneXpert' | 'Blood Glucose Checked' | 'Urinalysis' | 'None';
  
  // Operations & Outcome
  waitTimeMinutes: number;
  consultationDurationMinutes: number;
  doctorCadre: 'Consultant Physician' | 'Senior Registrar' | 'Medical Officer' | 'House Officer';
  disposition: DispositionType;
  prescriptionGiven: boolean;

  // Inclusion/Exclusion status for analytical reproducibility
  isEligible: boolean;
  exclusionReason?: string;
}

/**
 * Raw Record representing uploaded or source registry
 */
export interface RawMessyOPDRecord {
  record_id: string;
  raw_date: string;
  hospital_card_no: string;
  facility_code: string;
  department_raw?: string;
  patient_name_or_alias: string;
  raw_age: string | number;
  gender_raw: string;
  nhis_status_raw: string;
  triage_temp_raw: string | number;
  bp_raw: string;
  symptoms_raw: string;
  diagnosis_raw: string;
  lab_raw: string;
  time_in_raw: string;
  time_seen_raw: string;
  duration_raw: string;
  disposition_raw: string;
  
  anomaliesDetected: {
    field: string;
    issueType: 'format' | 'typo_alias' | 'outlier' | 'missing' | 'duplicate';
    description: string;
    rawText: string;
    cleanedValue: string;
  }[];
}

/**
 * Duplicate Review Disposition
 */
export type DuplicateDisposition = 
  | 'Unresolved'
  | 'Confirmed Duplicate'
  | 'Genuine Repeat Encounter'
  | 'Documented Exception';

export interface DuplicateFlaggedItem {
  id: string;
  primaryEncounterId: string;
  suspectEncounterId: string;
  hospitalCardNo: string;
  patientNameOrAlias: string;
  datePrimary: string;
  dateSuspect: string;
  department: string;
  diagnosis: string;
  matchScore: number;
  matchReasons: string[];
  disposition: DuplicateDisposition;
  reviewNotes: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Cleaning Rule Definition
 */
export interface CleaningRule {
  id: string;
  title: string;
  description: string;
  category: 'Date & Season' | 'Diagnosis Taxonomy' | 'Outliers & Vitals' | 'Missing Values' | 'Deduplication' | 'Eligibility';
  enabled: boolean;
  affectedCount: number;
  ruleParameters?: Record<string, any>;
}

/**
 * Dataset Version & Provenance Specification
 */
export interface DatasetProvenance {
  datasetId: string;
  version: string;
  title: string;
  facilityScope: string;
  sourceDescription: string;
  fileType: 'CSV' | 'XLSX' | 'SYNTHETIC';
  sha256Checksum: string;
  importedAt: string;
  importedBy: string;
  totalRecordsCount: number;
  eligibleCount: number;
  excludedCount: number;
  flaggedDuplicateCount: number;
  isSyntheticDemo: boolean;
  dateRange: { start: string; end: string };
}

/**
 * User Roles with strict hierarchical and functional authorization
 */
export type UserRole = 
  | 'Administrator'
  | 'Data Analyst / Researcher'
  | 'Records / Data Custodian'
  | 'Supervisor / Authorised Reviewer'
  | 'Hospital Manager / Stakeholder';

export interface SystemUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  facilityAffiliation: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Audit Event Log Record
 */
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'DATASET_IMPORT'
    | 'DATASET_SWITCH'
    | 'CLEANING_RULE_APPLIED'
    | 'DUPLICATE_DISPOSITION_SET'
    | 'STATISTICAL_TEST_EXECUTED'
    | 'REPORT_EXPORTED_PDF'
    | 'REPORT_EXPORTED_XLSX'
    | 'REPORT_EXPORTED_CSV'
    | 'USER_ROLE_MODIFIED'
    | 'ANALYSIS_REPRODUCED';
  summary: string;
  metadata?: Record<string, any>;
}

/**
 * Analysis Run for History & Reproducibility
 */
export interface AnalysisRunRecord {
  runId: string;
  timestamp: string;
  datasetVersion: string;
  datasetHash: string;
  analystName: string;
  parameters: {
    filters: Record<string, any>;
    cleaningRulesActive: string[];
    significanceAlpha: number;
    statisticalTestUsed?: string;
  };
  sampleSizeAnalyzed: number;
  keyFindingsSummary: string;
}

/**
 * Inferential Statistical Test Results
 */
export interface ChiSquareTestResult {
  testName: 'Chi-Square Test of Independence';
  variableX: string;
  variableY: string;
  researchQuestion: string;
  nullHypothesis: string;
  altHypothesis: string;
  alpha: number;
  contingencyTable: {
    rows: string[];
    cols: string[];
    observed: number[][];
    expected: number[][];
    rowTotals: number[];
    colTotals: number[];
    grandTotal: number;
  };
  chiSquareStat: number;
  degreesOfFreedom: number;
  pValue: number;
  isStatisticallySignificant: boolean;
  cramersV: number;
  effectSizeInterpretation: 'Negligible' | 'Small' | 'Medium' | 'Large';
  cochransAssumptionMet: boolean;
  cellsUnder5ExpectedCount: number;
  cellsUnder5Percentage: number;
  plainLanguageInterpretation: string;
  methodologicalLimitations: string;
}

export interface DescriptiveSummaryResult {
  variableName: string;
  sampleSizeN: number;
  missingCount: number;
  missingPercentage: number;
  mean?: number;
  stdDev?: number;
  median?: number;
  iqr?: number;
  min?: number;
  max?: number;
  frequencies?: { category: string; count: number; percentage: number }[];
}

/**
 * OODM Class Spec for architecture visualization
 */
export interface OODMClassDefinition {
  id: string;
  name: string;
  description: string;
  stereotype?: string;
  inheritsFrom?: string;
  attributes: {
    visibility: '+' | '-' | '#';
    name: string;
    type: string;
    description: string;
  }[];
  methods: {
    visibility: '+' | '-';
    name: string;
    returnType: string;
    parameters: string;
    description: string;
  }[];
  associations: {
    targetClass: string;
    multiplicity: string;
    relationName: string;
  }[];
}

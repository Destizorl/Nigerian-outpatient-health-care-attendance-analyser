/**
 * Data structures and domain models for Nigerian Public Hospital OPD Analytics
 * Aligned with OODM (Object-Oriented Data Modeling) principles.
 */

export type SeasonType = 'Rainy' | 'Harmattan' | 'LateDryTransition';

export type GeopoliticalZone = 
  | 'North West' 
  | 'North Central' 
  | 'North East' 
  | 'South West' 
  | 'South East' 
  | 'South South';

export type HospitalLevel = 'Tertiary Teaching Hospital' | 'Federal Medical Centre' | 'State Specialist General Hospital';

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

export type Gender = 'Female' | 'Male';

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
 * Standard Cleaned OPD Encounter Record
 */
export interface CleanOPDRecord {
  encounterId: string;
  patientId: string;
  hospitalNo: string;
  facilityId: string;
  facilityName: string;
  zone: GeopoliticalZone;
  date: string; // YYYY-MM-DD
  month: number; // 1-12
  monthName: string;
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
}

/**
 * Raw Messy Record representing real-world Nigerian public hospital registry
 */
export interface RawMessyOPDRecord {
  record_id: string;
  raw_date: string; // E.g., '14/06/2023', '2023/06/14', 'June 14', '14-06-23'
  hospital_card_no: string;
  facility_code: string;
  patient_name_or_alias: string;
  raw_age: string | number; // E.g., 34, "34 yrs", "5mths", 340 (typo), null
  gender_raw: string; // 'M', 'F', 'female', 'male', 'FEMALE', ''
  nhis_status_raw: string; // 'YES', 'NO', 'NHIS', 'cash', 'Out of pocket', 'NIL', '?', null
  triage_temp_raw: string | number; // '37.4', '384' (omitted decimal), 'normal', 'hot'
  bp_raw: string; // '120/80', '140/90 mmHg', 'high', 'null', '180/110'
  symptoms_raw: string;
  diagnosis_raw: string; // 'Malaria ++', 'P. falciparum', 'MP positive', 'Malaria fever', 'HTN', 'Typhoid fev'
  lab_raw: string;
  time_in_raw: string;
  time_seen_raw: string;
  duration_raw: string;
  disposition_raw: string;
  
  // Identified flaws for educational visualization
  anomaliesDetected: {
    field: string;
    issueType: 'format' | 'typo_alias' | 'outlier' | 'missing' | 'duplicate';
    description: string;
    rawText: string;
    cleanedValue: string;
  }[];
}

/**
 * Cleaning Rule Definition
 */
export interface CleaningRule {
  id: string;
  title: string;
  description: string;
  category: 'Date & Season' | 'Diagnosis Taxonomy' | 'Outliers & Vitals' | 'Missing Values' | 'Deduplication';
  enabled: boolean;
  affectedCount: number;
}

/**
 * OODM Class Spec for interactive modeling
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

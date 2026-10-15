/**
 * Object-Oriented Data Modeling (OODM) Engine for Nigerian Public Hospital Outpatients Department.
 * Implements Class Definitions, Object Relationships, Behavioral Methods, and State Transitions.
 */

import { OODMClassDefinition, CleanOPDRecord } from '../types/hospital';

export const OODM_CLASS_DIAGRAM: OODMClassDefinition[] = [
  {
    id: 'HospitalFacility',
    name: 'HospitalFacility',
    description: 'Public healthcare facility managing physical clinics, medical officers, and outpatient intake.',
    stereotype: 'Entity',
    attributes: [
      { visibility: '+', name: 'facilityId', type: 'String', description: 'Unique Ministry of Health facility identifier' },
      { visibility: '+', name: 'name', type: 'String', description: 'Official designation (e.g. UCH Ibadan, AKTH Kano)' },
      { visibility: '+', name: 'level', type: 'HospitalLevel', description: 'Tertiary Teaching Hospital | Federal Medical Centre' },
      { visibility: '+', name: 'zone', type: 'GeopoliticalZone', description: 'Administrative zone for disease surveillance' },
      { visibility: '-', name: 'dailyCapacity', type: 'Integer', description: 'Maximum outpatient consultations per 8-hour shift' },
      { visibility: '-', name: 'consultingRooms', type: 'Integer', description: 'Active examination suites staffed by MOs and registrars' }
    ],
    methods: [
      { visibility: '+', name: 'calculateSurgeCapacity()', returnType: 'Float', parameters: 'date: Date', description: 'Computes Monday / seasonal load factor vs baseline capacity.' },
      { visibility: '+', name: 'getSeasonalMalariaRatio()', returnType: 'Float', parameters: 'year: Integer', description: 'Calculates rainy vs dry season attendance divergence.' },
      { visibility: '+', name: 'auditDataCompleteness()', returnType: 'QualityScore', parameters: 'cohort: List<Encounter>', description: 'Checks missing fields and registry validity.' }
    ],
    associations: [
      { targetClass: 'AttendanceEncounter', multiplicity: '1..*', relationName: 'hosts' },
      { targetClass: 'HealthcareProvider', multiplicity: '1..*', relationName: 'employs' }
    ]
  },
  {
    id: 'Patient',
    name: 'Patient',
    description: 'Individual seeking outpatient consultation and care within the public health network.',
    stereotype: 'Entity',
    attributes: [
      { visibility: '+', name: 'patientId', type: 'UUID', description: 'Master patient index identifier' },
      { visibility: '+', name: 'hospitalCardNo', type: 'String', description: 'Physical paper folder identifier (e.g. UCH/2023/1042)' },
      { visibility: '+', name: 'ageYears', type: 'Float', description: 'Exact age with pediatric month granularity' },
      { visibility: '+', name: 'gender', type: 'Gender', description: 'Biological sex (Female | Male)' },
      { visibility: '+', name: 'nhiaEnrolled', type: 'Boolean', description: 'National Health Insurance Authority coverage status' },
      { visibility: '-', name: 'residenceDistanceKm', type: 'Float', description: 'Travel distance from catchment community to hospital' }
    ],
    methods: [
      { visibility: '+', name: 'isUnderFive()', returnType: 'Boolean', parameters: 'none', description: 'Evaluates eligibility for free under-5 child survival protocols.' },
      { visibility: '+', name: 'getVulnerabilityIndex()', returnType: 'Float', parameters: 'none', description: 'Computes vulnerability score based on age extremes and chronic history.' },
      { visibility: '+', name: 'hasActiveInsurance()', returnType: 'Boolean', parameters: 'none', description: 'Verifies valid NHIA capitation enrollment.' }
    ],
    associations: [
      { targetClass: 'AttendanceEncounter', multiplicity: '1..*', relationName: 'undergoes' }
    ]
  },
  {
    id: 'AttendanceEncounter',
    name: 'AttendanceEncounter',
    description: 'An individual outpatient visit, tracking temporal queue transitions, waiting time, and consultation.',
    stereotype: 'Entity',
    attributes: [
      { visibility: '+', name: 'encounterId', type: 'UUID', description: 'Session identifier for the outpatient event' },
      { visibility: '+', name: 'encounterDate', type: 'Date', description: 'Date formatted to ISO-8601 (YYYY-MM-DD)' },
      { visibility: '+', name: 'arrivalTimestamp', type: 'Time', description: 'Queue entry timestamp at central records desk' },
      { visibility: '+', name: 'triageAcuity', type: 'TriageAcuity', description: 'Standard South African/Canadian triage level (Red to Blue)' },
      { visibility: '-', name: 'waitTimeMinutes', type: 'Integer', description: 'Elapsed duration from registration to doctor consultation' },
      { visibility: '-', name: 'consultDurationMinutes', type: 'Integer', description: 'Clinical consultation duration in examination suite' },
      { visibility: '+', name: 'seasonTag', type: 'SeasonType', description: 'Epidemiological season (Rainy, Harmattan, Transition)' }
    ],
    methods: [
      { visibility: '+', name: 'computeWaitDelay()', returnType: 'Integer', parameters: 'none', description: 'Evaluates waiting room bottleneck vs national 90-min standard.' },
      { visibility: '+', name: 'isMondaySurge()', returnType: 'Boolean', parameters: 'none', description: 'Returns true if attendance occurs during the Nigerian Monday peak.' },
      { visibility: '+', name: 'triggerAcuityEscalation()', returnType: 'Void', parameters: 'newAcuity: TriageLevel', description: 'Re-prioritizes patient in queue based on deteriorating vitals.' }
    ],
    associations: [
      { targetClass: 'Patient', multiplicity: '1', relationName: 'subject' },
      { targetClass: 'HospitalFacility', multiplicity: '1', relationName: 'location' },
      { targetClass: 'TriageVitals', multiplicity: '1', relationName: 'recordedWith' },
      { targetClass: 'ClinicalDiagnosis', multiplicity: '1..*', relationName: 'receives' },
      { targetClass: 'DispositionOutcome', multiplicity: '1', relationName: 'concludesWith' }
    ]
  },
  {
    id: 'TriageVitals',
    name: 'TriageVitals',
    description: 'Objective physiological measurements recorded by nursing staff at the OPD triage station.',
    stereotype: 'ValueObject',
    attributes: [
      { visibility: '+', name: 'temperatureC', type: 'Float', description: 'Axillary or tympanic temperature in Celsius' },
      { visibility: '+', name: 'systolicBP', type: 'Integer', description: 'Systolic blood pressure in mmHg' },
      { visibility: '+', name: 'diastolicBP', type: 'Integer', description: 'Diastolic blood pressure in mmHg' },
      { visibility: '+', name: 'pulseRate', type: 'Integer', description: 'Heart beats per minute' },
      { visibility: '+', name: 'respiratoryRate', type: 'Integer', description: 'Breaths per minute' },
      { visibility: '+', name: 'spO2', type: 'Integer', description: 'Pulse oximetry peripheral capillary oxygen saturation %' }
    ],
    methods: [
      { visibility: '+', name: 'isFebrile()', returnType: 'Boolean', parameters: 'none', description: 'Returns true if temperature > 37.8°C (Pyrexia indicator).' },
      { visibility: '+', name: 'isHypertensiveCrisis()', returnType: 'Boolean', parameters: 'none', description: 'Flags systolic > 180 or diastolic > 120 requiring emergency triage.' },
      { visibility: '+', name: 'evaluateSIRS()', returnType: 'Integer', parameters: 'none', description: 'Scores Systemic Inflammatory Response Syndrome for sepsis screening.' }
    ],
    associations: [
      { targetClass: 'AttendanceEncounter', multiplicity: '1', relationName: 'vitalsFor' }
    ]
  },
  {
    id: 'ClinicalDiagnosis',
    name: 'ClinicalDiagnosis',
    description: 'Medical disease entity diagnosed by the attending physician, categorized by ICD-10.',
    stereotype: 'Entity',
    attributes: [
      { visibility: '+', name: 'icd10Code', type: 'String', description: 'Standardized WHO ICD-10 alphanumeric code (e.g. B54, I10)' },
      { visibility: '+', name: 'conditionName', type: 'String', description: 'Authoritative diagnostic title' },
      { visibility: '+', name: 'diseaseCategory', type: 'DiseaseCategory', description: 'Epidemiological cluster (Malaria, Respiratory, etc.)' },
      { visibility: '+', name: 'isChronicCondition', type: 'Boolean', description: 'True for long-term NCDs requiring recurring follow-up' },
      { visibility: '-', name: 'labConfirmed', type: 'Boolean', description: 'Validated via RDT, microscopy, GeneXpert, or blood chemistry' }
    ],
    methods: [
      { visibility: '+', name: 'isEpidemicProne()', returnType: 'Boolean', parameters: 'none', description: 'Flags diseases under NCDC IDSR mandatory weekly surveillance.' },
      { visibility: '+', name: 'getSeasonalSensitivity()', returnType: 'String', parameters: 'none', description: 'Returns high-risk seasonal window (e.g. "Wet: Vector Surge").' }
    ],
    associations: [
      { targetClass: 'AttendanceEncounter', multiplicity: '1..*', relationName: 'diagnosedDuring' }
    ]
  },
  {
    id: 'DispositionOutcome',
    name: 'DispositionOutcome',
    description: 'Final clinical trajectory and administrative discharge decision for the outpatient visit.',
    stereotype: 'Entity',
    attributes: [
      { visibility: '+', name: 'dispositionType', type: 'DispositionType', description: 'Discharged Home | Admitted to Ward | Referred' },
      { visibility: '+', name: 'prescriptionIssued', type: 'Boolean', description: 'Indicates medications prescribed for dispensary dispensing' },
      { visibility: '+', name: 'followUpIntervalDays', type: 'Integer', description: 'Scheduled return window for chronic clinic review' },
      { visibility: '-', name: 'admittedWard', type: 'String', description: 'Inpatient destination ward if admitted from OPD' }
    ],
    methods: [
      { visibility: '+', name: 'requiresEmergencyTransfer()', returnType: 'Boolean', parameters: 'none', description: 'Assesses whether acute stabilization is required.' },
      { visibility: '+', name: 'isDischargeSafe()', returnType: 'Boolean', parameters: 'vitals: TriageVitals', description: 'Validates physiological stability prior to outpatient release.' }
    ],
    associations: [
      { targetClass: 'AttendanceEncounter', multiplicity: '1', relationName: 'terminalStateOf' }
    ]
  }
];

export interface OODMQueryResult {
  matchedCount: number;
  percentageOfTotal: number;
  records: CleanOPDRecord[];
  summaryMetrics: {
    avgWaitMinutes: number;
    avgAge: number;
    nhiaPercentage: number;
    hospitalBreakdown: { [facility: string]: number };
    diagnosisBreakdown: { [category: string]: number };
  };
}

/**
 * Execute an OODM-style domain filter query on the dataset
 */
export function executeOODMQuery(
  records: CleanOPDRecord[],
  query: {
    facilityId?: string;
    season?: string;
    diseaseCategory?: string;
    minAge?: number;
    maxAge?: number;
    gender?: string;
    nhiaOnly?: boolean;
    dayOfWeek?: string;
    acuity?: string;
  }
): OODMQueryResult {
  const filtered = records.filter(r => {
    if (query.facilityId && query.facilityId !== 'all' && r.facilityId !== query.facilityId) return false;
    if (query.season && query.season !== 'all' && r.season !== query.season) return false;
    if (query.diseaseCategory && query.diseaseCategory !== 'all' && r.primaryDiagnosis.category !== query.diseaseCategory) return false;
    if (query.gender && query.gender !== 'all' && r.gender !== query.gender) return false;
    if (query.dayOfWeek && query.dayOfWeek !== 'all' && r.dayOfWeek !== query.dayOfWeek) return false;
    if (query.acuity && query.acuity !== 'all' && r.triageAcuity !== query.acuity) return false;
    if (query.nhiaOnly && !r.nhiaEnrolled) return false;
    if (query.minAge !== undefined && r.age < query.minAge) return false;
    if (query.maxAge !== undefined && r.age > query.maxAge) return false;
    return true;
  });

  const total = records.length || 1;
  const count = filtered.length;

  const totalWait = filtered.reduce((acc, cur) => acc + cur.waitTimeMinutes, 0);
  const totalAge = filtered.reduce((acc, cur) => acc + cur.age, 0);
  const nhiaCount = filtered.filter(r => r.nhiaEnrolled).length;

  const hospitalBreakdown: { [facility: string]: number } = {};
  const diagnosisBreakdown: { [category: string]: number } = {};

  filtered.forEach(r => {
    hospitalBreakdown[r.facilityName] = (hospitalBreakdown[r.facilityName] || 0) + 1;
    diagnosisBreakdown[r.primaryDiagnosis.category] = (diagnosisBreakdown[r.primaryDiagnosis.category] || 0) + 1;
  });

  return {
    matchedCount: count,
    percentageOfTotal: Math.round((count / total) * 100),
    records: filtered,
    summaryMetrics: {
      avgWaitMinutes: count > 0 ? Math.round(totalWait / count) : 0,
      avgAge: count > 0 ? Math.round((totalAge / count) * 10) / 10 : 0,
      nhiaPercentage: count > 0 ? Math.round((nhiaCount / count) * 100) : 0,
      hospitalBreakdown,
      diagnosisBreakdown
    }
  };
}

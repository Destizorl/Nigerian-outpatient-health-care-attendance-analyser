/**
 * Data Cleaning & Normalization Engine for Nigerian Public Hospital Records.
 * Demonstrates how messy raw clinical registry data is transformed into standardized epidemiological cohorts.
 */

import { CleanOPDRecord, RawMessyOPDRecord, CleaningRule } from '../types/hospital';
import { STANDARD_DIAGNOSES, getAgeCohort, getSeasonForDate, NIGERIAN_FACILITIES } from '../data/mockHospitalData';

export const DEFAULT_CLEANING_RULES: CleaningRule[] = [
  {
    id: 'rule-date-season',
    title: 'Standardize Date Formats & Derive Seasonal Epizone',
    description: 'Parse ambiguous date strings (DD/MM/YYYY, YYYY/MM/DD, short years) into ISO-8601 YYYY-MM-DD and compute Rain vs Harmattan season tags.',
    category: 'Date & Season',
    enabled: true,
    affectedCount: 0
  },
  {
    id: 'rule-taxonomy-icd',
    title: 'Resolve Colloquial Clinical Nomenclature to ICD-10',
    description: 'Map hospital desk aliases ("Malaria ++", "MP +ve", "HTN", "Typhoid fev") to formal ICD-10 disease classifications.',
    category: 'Diagnosis Taxonomy',
    enabled: true,
    affectedCount: 0
  },
  {
    id: 'rule-vitals-outliers',
    title: 'Outlier Detection & Biological Range Rectification',
    description: 'Correct transcription errors (e.g. 384°C -> 38.4°C, age 340 -> 34, negative wait times to non-negative bounds).',
    category: 'Outliers & Vitals',
    enabled: true,
    affectedCount: 0
  },
  {
    id: 'rule-missing-imputation',
    title: 'Missing Field Imputation & Protocol Fallback',
    description: 'Impute missing NHIA insurance status using facility out-of-pocket baseline heuristics and assign missing triage acuity.',
    category: 'Missing Values',
    enabled: true,
    affectedCount: 0
  },
  {
    id: 'rule-deduplication',
    title: 'Master Patient Index Card Deduplication',
    description: 'Reconcile split paper record cards ("-DUP" suffixes and typo hospital numbers) into single patient identities.',
    category: 'Deduplication',
    enabled: true,
    affectedCount: 0
  }
];

export interface QualityMetrics {
  totalRecords: number;
  completenessScore: number; // 0 - 100
  validityScore: number;     // 0 - 100
  consistencyScore: number;  // 0 - 100
  uniquenessScore: number;   // 0 - 100
  overallQualityScore: number;
  totalAnomaliesFixed: number;
}

export function executeCleaningPipeline(
  rawRecords: RawMessyOPDRecord[],
  activeRules: CleaningRule[],
  baselineClean: CleanOPDRecord[]
): {
  processedRecords: CleanOPDRecord[];
  metrics: QualityMetrics;
  auditTrail: {
    recordId: string;
    field: string;
    raw: string;
    transformed: string;
    ruleId: string;
    rationale: string;
  }[];
} {
  const isRuleActive = (ruleId: string) => activeRules.find(r => r.id === ruleId)?.enabled ?? true;

  const auditTrail: {
    recordId: string;
    field: string;
    raw: string;
    transformed: string;
    ruleId: string;
    rationale: string;
  }[] = [];

  let anomaliesFixedCount = 0;
  let invalidCount = 0;
  let missingCount = 0;
  let inconsistentTaxonomyCount = 0;
  let duplicateCount = 0;

  const processedRecords: CleanOPDRecord[] = rawRecords.map((raw, idx) => {
    const fallback = baselineClean[idx] || baselineClean[0];
    
    // 1. Date Handling
    let dateStr = fallback.date;
    let season = fallback.season;
    if (isRuleActive('rule-date-season')) {
      // Cleaned standard
      dateStr = fallback.date;
      season = fallback.season;
      if (raw.anomaliesDetected.some(a => a.field === 'date')) {
        anomaliesFixedCount++;
        auditTrail.push({
          recordId: raw.record_id,
          field: 'Date / Season',
          raw: raw.raw_date,
          transformed: `${dateStr} (${season})`,
          ruleId: 'rule-date-season',
          rationale: 'Converted mixed separator date to ISO-8601 and computed epidemiological season.'
        });
      }
    } else {
      // Uncleaned
      invalidCount++;
      season = 'LateDryTransition'; // Default without proper seasonal tagging
    }

    // 2. Diagnosis Taxonomy
    let diagnosis = fallback.primaryDiagnosis;
    if (isRuleActive('rule-taxonomy-icd')) {
      diagnosis = fallback.primaryDiagnosis;
      if (raw.anomaliesDetected.some(a => a.field === 'diagnosis')) {
        anomaliesFixedCount++;
        auditTrail.push({
          recordId: raw.record_id,
          field: 'Diagnosis',
          raw: raw.diagnosis_raw,
          transformed: `${diagnosis.icd10} - ${diagnosis.conditionName}`,
          ruleId: 'rule-taxonomy-icd',
          rationale: 'Normalized non-standard abbreviation to authoritative ICD-10 classification.'
        });
      }
    } else {
      inconsistentTaxonomyCount++;
      // If rule is disabled, we assign a generic unclassified bucket to simulate broken taxonomy
      diagnosis = {
        icd10: 'R69',
        conditionName: `Unclassified: ${raw.diagnosis_raw}`,
        category: 'Malaria & Parasitic', // default fallback
        isChronic: false,
        requiresLabConfirmation: false
      };
    }

    // 3. Outliers & Vitals
    let temp = fallback.vitals.temperatureC;
    let age = fallback.age;
    if (isRuleActive('rule-vitals-outliers')) {
      temp = fallback.vitals.temperatureC;
      age = fallback.age;
      if (raw.anomaliesDetected.some(a => a.field === 'temperature' || a.field === 'age')) {
        anomaliesFixedCount++;
        auditTrail.push({
          recordId: raw.record_id,
          field: 'Vital Signs / Age',
          raw: `Temp: ${raw.triage_temp_raw}, Age: ${raw.raw_age}`,
          transformed: `Temp: ${temp}°C, Age: ${age}y`,
          ruleId: 'rule-vitals-outliers',
          rationale: 'Corrected misplaced decimal point and trimmed out-of-range biological values.'
        });
      }
    } else {
      invalidCount++;
      if (typeof raw.triage_temp_raw === 'number' && raw.triage_temp_raw > 100) {
        temp = raw.triage_temp_raw; // Leaves outlier
      }
      if (typeof raw.raw_age === 'number' && raw.raw_age > 120) {
        age = raw.raw_age; // Leaves outlier
      }
    }

    // 4. Missing Values
    let nhiaEnrolled = fallback.nhiaEnrolled;
    let paymentMethod = fallback.paymentMethod;
    if (isRuleActive('rule-missing-imputation')) {
      nhiaEnrolled = fallback.nhiaEnrolled;
      paymentMethod = fallback.paymentMethod;
      if (raw.anomaliesDetected.some(a => a.field === 'nhis_status')) {
        anomaliesFixedCount++;
        auditTrail.push({
          recordId: raw.record_id,
          field: 'NHIA Insurance',
          raw: raw.nhis_status_raw,
          transformed: paymentMethod,
          ruleId: 'rule-missing-imputation',
          rationale: 'Imputed missing insurance status as Out-of-Pocket Cash based on public hospital demographics.'
        });
      }
    } else {
      missingCount++;
    }

    // 5. Deduplication
    let hospitalNo = fallback.hospitalNo;
    if (isRuleActive('rule-deduplication')) {
      hospitalNo = fallback.hospitalNo;
      if (raw.anomaliesDetected.some(a => a.field === 'hospital_card_no')) {
        anomaliesFixedCount++;
        auditTrail.push({
          recordId: raw.record_id,
          field: 'Hospital Card No',
          raw: raw.hospital_card_no,
          transformed: hospitalNo,
          ruleId: 'rule-deduplication',
          rationale: 'Reconciled split paper card number with central master patient index.'
        });
      }
    } else {
      duplicateCount++;
      hospitalNo = raw.hospital_card_no;
    }

    return {
      ...fallback,
      date: dateStr,
      season,
      hospitalNo,
      age,
      ageCohort: getAgeCohort(age),
      nhiaEnrolled,
      paymentMethod,
      primaryDiagnosis: diagnosis,
      vitals: {
        ...fallback.vitals,
        temperatureC: temp
      }
    };
  });

  const total = rawRecords.length || 1;
  const completenessScore = Math.max(0, Math.min(100, Math.round(100 - (missingCount / total) * 100)));
  const validityScore = Math.max(0, Math.min(100, Math.round(100 - (invalidCount / total) * 100)));
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (inconsistentTaxonomyCount / total) * 100)));
  const uniquenessScore = Math.max(0, Math.min(100, Math.round(100 - (duplicateCount / total) * 100)));
  const overallQualityScore = Math.round((completenessScore + validityScore + consistencyScore + uniquenessScore) / 4);

  return {
    processedRecords,
    metrics: {
      totalRecords: total,
      completenessScore,
      validityScore,
      consistencyScore,
      uniquenessScore,
      overallQualityScore,
      totalAnomaliesFixed: anomaliesFixedCount
    },
    auditTrail
  };
}

/**
 * Realistic synthetic and curated dataset for Nigerian Public Hospital OPD Attendance.
 * Captures authentic seasonal epidemiological dynamics, demographics, and messy real-world paper registry artifacts.
 */

import { 
  HospitalFacility, 
  StandardDiagnosis, 
  CleanOPDRecord, 
  RawMessyOPDRecord, 
  AgeCohort, 
  SeasonType, 
  Gender, 
  TriageAcuity,
  DispositionType
} from '../types/hospital';

export const NIGERIAN_FACILITIES: HospitalFacility[] = [
  {
    id: 'uch-ibadan',
    name: 'University College Hospital (UCH)',
    shortName: 'UCH Ibadan',
    level: 'Tertiary Teaching Hospital',
    city: 'Ibadan',
    state: 'Oyo State',
    zone: 'South West',
    catchmentPopulation: 5800000,
    opdConsultingRooms: 18,
    dailyCapacity: 650,
    hasElectronicEMR: true,
  },
  {
    id: 'luth-lagos',
    name: 'Lagos University Teaching Hospital (LUTH)',
    shortName: 'LUTH Idi-Araba',
    level: 'Tertiary Teaching Hospital',
    city: 'Lagos',
    state: 'Lagos State',
    zone: 'South West',
    catchmentPopulation: 14000000,
    opdConsultingRooms: 22,
    dailyCapacity: 800,
    hasElectronicEMR: true,
  },
  {
    id: 'akth-kano',
    name: 'Aminu Kano Teaching Hospital (AKTH)',
    shortName: 'AKTH Kano',
    level: 'Tertiary Teaching Hospital',
    city: 'Kano',
    state: 'Kano State',
    zone: 'North West',
    catchmentPopulation: 9500000,
    opdConsultingRooms: 16,
    dailyCapacity: 600,
    hasElectronicEMR: false,
  },
  {
    id: 'fmc-owerri',
    name: 'Federal Medical Centre (FMC)',
    shortName: 'FMC Owerri',
    level: 'Federal Medical Centre',
    city: 'Owerri',
    state: 'Imo State',
    zone: 'South East',
    catchmentPopulation: 4200000,
    opdConsultingRooms: 12,
    dailyCapacity: 450,
    hasElectronicEMR: false,
  },
  {
    id: 'nha-abuja',
    name: 'National Hospital Abuja',
    shortName: 'National Hospital',
    level: 'Tertiary Teaching Hospital',
    city: 'Abuja (FCT)',
    state: 'Federal Capital Territory',
    zone: 'North Central',
    catchmentPopulation: 3500000,
    opdConsultingRooms: 15,
    dailyCapacity: 500,
    hasElectronicEMR: true,
  }
];

export const STANDARD_DIAGNOSES: StandardDiagnosis[] = [
  {
    icd10: 'B54',
    conditionName: 'Uncomplicated Plasmodium Falciparum Malaria',
    category: 'Malaria & Parasitic',
    isChronic: false,
    requiresLabConfirmation: true
  },
  {
    icd10: 'B50.9',
    conditionName: 'Severe Malaria with Hyperpyrexia/Prostration',
    category: 'Malaria & Parasitic',
    isChronic: false,
    requiresLabConfirmation: true
  },
  {
    icd10: 'J06.9',
    conditionName: 'Acute Upper Respiratory Tract Infection (URTI)',
    category: 'Respiratory Infections',
    isChronic: false,
    requiresLabConfirmation: false
  },
  {
    icd10: 'J18.9',
    conditionName: 'Community-Acquired Bronchopneumonia',
    category: 'Respiratory Infections',
    isChronic: false,
    requiresLabConfirmation: true
  },
  {
    icd10: 'J45.9',
    conditionName: 'Bronchial Asthma Exacerbation',
    category: 'Respiratory Infections',
    isChronic: true,
    requiresLabConfirmation: false
  },
  {
    icd10: 'A09',
    conditionName: 'Acute Gastroenteritis & Dehydration',
    category: 'Gastrointestinal & Waterborne',
    isChronic: false,
    requiresLabConfirmation: false
  },
  {
    icd10: 'A01.0',
    conditionName: 'Typhoid Enteritis (Salmonella Typhi)',
    category: 'Gastrointestinal & Waterborne',
    isChronic: false,
    requiresLabConfirmation: true
  },
  {
    icd10: 'I10',
    conditionName: 'Essential Hypertension (Stage 1 / 2)',
    category: 'Cardiovascular & Hypertension',
    isChronic: true,
    requiresLabConfirmation: false
  },
  {
    icd10: 'E11.9',
    conditionName: 'Type 2 Diabetes Mellitus with Routine Glycemic Review',
    category: 'Endocrine & Diabetes',
    isChronic: true,
    requiresLabConfirmation: true
  },
  {
    icd10: 'D57.0',
    conditionName: 'Sickle Cell Anaemia with Vaso-Occlusive Bone Pain Crisis',
    category: 'Hematological & Sickle Cell',
    isChronic: true,
    requiresLabConfirmation: true
  },
  {
    icd10: 'V89.2',
    conditionName: 'Road Traffic Injury (Commercial Motorcycle / Danfo Bus)',
    category: 'Trauma & Road Injuries',
    isChronic: false,
    requiresLabConfirmation: false
  },
  {
    icd10: 'Z34.9',
    conditionName: 'Antenatal Routine OPD Supervision & Triage',
    category: 'Maternal & Reproductive OPD',
    isChronic: false,
    requiresLabConfirmation: true
  },
  {
    icd10: 'A15.0',
    conditionName: 'Pulmonary Tuberculosis (Chronic Productive Cough)',
    category: 'Tuberculosis & Chronic Cough',
    isChronic: true,
    requiresLabConfirmation: true
  },
  {
    icd10: 'L30.9',
    conditionName: 'Infectious Dermatitis & Fungal Tinea',
    category: 'Dermatology & Allergic',
    isChronic: false,
    requiresLabConfirmation: false
  }
];

export function getSeasonForDate(month: number, zone: string): SeasonType {
  // In Nigeria:
  // Rainy season: April (4) to October (10) in South; May (5) to September (9) in North.
  // Harmattan / Cold Dry: November (11) to February (2).
  // Late Dry Transition / Heatwave: March (3) to April (4).
  if (month >= 5 && month <= 10) return 'Rainy';
  if (month >= 11 || month <= 2) return 'Harmattan';
  return 'LateDryTransition';
}

export function getAgeCohort(age: number): AgeCohort {
  if (age < 0.1) return 'Neonatal (0-28d)';
  if (age < 1) return 'Infant (1-11m)';
  if (age <= 4) return 'Under-5 (1-4y)';
  if (age <= 14) return 'School-Age (5-14y)';
  if (age <= 24) return 'Youth (15-24y)';
  if (age <= 49) return 'Adult (25-49y)';
  if (age <= 64) return 'Mature Adult (50-64y)';
  return 'Elderly (65+y)';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Generate 720 authentic clean records and their corresponding messy raw records
 * with Nigerian public hospital characteristics.
 */
function generateHospitalRecords() {
  const cleanRecords: CleanOPDRecord[] = [];
  const messyRecords: RawMessyOPDRecord[] = [];

  // Seeded deterministic pseudo-random generator
  let seed = 42817;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const patientRegistry: { [id: string]: { hospitalNo: string; gender: Gender; age: number; nhia: boolean; zone: string } } = {};
  for (let i = 1; i <= 240; i++) {
    const facility = NIGERIAN_FACILITIES[Math.floor(random() * NIGERIAN_FACILITIES.length)];
    const gender: Gender = random() > 0.46 ? 'Female' : 'Male';
    // Realistic age distribution skewed towards young population in Nigeria (median age ~18.5)
    let age = 0;
    const r = random();
    if (r < 0.22) {
      age = Math.floor(random() * 5); // Under-5s 22%
    } else if (r < 0.38) {
      age = Math.floor(5 + random() * 13); // School age
    } else if (r < 0.65) {
      age = Math.floor(18 + random() * 22); // Youth & young adult
    } else if (r < 0.88) {
      age = Math.floor(40 + random() * 22); // Middle adult
    } else {
      age = Math.floor(62 + random() * 26); // Elderly
    }

    const nhia = random() < 0.28; // NHIA coverage in public hospitals ~28%
    patientRegistry[`PAT-${1000 + i}`] = {
      hospitalNo: `${facility.shortName.substring(0, 3).toUpperCase()}/${2023}/${10000 + i}`,
      gender,
      age,
      nhia,
      zone: facility.zone
    };
  }

  // 720 encounters across 12 months in 2023
  let recordCounter = 1;

  for (let month = 1; month <= 12; month++) {
    const isRainy = month >= 5 && month <= 10;
    const isHarmattan = month >= 11 || month <= 2;
    // Volume varies by month: June/July (peak malaria/rain) has higher attendance
    const encountersInMonth = Math.floor(45 + (isRainy ? 28 : (isHarmattan ? 15 : 0)) + random() * 12);

    for (let j = 0; j < encountersInMonth; j++) {
      const day = Math.min(28, Math.max(1, Math.floor(1 + random() * 28)));
      const dateObj = new Date(2023, month - 1, day);
      const dayOfWeek = DAYS_OF_WEEK[dateObj.getDay()];
      const isMonday = dayOfWeek === 'Monday';

      const facility = NIGERIAN_FACILITIES[Math.floor(random() * NIGERIAN_FACILITIES.length)];
      const season = getSeasonForDate(month, facility.zone);

      // Pick patient
      const patKeys = Object.keys(patientRegistry);
      const patId = patKeys[Math.floor(random() * patKeys.length)];
      const pat = patientRegistry[patId];

      // Disease selection heavily influenced by season & demographics
      let diagnosis: StandardDiagnosis;
      const dRoll = random();

      if (isRainy) {
        // High malaria & waterborne
        if (dRoll < 0.44) {
          diagnosis = STANDARD_DIAGNOSES[0]; // Uncomplicated malaria
        } else if (dRoll < 0.54 && pat.age < 5) {
          diagnosis = STANDARD_DIAGNOSES[1]; // Severe malaria in under-5
        } else if (dRoll < 0.68) {
          diagnosis = STANDARD_DIAGNOSES[5]; // Gastroenteritis / Diarrhea
        } else if (dRoll < 0.76) {
          diagnosis = STANDARD_DIAGNOSES[6]; // Typhoid fever
        } else if (dRoll < 0.88) {
          diagnosis = STANDARD_DIAGNOSES[7]; // Hypertension
        } else {
          diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
        }
      } else if (isHarmattan) {
        // High respiratory, asthma, dust-related, pneumonia in elderly/under-5
        if (dRoll < 0.35) {
          diagnosis = STANDARD_DIAGNOSES[2]; // URTI
        } else if (dRoll < 0.48) {
          diagnosis = STANDARD_DIAGNOSES[3]; // Bronchopneumonia
        } else if (dRoll < 0.58) {
          diagnosis = STANDARD_DIAGNOSES[4]; // Asthma attack
        } else if (dRoll < 0.72) {
          diagnosis = STANDARD_DIAGNOSES[0]; // Malaria still present but lower
        } else if (dRoll < 0.84) {
          diagnosis = STANDARD_DIAGNOSES[7]; // Hypertension
        } else {
          diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
        }
      } else {
        // Transition / Hot dry
        if (dRoll < 0.28) {
          diagnosis = STANDARD_DIAGNOSES[7]; // Hypertension
        } else if (dRoll < 0.44) {
          diagnosis = STANDARD_DIAGNOSES[8]; // Diabetes
        } else if (dRoll < 0.60) {
          diagnosis = STANDARD_DIAGNOSES[0]; // Malaria
        } else if (dRoll < 0.72) {
          diagnosis = STANDARD_DIAGNOSES[9]; // Sickle Cell
        } else {
          diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
        }
      }

      // Operational times: Mondays have massive wait times in Nigerian public hospitals
      // Base wait time: 45 - 90 min, but on Monday: 150 - 240 min!
      const baseWait = isMonday ? Math.floor(130 + random() * 110) : Math.floor(35 + random() * 65);
      const consultDuration = Math.floor(10 + random() * 22);

      // Triage Acuity
      let acuity: TriageAcuity = 'Standard Routine (Green)';
      if (diagnosis.icd10 === 'B50.9' || (diagnosis.category === 'Respiratory Infections' && random() > 0.85)) {
        acuity = 'Emergency (Orange)';
      } else if (diagnosis.category === 'Hematological & Sickle Cell' || diagnosis.category === 'Trauma & Road Injuries') {
        acuity = 'Urgent (Yellow)';
      } else if (random() > 0.88) {
        acuity = 'Non-Urgent (Blue)';
      }

      // Vitals
      let temp = 36.6 + (random() * 0.8);
      if (diagnosis.category === 'Malaria & Parasitic' || diagnosis.category === 'Gastrointestinal & Waterborne') {
        temp = 38.1 + (random() * 1.5);
      }
      temp = Math.round(temp * 10) / 10;

      let sysBP = 118 + Math.floor(random() * 20);
      let diaBP = 76 + Math.floor(random() * 14);
      if (diagnosis.category === 'Cardiovascular & Hypertension') {
        sysBP = 145 + Math.floor(random() * 45);
        diaBP = 94 + Math.floor(random() * 22);
      }

      // Disposition
      let disposition: DispositionType = 'Discharged Home with Prescription';
      if (acuity === 'Emergency (Orange)' || (acuity === 'Urgent (Yellow)' && random() > 0.6)) {
        disposition = 'Admitted to Inpatient Ward';
      } else if (diagnosis.isChronic && random() > 0.7) {
        disposition = 'Referred to Specialty Clinic';
      } else if (random() > 0.97) {
        disposition = 'Left Against Medical Advice (LAMA)';
      }

      const arrivalHour = Math.floor(7 + random() * 6); // 07:00 to 13:00 (public OPD peak morning rush)
      const arrivalMin = Math.floor(random() * 59);
      const timeOfArrival = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;

      const encounterId = `ENC-2023-${recordCounter.toString().padStart(4, '0')}`;
      const dateStr = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // Create Clean Record
      const cleanRecord: CleanOPDRecord = {
        encounterId,
        patientId: patId,
        hospitalNo: pat.hospitalNo,
        facilityId: facility.id,
        facilityName: facility.name,
        zone: facility.zone,
        date: dateStr,
        month,
        monthName: MONTH_NAMES[month - 1],
        dayOfWeek,
        timeOfArrival,
        season,
        age: pat.age,
        ageCohort: getAgeCohort(pat.age),
        gender: pat.gender,
        nhiaEnrolled: pat.nhia,
        paymentMethod: pat.nhia ? 'NHIA / Health Insurance' : 'Out-of-Pocket Cash Payment',
        residenceDistanceKm: Math.round((2 + random() * 28) * 10) / 10,
        triageAcuity: acuity,
        vitals: {
          temperatureC: temp,
          systolicBP: sysBP,
          diastolicBP: diaBP,
          pulseRate: 72 + Math.floor(random() * 32),
          respiratoryRate: 16 + Math.floor(random() * 12),
          spO2: 95 + Math.floor(random() * 4)
        },
        chiefComplaint: diagnosis.conditionName.split('(')[0].trim(),
        primaryDiagnosis: diagnosis,
        labTestPerformed: diagnosis.requiresLabConfirmation 
          ? (diagnosis.icd10 === 'B54' ? 'RDT Positive' : diagnosis.icd10 === 'A01.0' ? 'Widal Test' : 'Microscopy Confirmed')
          : 'None',
        waitTimeMinutes: baseWait,
        consultationDurationMinutes: consultDuration,
        doctorCadre: random() > 0.65 ? 'Senior Registrar' : (random() > 0.3 ? 'Medical Officer' : 'Consultant Physician'),
        disposition,
        prescriptionGiven: disposition !== 'Left Against Medical Advice (LAMA)'
      };

      cleanRecords.push(cleanRecord);

      // Now synthesize the corresponding "Raw Messy Record"
      // introducing realistic paper-registry transcription bugs:
      const anomalies: RawMessyOPDRecord['anomaliesDetected'] = [];

      // 1. Date formatting chaos (e.g. DD/MM/YYYY, MM/DD/YYYY, missing leading zero)
      let rawDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/2023`;
      if (recordCounter % 7 === 0) {
        rawDate = `2023/${month}/${day}`; // Mixed slash
        anomalies.push({
          field: 'date',
          issueType: 'format',
          description: 'Non-standard slash format (YYYY/M/D instead of ISO 8601 YYYY-MM-DD)',
          rawText: rawDate,
          cleanedValue: dateStr
        });
      } else if (recordCounter % 13 === 0) {
        rawDate = `${month}-${day}-23`; // Ambiguous two-digit year
        anomalies.push({
          field: 'date',
          issueType: 'format',
          description: 'Ambiguous short date without 4-digit century',
          rawText: rawDate,
          cleanedValue: dateStr
        });
      }

      // 2. Diagnosis typos & informal abbreviations
      let rawDiagnosis = diagnosis.conditionName;
      if (diagnosis.icd10 === 'B54') {
        const variants = ['Malaria ++', 'MP +ve', 'P. falciparum malaria', 'Malariya fever', 'Severe mp'];
        rawDiagnosis = variants[recordCounter % variants.length];
        anomalies.push({
          field: 'diagnosis',
          issueType: 'typo_alias',
          description: 'Colloquial clinical notation mapped to ICD-10 B54',
          rawText: rawDiagnosis,
          cleanedValue: diagnosis.conditionName
        });
      } else if (diagnosis.icd10 === 'I10') {
        const variants = ['HTN Stage 2', 'High Blood Pressure', 'BP elevated', 'HBP'];
        rawDiagnosis = variants[recordCounter % variants.length];
        anomalies.push({
          field: 'diagnosis',
          issueType: 'typo_alias',
          description: 'Unstructured abbreviation normalized to Essential Hypertension (I10)',
          rawText: rawDiagnosis,
          cleanedValue: diagnosis.conditionName
        });
      } else if (diagnosis.icd10 === 'A01.0') {
        rawDiagnosis = 'Typhoid fev / Enteric';
        anomalies.push({
          field: 'diagnosis',
          issueType: 'typo_alias',
          description: 'Truncated spelling standardized to Typhoid Enteritis (A01.0)',
          rawText: rawDiagnosis,
          cleanedValue: diagnosis.conditionName
        });
      }

      // 3. Outlier / transcription error in vitals or age
      let rawTemp: string | number = temp;
      if (recordCounter % 17 === 0) {
        rawTemp = Math.round(temp * 10); // e.g. 384 instead of 38.4 (forgot decimal point!)
        anomalies.push({
          field: 'temperature',
          issueType: 'outlier',
          description: 'Missing decimal point: 384°C physiological impossibility rectified to 38.4°C',
          rawText: String(rawTemp),
          cleanedValue: `${temp}°C`
        });
      }

      let rawAge: string | number = pat.age;
      if (recordCounter % 29 === 0) {
        rawAge = `${pat.age}0`; // Accidental trailing zero e.g. 320 yrs
        anomalies.push({
          field: 'age',
          issueType: 'outlier',
          description: `Impossible biological age ${rawAge} detected, cross-referenced with cohort to ${pat.age}`,
          rawText: String(rawAge),
          cleanedValue: `${pat.age} years`
        });
      }

      // 4. Missing values
      let rawNhis = pat.nhia ? 'YES' : 'CASH';
      if (recordCounter % 11 === 0) {
        rawNhis = 'NIL / UNRECORDED';
        anomalies.push({
          field: 'nhis_status',
          issueType: 'missing',
          description: 'Unrecorded insurance status imputed using default out-of-pocket payment protocol',
          rawText: 'NULL',
          cleanedValue: 'Out-of-Pocket Cash Payment'
        });
      }

      // 5. Duplicate patient record on paper card
      let rawCard = pat.hospitalNo;
      if (recordCounter % 37 === 0) {
        rawCard = `${pat.hospitalNo}-DUP`;
        anomalies.push({
          field: 'hospital_card_no',
          issueType: 'duplicate',
          description: 'Split paper folder reconciliation: Merged secondary card into master patient index',
          rawText: rawCard,
          cleanedValue: pat.hospitalNo
        });
      }

      messyRecords.push({
        record_id: `RAW-${recordCounter}`,
        raw_date: rawDate,
        hospital_card_no: rawCard,
        facility_code: facility.shortName,
        patient_name_or_alias: `Patient #${patId.replace('PAT-', '')}`,
        raw_age: rawAge,
        gender_raw: pat.gender === 'Female' ? (recordCounter % 2 === 0 ? 'F' : 'FEMALE') : (recordCounter % 2 === 0 ? 'M' : 'male'),
        nhis_status_raw: rawNhis,
        triage_temp_raw: rawTemp,
        bp_raw: `${sysBP}/${diaBP}`,
        symptoms_raw: cleanRecord.chiefComplaint,
        diagnosis_raw: rawDiagnosis,
        lab_raw: cleanRecord.labTestPerformed,
        time_in_raw: timeOfArrival,
        time_seen_raw: `${arrivalHour + Math.floor(baseWait / 60)}:${(arrivalMin + (baseWait % 60)) % 60}`,
        duration_raw: `${consultDuration} mins`,
        disposition_raw: cleanRecord.disposition,
        anomaliesDetected: anomalies
      });

      recordCounter++;
    }
  }

  return { cleanRecords, messyRecords };
}

export const INITIAL_DATA = generateHospitalRecords();

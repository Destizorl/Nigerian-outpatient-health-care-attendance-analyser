/**
 * Cohort Simulator & Dataset Generator Modal.
 * Allows users to generate synthetic Nigerian public hospital records under varying epidemiological stress scenarios.
 */

import React, { useState } from 'react';
import { NIGERIAN_FACILITIES, STANDARD_DIAGNOSES, getSeasonForDate, getAgeCohort } from '../data/mockHospitalData';
import { CleanOPDRecord, RawMessyOPDRecord, Gender, TriageAcuity, DispositionType } from '../types/hospital';
import { Sliders, Zap, X, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

interface SimulatorModalProps {
  onApplyNewCohort: (clean: CleanOPDRecord[], messy: RawMessyOPDRecord[]) => void;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  onApplyNewCohort,
  onClose
}) => {
  const [sampleSize, setSampleSize] = useState<number>(600);
  const [targetFacility, setTargetFacility] = useState<string>('all');
  const [outbreakScenario, setOutbreakScenario] = useState<string>('baseline');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let seed = Date.now() % 100000;
      function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }

      const cleanRecords: CleanOPDRecord[] = [];
      const messyRecords: RawMessyOPDRecord[] = [];

      const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
      ];
      const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      for (let i = 1; i <= sampleSize; i++) {
        // Month selection
        let month = Math.floor(1 + random() * 12);
        if (outbreakScenario === 'monsoon_surge') {
          // Concentrate 70% of records in June-August (Rainy monsoon)
          if (random() < 0.7) {
            month = 5 + Math.floor(random() * 3); // June, July, August
          }
        } else if (outbreakScenario === 'harmattan_surge') {
          // Concentrate 70% in Dec - Jan
          if (random() < 0.7) {
            month = random() < 0.5 ? 12 : 1;
          }
        }

        const isRainy = month >= 5 && month <= 10;
        const isHarmattan = month >= 11 || month <= 2;

        // Facility
        let facility = NIGERIAN_FACILITIES[Math.floor(random() * NIGERIAN_FACILITIES.length)];
        if (targetFacility !== 'all') {
          const match = NIGERIAN_FACILITIES.find(f => f.id === targetFacility);
          if (match) facility = match;
        }

        const season = getSeasonForDate(month, facility.zone);
        let dayOfWeek = DAYS[Math.floor(random() * DAYS.length)];
        if (outbreakScenario === 'monday_crisis' && random() < 0.6) {
          dayOfWeek = 'Monday';
        }

        const isMonday = dayOfWeek === 'Monday';

        // Demographics
        const gender: Gender = random() > 0.48 ? 'Female' : 'Male';
        let age = Math.floor(random() * 75);
        if (random() < 0.25) age = Math.floor(random() * 5); // Under-5

        const nhia = random() < 0.28;
        const day = Math.min(28, Math.max(1, Math.floor(1 + random() * 28)));
        const dateStr = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Diagnosis
        let diagnosis = STANDARD_DIAGNOSES[0];
        const r = random();

        if (outbreakScenario === 'monsoon_surge') {
          if (r < 0.65) diagnosis = STANDARD_DIAGNOSES[0]; // Malaria
          else if (r < 0.8) diagnosis = STANDARD_DIAGNOSES[5]; // Gastroenteritis
          else diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
        } else if (outbreakScenario === 'harmattan_surge') {
          if (r < 0.55) diagnosis = STANDARD_DIAGNOSES[2]; // URTI
          else if (r < 0.75) diagnosis = STANDARD_DIAGNOSES[3]; // Pneumonia
          else diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
        } else {
          if (isRainy) {
            if (r < 0.45) diagnosis = STANDARD_DIAGNOSES[0];
            else if (r < 0.65) diagnosis = STANDARD_DIAGNOSES[5];
            else diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
          } else {
            if (r < 0.35) diagnosis = STANDARD_DIAGNOSES[2];
            else if (r < 0.55) diagnosis = STANDARD_DIAGNOSES[7];
            else diagnosis = STANDARD_DIAGNOSES[Math.floor(random() * STANDARD_DIAGNOSES.length)];
          }
        }

        // Wait time
        let waitTime = isMonday ? Math.floor(140 + random() * 110) : Math.floor(35 + random() * 65);
        if (outbreakScenario === 'monday_crisis' && isMonday) {
          waitTime = Math.floor(210 + random() * 90);
        }

        let temp = 36.6 + (random() * 0.8);
        if (diagnosis.category === 'Malaria & Parasitic') temp = 38.2 + (random() * 1.4);
        temp = Math.round(temp * 10) / 10;

        let sysBP = 118 + Math.floor(random() * 20);
        let diaBP = 76 + Math.floor(random() * 14);
        if (diagnosis.category === 'Cardiovascular & Hypertension') {
          sysBP = 150 + Math.floor(random() * 40);
          diaBP = 95 + Math.floor(random() * 20);
        }

        const encounterId = `SIM-2023-${i.toString().padStart(4, '0')}`;
        const hospitalNo = `${facility.shortName.substring(0, 3).toUpperCase()}/2023/${12000 + i}`;

        const cleanRec: CleanOPDRecord = {
          encounterId,
          patientId: `PAT-SIM-${i}`,
          hospitalNo,
          facilityId: facility.id,
          facilityName: facility.name,
          zone: facility.zone,
          date: dateStr,
          month,
          monthName: MONTHS[month - 1],
          dayOfWeek,
          timeOfArrival: `08:${Math.floor(random() * 59).toString().padStart(2, '0')}`,
          season,
          age,
          ageCohort: getAgeCohort(age),
          gender,
          nhiaEnrolled: nhia,
          paymentMethod: nhia ? 'NHIA / Health Insurance' : 'Out-of-Pocket Cash Payment',
          residenceDistanceKm: Math.round((2 + random() * 25) * 10) / 10,
          triageAcuity: diagnosis.icd10 === 'B50.9' ? 'Emergency (Orange)' : 'Standard Routine (Green)',
          vitals: {
            temperatureC: temp,
            systolicBP: sysBP,
            diastolicBP: diaBP,
            pulseRate: 75 + Math.floor(random() * 25),
            respiratoryRate: 18 + Math.floor(random() * 8),
            spO2: 96 + Math.floor(random() * 3)
          },
          chiefComplaint: diagnosis.conditionName,
          primaryDiagnosis: diagnosis,
          labTestPerformed: diagnosis.requiresLabConfirmation ? 'Microscopy Confirmed' : 'None',
          waitTimeMinutes: waitTime,
          consultationDurationMinutes: Math.floor(12 + random() * 15),
          doctorCadre: random() > 0.5 ? 'Senior Registrar' : 'Medical Officer',
          department: 'General Outpatient (GOPD)',
          quarter: month <= 3 ? 'Q1' : month <= 6 ? 'Q2' : month <= 9 ? 'Q3' : 'Q4',
          year: 2023,
          isEligible: true,
          disposition: 'Discharged Home with Prescription',
          prescriptionGiven: true
        };

        cleanRecords.push(cleanRec);

        // Raw Messy
        const anomalies: RawMessyOPDRecord['anomaliesDetected'] = [];
        let rawDiag = diagnosis.conditionName;
        if (diagnosis.icd10 === 'B54' && i % 4 === 0) {
          rawDiag = 'Malaria ++';
          anomalies.push({
            field: 'diagnosis',
            issueType: 'typo_alias',
            description: 'Clinical tally shorthand resolved to ICD-10 B54',
            rawText: rawDiag,
            cleanedValue: diagnosis.conditionName
          });
        }
        let rawTemp: string | number = temp;
        if (i % 19 === 0) {
          rawTemp = Math.round(temp * 10);
          anomalies.push({
            field: 'temperature',
            issueType: 'outlier',
            description: 'Omitted decimal point rectified',
            rawText: String(rawTemp),
            cleanedValue: `${temp}°C`
          });
        }

        messyRecords.push({
          record_id: `RAW-SIM-${i}`,
          raw_date: dateStr,
          hospital_card_no: hospitalNo,
          facility_code: facility.shortName,
          patient_name_or_alias: `Patient #${i}`,
          raw_age: age,
          gender_raw: gender === 'Female' ? 'F' : 'M',
          nhis_status_raw: nhia ? 'YES' : 'CASH',
          triage_temp_raw: rawTemp,
          bp_raw: `${sysBP}/${diaBP}`,
          symptoms_raw: diagnosis.conditionName,
          diagnosis_raw: rawDiag,
          lab_raw: cleanRec.labTestPerformed,
          time_in_raw: cleanRec.timeOfArrival,
          time_seen_raw: '09:45',
          duration_raw: '15 mins',
          disposition_raw: cleanRec.disposition,
          anomaliesDetected: anomalies
        });
      }

      onApplyNewCohort(cleanRecords, messyRecords);
      setIsGenerating(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">
              Epidemiological Cohort Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Sample Cohort Size ({sampleSize} encounters)
            </label>
            <input
              type="range"
              min={200}
              max={1200}
              step={50}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full accent-teal-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>200 (Pilot)</span>
              <span>600 (Standard Annual)</span>
              <span>1200 (High-Volume Tertiary)</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Target Public Healthcare Facility
            </label>
            <select
              value={targetFacility}
              onChange={(e) => setTargetFacility(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">National Multi-Center Mix (5 Referral Hospitals)</option>
              {NIGERIAN_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.zone})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Epidemiological Stress Scenario Injection
            </label>
            <div className="space-y-2">
              <label className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                outbreakScenario === 'baseline' ? 'border-teal-700 bg-teal-50/40 font-semibold text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="scenario"
                  value="baseline"
                  checked={outbreakScenario === 'baseline'}
                  onChange={(e) => setOutbreakScenario(e.target.value)}
                  className="mr-2 text-teal-800"
                />
                Baseline Public Hospital Mix (Balanced Seasons & Morbidities)
              </label>

              <label className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                outbreakScenario === 'monsoon_surge' ? 'border-teal-700 bg-teal-50/40 font-semibold text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="scenario"
                  value="monsoon_surge"
                  checked={outbreakScenario === 'monsoon_surge'}
                  onChange={(e) => setOutbreakScenario(e.target.value)}
                  className="mr-2 text-teal-800"
                />
                Extreme Monsoon Flooding & Pediatric Malaria Outbreak (+180% Vector Cases)
              </label>

              <label className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                outbreakScenario === 'harmattan_surge' ? 'border-teal-700 bg-teal-50/40 font-semibold text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="scenario"
                  value="harmattan_surge"
                  checked={outbreakScenario === 'harmattan_surge'}
                  onChange={(e) => setOutbreakScenario(e.target.value)}
                  className="mr-2 text-teal-800"
                />
                Severe Northern Harmattan Dust Wave (+160% Respiratory / Cough)
              </label>

              <label className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                outbreakScenario === 'monday_crisis' ? 'border-teal-700 bg-teal-50/40 font-semibold text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="scenario"
                  value="monday_crisis"
                  checked={outbreakScenario === 'monday_crisis'}
                  onChange={(e) => setOutbreakScenario(e.target.value)}
                  className="mr-2 text-teal-800"
                />
                Crippling Monday Waiting Room Surge (Queue Times &gt; 220 mins)
              </label>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Cohort...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Generate & Load Cohort</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

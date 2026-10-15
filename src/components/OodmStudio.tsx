/**
 * Object-Oriented Data Modeling (OODM) Studio.
 * Visualizes UML Class Schemas, Attribute Encapsulation, State Transitions, and Object Navigation Queries.
 */

import React, { useState } from 'react';
import { OODM_CLASS_DIAGRAM, executeOODMQuery } from '../services/oodmEngine';
import { CleanOPDRecord, OODMClassDefinition } from '../types/hospital';
import { 
  Box, 
  Layers, 
  Code, 
  ArrowRight, 
  GitBranch, 
  Play, 
  Check, 
  Terminal,
  HelpCircle,
  FileCode
} from 'lucide-react';

interface OodmStudioProps {
  records: CleanOPDRecord[];
}

export const OodmStudio: React.FC<OodmStudioProps> = ({ records }) => {
  const [selectedClass, setSelectedClass] = useState<OODMClassDefinition>(OODM_CLASS_DIAGRAM[2]); // AttendanceEncounter
  const [activeTab, setActiveTab] = useState<'uml' | 'lifecycle' | 'query'>('uml');

  // Query Sandbox State
  const [queryFacility, setQueryFacility] = useState<string>('all');
  const [querySeason, setQuerySeason] = useState<string>('all');
  const [queryCategory, setQueryCategory] = useState<string>('all');
  const [queryDay, setQueryDay] = useState<string>('all');
  const [queryMaxAge, setQueryMaxAge] = useState<string>('');
  const [queryNhiaOnly, setQueryNhiaOnly] = useState<boolean>(false);

  // Execute query
  const queryResult = React.useMemo(() => {
    return executeOODMQuery(records, {
      facilityId: queryFacility,
      season: querySeason,
      diseaseCategory: queryCategory,
      dayOfWeek: queryDay,
      maxAge: queryMaxAge ? Number(queryMaxAge) : undefined,
      nhiaOnly: queryNhiaOnly
    });
  }, [records, queryFacility, querySeason, queryCategory, queryDay, queryMaxAge, queryNhiaOnly]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Educational Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-800 tracking-wide mb-3">
          <span>OBJECT-ORIENTED DATA MODELING (OODM)</span>
          <span aria-hidden="true">·</span>
          <span>HEALTH SYSTEMS ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
          OODM Analysis & Domain Design Methodology
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Unlike flat relational database tables, Object-Oriented Data Modeling encapsulates clinical behavior, temporal queue states, and epidemiological invariants within structured domain classes. 
          Inspect the class diagram, examine patient state lifecycles, and test object graph navigation queries.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('uml')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'uml'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            UML Class Diagram & Attributes
          </button>
          
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lifecycle'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Encounter State Machine Lifecycle
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'query'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interactive Object Query Console
          </button>
        </div>
      </section>

      {/* Tab 1: UML Class Diagram & Inspector */}
      {activeTab === 'uml' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Class Cards Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
              <span>Domain Object Classes ({OODM_CLASS_DIAGRAM.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Click a class to inspect methods & associations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OODM_CLASS_DIAGRAM.map((cls) => {
                const isSelected = selectedClass.id === cls.id;

                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/30 ring-1 ring-teal-700 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 px-1.5 py-0.2 bg-teal-50 border border-teal-100 rounded">
                        &laquo;{cls.stereotype || 'Class'}&raquo;
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cls.attributes.length} attrs · {cls.methods.length} ops
                      </span>
                    </div>

                    <h3 className="text-sm font-bold font-mono text-slate-900 mb-1">
                      {cls.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {cls.description}
                    </p>

                    <div className="text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Assoc: {cls.associations.map(a => a.targetClass).join(', ')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Class Inspector (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs sticky top-20">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-800 font-semibold">
                  &laquo;{selectedClass.stereotype}&raquo;
                </span>
                <span className="text-xs text-slate-400 font-mono">UML SPECIFICATION</span>
              </div>
              <h2 className="text-lg font-bold font-mono text-slate-900 mt-1">
                class {selectedClass.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {selectedClass.description}
              </p>
            </div>

            {/* Attributes Section */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Encapsulated Attributes ({selectedClass.attributes.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 font-mono text-[11px]">
                  {selectedClass.attributes.map((attr, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className={`font-bold mr-1.5 ${attr.visibility === '+' ? 'text-teal-700' : 'text-rose-600'}`}>
                          {attr.visibility}
                        </span>
                        <span className="font-semibold text-slate-900">{attr.name}:</span>
                        <span className="text-slate-500 ml-1 font-normal">{attr.type}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] font-sans">{attr.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods / Operations Section */}
              <div>
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Behavioral Operations & Invariants ({selectedClass.methods.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 font-mono text-[11px]">
                  {selectedClass.methods.map((method, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-teal-700 mr-1.5">{method.visibility}</span>
                          <span className="font-semibold text-slate-900">{method.name}</span>
                        </div>
                        <span className="text-teal-800 text-[10px] font-semibold">{method.returnType}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] font-sans mt-0.5">{method.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associations */}
              <div>
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Associations & Navigation Multiplicity
                </h4>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  {selectedClass.associations.map((assoc, idx) => (
                    <div key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-800">
                      <span>{selectedClass.name} <strong>[{assoc.relationName}]</strong> &rarr; {assoc.targetClass} ({assoc.multiplicity})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Encounter State Machine Lifecycle */}
      {activeTab === 'lifecycle' && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Outpatient Encounter State Transition Model
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The lifecycle of an outpatient visit modeled as discrete state transitions with guards and invariants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[10px] font-mono text-teal-800 font-bold block mb-1">STATE 01</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">1. Patient Registration</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Card retrieval, Master Patient Index lookup, payment categorization (NHIA vs Cash).
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Guard: Valid hospitalCardNo exists
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[10px] font-mono text-teal-800 font-bold block mb-1">STATE 02</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">2. Triage & Vitals</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Nurse records temp, BP, pulse, and assigns acuity tier (Red/Orange/Yellow/Green).
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Guard: Temp in 35-42°C range
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-rose-50/50 border-rose-200">
              <span className="text-[10px] font-mono text-rose-700 font-bold block mb-1">STATE 03 (BOTTLENECK)</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">3. Waiting Queue</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Waiting room holding state. Monday mornings see queue accumulation exceeding 180 min.
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-rose-200">
                Transition: Doctor availability
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[10px] font-mono text-teal-800 font-bold block mb-1">STATE 04</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">4. Doctor Consultation</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                History taking, examination, ICD-10 diagnostic coding, and lab investigation order.
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Duration: 10 - 25 minutes
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-emerald-50/50 border-emerald-200">
              <span className="text-[10px] font-mono text-emerald-800 font-bold block mb-1">STATE 05 (TERMINAL)</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1">5. Final Disposition</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Discharged with pharmacy prescription, admitted to inpatient ward, or referred.
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-emerald-200">
                Output: Prescription / Bed allocation
              </div>
            </div>

          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-900">Health Systems Insight:</strong> In Nigerian public hospitals, the transition from State 2 (Triage) to State 4 (Consultation) is where 82% of total hospital dwell time is spent due to the ratio of active consulting cubicles to arrival rate on Monday mornings.
          </div>
        </section>
      )}

      {/* Tab 3: Interactive Object Query Console */}
      {activeTab === 'query' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Query Filter Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Object Graph Query Parameters
                </h3>
                <p className="text-xs text-slate-500">
                  Navigate entities: Facility &rarr; Encounter &rarr; Diagnosis
                </p>
              </div>
              <Terminal className="w-4 h-4 text-teal-800" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">HospitalFacility.facilityId</label>
                <select
                  value={queryFacility}
                  onChange={(e) => setQueryFacility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 cursor-pointer"
                >
                  <option value="all">Any Facility (*)</option>
                  <option value="uch-ibadan">UCH Ibadan (South West)</option>
                  <option value="luth-lagos">LUTH Lagos (South West)</option>
                  <option value="akth-kano">AKTH Kano (North West)</option>
                  <option value="fmc-owerri">FMC Owerri (South East)</option>
                  <option value="nha-abuja">National Hospital Abuja (North Central)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">AttendanceEncounter.season</label>
                <select
                  value={querySeason}
                  onChange={(e) => setQuerySeason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 cursor-pointer"
                >
                  <option value="all">Any Season (*)</option>
                  <option value="Rainy">Rainy Season (Monsoon)</option>
                  <option value="Harmattan">Harmattan Dry (Dust Haze)</option>
                  <option value="LateDryTransition">Late Dry Transition</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ClinicalDiagnosis.diseaseCategory</label>
                <select
                  value={queryCategory}
                  onChange={(e) => setQueryCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 cursor-pointer"
                >
                  <option value="all">Any Disease Category (*)</option>
                  <option value="Malaria & Parasitic">Malaria & Parasitic</option>
                  <option value="Respiratory Infections">Respiratory Infections</option>
                  <option value="Cardiovascular & Hypertension">Cardiovascular & Hypertension</option>
                  <option value="Gastrointestinal & Waterborne">Gastrointestinal & Waterborne</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">AttendanceEncounter.dayOfWeek</label>
                <select
                  value={queryDay}
                  onChange={(e) => setQueryDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 cursor-pointer"
                >
                  <option value="all">Any Day (*)</option>
                  <option value="Monday">Monday (Surge Queue)</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Patient.age &le; (Maximum Age)</label>
                <input
                  type="number"
                  placeholder="e.g. 5 for Under-5 children"
                  value={queryMaxAge}
                  onChange={(e) => setQueryMaxAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nhiaOnly"
                  checked={queryNhiaOnly}
                  onChange={(e) => setQueryNhiaOnly(e.target.checked)}
                  className="rounded text-teal-800 focus:ring-teal-600"
                />
                <label htmlFor="nhiaOnly" className="text-slate-700 cursor-pointer">
                  Patient.nhiaEnrolled == true
                </label>
              </div>
            </div>
          </div>

          {/* Query Output & Code Inspection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* OODM Syntax Box */}
            <div className="bg-slate-900 text-teal-300 font-mono text-xs p-4 rounded-xl shadow-xs border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold">// OODM Graph Navigation Expression</div>
              <div className="text-white">
                Facility.<span className="text-amber-400">filter</span>(id: '{queryFacility}')
              </div>
              <div className="pl-4">
                .<span className="text-teal-400">encounters</span>.<span className="text-amber-400">where</span>(season: '{querySeason}', day: '{queryDay}')
              </div>
              <div className="pl-8">
                .<span className="text-teal-400">patient</span>.<span className="text-amber-400">where</span>(maxAge: {queryMaxAge || '*'}, nhia: {String(queryNhiaOnly)})
              </div>
              <div className="pl-12">
                .<span className="text-teal-400">diagnoses</span>.<span className="text-amber-400">groupBy</span>('{queryCategory}')
              </div>
            </div>

            {/* Results KPI card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-teal-800 font-bold">
                  Query Execution Results
                </h4>
                <span className="font-mono text-xs text-slate-500">
                  {queryResult.matchedCount} records matched ({queryResult.percentageOfTotal}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">Mean Wait</span>
                  <span className="font-mono font-bold text-base text-slate-900">{queryResult.summaryMetrics.avgWaitMinutes} min</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">Mean Age</span>
                  <span className="font-mono font-bold text-base text-slate-900">{queryResult.summaryMetrics.avgAge} yrs</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">NHIA %</span>
                  <span className="font-mono font-bold text-base text-teal-800">{queryResult.summaryMetrics.nhiaPercentage}%</span>
                </div>
              </div>

              {/* Diagnosis breakdown in query */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">Matched Diagnoses Distribution:</div>
                {Object.entries(queryResult.summaryMetrics.diagnosisBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 truncate max-w-xs">{cat}</span>
                    <span className="font-mono font-semibold text-slate-900">{count} cases</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

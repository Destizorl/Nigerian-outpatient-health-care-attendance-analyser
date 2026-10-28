/**
 * Attendance, Temporal & Department Analysis Module for PAAS.
 * Evaluates day-of-week, seasonal, demographic, and clinical department patterns.
 * Explicitly distinguishes outpatient facility utilization from population incidence.
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  Clock, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { CleanOPDRecord, DepartmentType, SeasonType } from '../types/hospital';

interface AttendanceAnalysisViewProps {
  records: CleanOPDRecord[];
}

const COLORS = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4338ca', '#15803d', '#6b7280'];

export const AttendanceAnalysisView: React.FC<AttendanceAnalysisViewProps> = ({ records }) => {
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (!r.isEligible) return false;
      if (selectedFacility !== 'all' && r.facilityId !== selectedFacility) return false;
      if (selectedSeason !== 'all' && r.season !== selectedSeason) return false;
      if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
      return true;
    });
  }, [records, selectedFacility, selectedSeason, selectedDepartment]);

  const totalEligible = filteredRecords.length;

  // Day of Week Distribution
  const dayOfWeekData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
      const count = filteredRecords.filter(r => r.dayOfWeek === day).length;
      const pct = totalEligible > 0 ? (count / totalEligible) * 100 : 0;
      return { day, count, percentage: Math.round(pct * 10) / 10 };
    });
  }, [filteredRecords, totalEligible]);

  // Department Attendance & Average Wait Time
  const departmentData = useMemo(() => {
    const map = new Map<string, { count: number; totalWait: number; nhiaCount: number }>();
    filteredRecords.forEach(r => {
      const dept = r.department;
      const current = map.get(dept) || { count: 0, totalWait: 0, nhiaCount: 0 };
      current.count += 1;
      current.totalWait += r.waitTimeMinutes;
      if (r.nhiaEnrolled) current.nhiaCount += 1;
      map.set(dept, current);
    });

    return Array.from(map.entries())
      .map(([department, data]) => ({
        department,
        count: data.count,
        percentage: totalEligible > 0 ? Math.round((data.count / totalEligible) * 1000) / 10 : 0,
        avgWaitMinutes: data.count > 0 ? Math.round(data.totalWait / data.count) : 0,
        nhiaCoveragePct: data.count > 0 ? Math.round((data.nhiaCount / data.count) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords, totalEligible]);

  // Age Cohort x Gender Cross-Distribution
  const demographicData = useMemo(() => {
    const cohorts = ['Under-5 (1-4y)', 'School-Age (5-14y)', 'Adult (25-49y)', 'Elderly (65+y)'];
    return cohorts.map(cohort => {
      const maleCount = filteredRecords.filter(r => r.ageCohort === cohort && r.gender === 'Male').length;
      const femaleCount = filteredRecords.filter(r => r.ageCohort === cohort && r.gender === 'Female').length;
      const cohortTotal = maleCount + femaleCount;
      const pct = totalEligible > 0 ? (cohortTotal / totalEligible) * 100 : 0;

      return {
        cohort,
        maleCount,
        femaleCount,
        total: cohortTotal,
        percentage: Math.round(pct * 10) / 10
      };
    });
  }, [filteredRecords, totalEligible]);

  // Seasonal Attendance
  const seasonalSummary = useMemo(() => {
    const rainy = filteredRecords.filter(r => r.season === 'Rainy').length;
    const harmattan = filteredRecords.filter(r => r.season === 'Harmattan').length;
    return [
      { name: 'Rainy Season (Monsoon)', value: rainy, pct: totalEligible > 0 ? Math.round((rainy / totalEligible) * 100) : 0 },
      { name: 'Harmattan / Dry Season', value: harmattan, pct: totalEligible > 0 ? Math.round((harmattan / totalEligible) * 100) : 0 }
    ];
  }, [filteredRecords, totalEligible]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Core Module 4: Attendance & Demographics
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Cross-sectional Encounter Profiling
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Attendance & Department Utilization Analysis
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Break down outpatient consultations by day of the week, clinical unit (GOPD vs Speciality), demographic cohorts, and seasonal rainfall periods. All metrics feature explicit encounter denominators.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Filtered Cohort</span>
            <div className="text-xl font-bold text-teal-900 font-mono">{totalEligible} Encounters</div>
          </div>
        </div>

        {/* Global Filter Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Hospital Facility
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
            >
              <option value="all">All Participating Hospitals (National)</option>
              <option value="uch-ibadan">University College Hospital (UCH) Ibadan</option>
              <option value="luth-lagos">Lagos University Teaching Hospital (LUTH)</option>
              <option value="akth-kano">Aminu Kano Teaching Hospital (AKTH)</option>
              <option value="fmc-owerri">Federal Medical Centre (FMC) Owerri</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Climatic Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
            >
              <option value="all">All Seasons (Full Year)</option>
              <option value="Rainy Season (Monsoon)">Rainy Season (Monsoon: May - Oct)</option>
              <option value="Harmattan / Dry Season">Harmattan / Dry Season (Nov - Apr)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Clinical Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
            >
              <option value="all">All Departments / Units</option>
              <option value="GOPD (General Outpatient)">GOPD (General Outpatient)</option>
              <option value="Pediatric Outpatient (POPD)">Pediatric Outpatient (POPD)</option>
              <option value="Obstetrics & Gynaecology (ANC/OPD)">Obstetrics & Gynaecology (ANC/OPD)</option>
              <option value="Internal Medicine Specialty OPD">Internal Medicine Specialty OPD</option>
              <option value="Accident & Emergency Triage">Accident & Emergency Triage</option>
              <option value="Surgical Outpatient (SOPD)">Surgical Outpatient (SOPD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Day-of-Week Attendance (The Monday Surge Phenomenon) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-800" />
                <span>Day-of-Week Attendance Distribution</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates the characteristic Monday outpatient surge in Nigerian tertiary centers.
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} encounters`, 'Visits']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>Peak Day: <strong>Monday</strong> ({dayOfWeekData[0]?.count || 0} visits, {dayOfWeekData[0]?.percentage || 0}%)</span>
            <span>Trough: <strong>Saturday/Sunday</strong> (Weekend Skeleton Service)</span>
          </div>
        </div>

        {/* Demographic Age Cohort x Sex Pyramid */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-800" />
                <span>Demographic Breakdown by Age Cohort & Sex</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Encounter distribution across reproductive, pediatric, and geriatric brackets.
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="cohort" type="category" stroke="#64748b" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="femaleCount" name="Female Encounters" fill="#0284c7" stackId="a" />
                <Bar dataKey="maleCount" name="Male Encounters" fill="#0f766e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            Adult (15-49) cohorts represent the largest share of clinic encounters, heavily driven by female reproductive and maternal health-seeking.
          </div>
        </div>

      </div>

      {/* Clinical Department Table with NHIA Insurance Coverage and Waiting Times */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-800" />
              <span>Departmental Workload & Operational Efficiency Cross-Tabulation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance share, mean wait time (triage-to-doctor), and National Health Insurance (NHIA) penetration.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Department / Consulting Unit</th>
                <th className="p-3 text-right">Encounters</th>
                <th className="p-3 text-right">Share of Total (%)</th>
                <th className="p-3 text-right">Mean Wait Time</th>
                <th className="p-3 text-right">NHIA Enrolled (%)</th>
                <th className="p-3 text-center">Service Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentData.map((dept, idx) => {
                const isGOPD = dept.department.includes('GOPD');
                return (
                  <tr key={dept.department} className={`hover:bg-slate-50 ${isGOPD ? 'bg-teal-50/20 font-medium' : ''}`}>
                    <td className="p-3 text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{dept.department}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{dept.count}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{dept.percentage}%</td>
                    <td className="p-3 text-right font-mono">
                      <span className={dept.avgWaitMinutes > 120 ? 'text-red-700 font-bold' : 'text-slate-800'}>
                        {dept.avgWaitMinutes} mins
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <span className="text-teal-800 font-semibold">{dept.nhiaCoveragePct}%</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isGOPD 
                          ? 'bg-teal-100 text-teal-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isGOPD ? 'Primary Entry Port' : 'Specialist Sub-clinic'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="p-3">Total Analyzed Hospital Cohort</td>
                <td className="p-3 text-right font-mono">{totalEligible}</td>
                <td className="p-3 text-right font-mono">100.0%</td>
                <td className="p-3 text-right font-mono">
                  {departmentData.length > 0 
                    ? Math.round(departmentData.reduce((acc, d) => acc + (d.avgWaitMinutes * d.count), 0) / (totalEligible || 1)) 
                    : 0} mins (Weighted Avg)
                </td>
                <td className="p-3 text-right font-mono text-teal-900">
                  {departmentData.length > 0 
                    ? Math.round((departmentData.reduce((acc, d) => acc + ((d.nhiaCoveragePct / 100) * d.count), 0) / (totalEligible || 1)) * 1000) / 10 
                    : 0}% (Cohort Avg)
                </td>
                <td className="p-3 text-center text-xs text-slate-500">All Units Active</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Critical Methodological Governance Notice */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs text-xs space-y-2">
        <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>Epidemiological Boundary Notice (Academic Defence Standard)</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The attendance frequencies, proportions, and seasonal surges reported in this module describe <strong>healthcare-seeking encounters</strong> recorded within participating tertiary and secondary public facilities. They must not be interpreted as community disease incidence or general population disease prevalence, because individuals without financial access, those attending private facilities or patent medicine vendors, and asymptomatic community members are not captured in facility attendance logs.
        </p>
      </div>
    </div>
  );
};

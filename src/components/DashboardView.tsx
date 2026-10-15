/**
 * Main Exploratory Data Analysis (EDA) Dashboard for Nigerian Public Hospital OPD Attendance.
 * Provides seasonal trends, demographic decomposition, morbidity analysis, and operational queue metrics.
 */

import React, { useState, useMemo } from 'react';
import { 
  CleanOPDRecord, 
  HospitalFacility, 
  SeasonType, 
  AgeCohort, 
  DiseaseCategory 
} from '../types/hospital';
import { NIGERIAN_FACILITIES, STANDARD_DIAGNOSES } from '../data/mockHospitalData';
import { 
  Users, 
  Clock, 
  CloudRain, 
  Calendar, 
  Filter, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Building2,
  Stethoscope,
  Heart,
  Droplet,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardViewProps {
  records: CleanOPDRecord[];
  onOpenReport: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

const CustomRechartsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isRainy = data.season === 'Rainy';
    const isHarmattan = data.season === 'Harmattan';

    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-sans min-w-[210px] pointer-events-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
          <span className="font-bold text-sm text-teal-300">{data.fullName}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
            isRainy ? 'bg-teal-900/80 text-teal-200' : isHarmattan ? 'bg-sky-900/80 text-sky-200' : 'bg-slate-800 text-slate-300'
          }`}>
            {data.season}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-200 font-bold">
            <span>Total OPD Attendance:</span>
            <span className="text-white tabular-nums">{data.total}</span>
          </div>

          <div className="flex items-center justify-between text-teal-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-teal-500 inline-block"></span>
              Malaria & Vector:
            </span>
            <span className="tabular-nums font-semibold">{data.malaria}</span>
          </div>

          <div className="flex items-center justify-between text-sky-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-sky-500 inline-block"></span>
              Respiratory Tract:
            </span>
            <span className="tabular-nums font-semibold">{data.respiratory}</span>
          </div>

          <div className="flex items-center justify-between text-amber-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block"></span>
              Cardiovascular / NCD:
            </span>
            <span className="tabular-nums font-semibold">{data.chronic}</span>
          </div>

          <div className="flex items-center justify-between text-purple-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-purple-500 inline-block"></span>
              Waterborne / Enteric:
            </span>
            <span className="tabular-nums font-semibold">{data.waterborne}</span>
          </div>

          <div className="pt-1.5 mt-1 border-t border-slate-700 flex items-center justify-between text-slate-400 text-[10px]">
            <span>Mean Wait Time:</span>
            <span className="text-slate-200 font-bold tabular-nums">{data.avgWait} mins</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onOpenReport,
  onSelectScenario
}) => {
  // Chart Visual Mode for Recharts
  const [trendChartType, setTrendChartType] = useState<'area' | 'line' | 'bar'>('area');

  // Filter States
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeCohort, setSelectedAgeCohort] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [nhiaFilter, setNhiaFilter] = useState<'all' | 'insured' | 'cash'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected encounter for modal drawer
  const [inspectRecord, setInspectRecord] = useState<CleanOPDRecord | null>(null);

  // Pagination for records table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedFacility !== 'all' && r.facilityId !== selectedFacility) return false;
      if (selectedSeason !== 'all' && r.season !== selectedSeason) return false;
      if (selectedCategory !== 'all' && r.primaryDiagnosis.category !== selectedCategory) return false;
      if (selectedAgeCohort !== 'all' && r.ageCohort !== selectedAgeCohort) return false;
      if (selectedDay !== 'all' && r.dayOfWeek !== selectedDay) return false;
      if (nhiaFilter === 'insured' && !r.nhiaEnrolled) return false;
      if (nhiaFilter === 'cash' && r.nhiaEnrolled) return false;
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = r.hospitalNo.toLowerCase().includes(term);
        const matchesDiag = r.primaryDiagnosis.conditionName.toLowerCase().includes(term);
        const matchesFacility = r.facilityName.toLowerCase().includes(term);
        const matchesIcd = r.primaryDiagnosis.icd10.toLowerCase().includes(term);
        if (!matchesName && !matchesDiag && !matchesFacility && !matchesIcd) return false;
      }
      return true;
    });
  }, [records, selectedFacility, selectedSeason, selectedCategory, selectedAgeCohort, selectedDay, nhiaFilter, searchTerm]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    if (total === 0) {
      return {
        totalEncounters: 0,
        rainyRatio: 0,
        underFiveShare: 0,
        meanWaitTime: 0,
        mondayVolumeShare: 0,
        nhiaCoverageShare: 0
      };
    }

    const rainyCount = filteredRecords.filter(r => r.season === 'Rainy').length;
    const dryCount = filteredRecords.filter(r => r.season === 'Harmattan' || r.season === 'LateDryTransition').length || 1;
    const rainyRatio = Math.round((rainyCount / dryCount) * 10) / 10;

    const underFiveCount = filteredRecords.filter(r => r.age < 5).length;
    const underFiveShare = Math.round((underFiveCount / total) * 100);

    const totalWait = filteredRecords.reduce((sum, r) => sum + r.waitTimeMinutes, 0);
    const meanWaitTime = Math.round(totalWait / total);

    const mondayCount = filteredRecords.filter(r => r.dayOfWeek === 'Monday').length;
    const mondayVolumeShare = Math.round((mondayCount / total) * 100);

    const nhiaCount = filteredRecords.filter(r => r.nhiaEnrolled).length;
    const nhiaCoverageShare = Math.round((nhiaCount / total) * 100);

    return {
      totalEncounters: total,
      rainyRatio,
      underFiveShare,
      meanWaitTime,
      mondayVolumeShare,
      nhiaCoverageShare
    };
  }, [filteredRecords]);

  // Monthly Time-Series Breakdown for Recharts
  const monthlyData = useMemo(() => {
    const months = [
      { name: 'Jan', fullName: 'January', season: 'Harmattan', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Feb', fullName: 'February', season: 'Harmattan', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Mar', fullName: 'March', season: 'Transition', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Apr', fullName: 'April', season: 'Transition', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'May', fullName: 'May', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Jun', fullName: 'June', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Jul', fullName: 'July', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Aug', fullName: 'August', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Sep', fullName: 'September', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Oct', fullName: 'October', season: 'Rainy', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Nov', fullName: 'November', season: 'Harmattan', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 },
      { name: 'Dec', fullName: 'December', season: 'Harmattan', total: 0, malaria: 0, respiratory: 0, chronic: 0, waterborne: 0, totalWait: 0 }
    ];

    filteredRecords.forEach(r => {
      const idx = r.month - 1;
      if (idx >= 0 && idx < 12) {
        months[idx].total += 1;
        months[idx].totalWait += r.waitTimeMinutes;
        if (r.primaryDiagnosis.category === 'Malaria & Parasitic') months[idx].malaria += 1;
        else if (r.primaryDiagnosis.category === 'Respiratory Infections') months[idx].respiratory += 1;
        else if (r.primaryDiagnosis.isChronic) months[idx].chronic += 1;
        else if (r.primaryDiagnosis.category === 'Gastrointestinal & Waterborne') months[idx].waterborne += 1;
      }
    });

    const maxVal = Math.max(...months.map(m => m.total), 1);
    const enrichedMonths = months.map(m => ({
      ...m,
      avgWait: m.total > 0 ? Math.round(m.totalWait / m.total) : 0
    }));

    return { months: enrichedMonths, maxVal };
  }, [filteredRecords]);

  // Top Morbidities
  const topMorbidities = useMemo(() => {
    const counts: { [name: string]: { code: string; name: string; category: string; count: number } } = {};
    filteredRecords.forEach(r => {
      const key = r.primaryDiagnosis.icd10;
      if (!counts[key]) {
        counts[key] = {
          code: r.primaryDiagnosis.icd10,
          name: r.primaryDiagnosis.conditionName,
          category: r.primaryDiagnosis.category,
          count: 0
        };
      }
      counts[key].count += 1;
    });

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 7);
    const total = filteredRecords.length || 1;
    return sorted.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));
  }, [filteredRecords]);

  // Day of Week Distribution (The Nigerian Monday Surge)
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { day: 'Monday', count: 0, totalWait: 0 },
      { day: 'Tuesday', count: 0, totalWait: 0 },
      { day: 'Wednesday', count: 0, totalWait: 0 },
      { day: 'Thursday', count: 0, totalWait: 0 },
      { day: 'Friday', count: 0, totalWait: 0 },
      { day: 'Saturday', count: 0, totalWait: 0 },
      { day: 'Sunday', count: 0, totalWait: 0 }
    ];

    filteredRecords.forEach(r => {
      const entry = days.find(d => d.day === r.dayOfWeek);
      if (entry) {
        entry.count += 1;
        entry.totalWait += r.waitTimeMinutes;
      }
    });

    const maxCount = Math.max(...days.map(d => d.count), 1);
    return days.map(d => ({
      day: d.day,
      count: d.count,
      avgWait: d.count > 0 ? Math.round(d.totalWait / d.count) : 0,
      heightPct: Math.round((d.count / maxCount) * 100)
    }));
  }, [filteredRecords]);

  // Demographic Age-Gender Pyramid
  const agePyramid = useMemo(() => {
    const cohorts: { cohort: AgeCohort; male: number; female: number }[] = [
      { cohort: 'Under-5 (1-4y)', male: 0, female: 0 },
      { cohort: 'School-Age (5-14y)', male: 0, female: 0 },
      { cohort: 'Youth (15-24y)', male: 0, female: 0 },
      { cohort: 'Adult (25-49y)', male: 0, female: 0 },
      { cohort: 'Mature Adult (50-64y)', male: 0, female: 0 },
      { cohort: 'Elderly (65+y)', male: 0, female: 0 }
    ];

    filteredRecords.forEach(r => {
      let targetCohort: AgeCohort = r.ageCohort;
      if (r.ageCohort === 'Neonatal (0-28d)' || r.ageCohort === 'Infant (1-11m)') {
        targetCohort = 'Under-5 (1-4y)';
      }
      const entry = cohorts.find(c => c.cohort === targetCohort);
      if (entry) {
        if (r.gender === 'Female') entry.female += 1;
        else entry.male += 1;
      }
    });

    const maxSide = Math.max(...cohorts.flatMap(c => [c.female, c.male]), 1);
    return { cohorts, maxSide };
  }, [filteredRecords]);

  // Facility Comparison
  const facilityBreakdown = useMemo(() => {
    return NIGERIAN_FACILITIES.map(facility => {
      const facRecords = filteredRecords.filter(r => r.facilityId === facility.id);
      const total = facRecords.length;
      const malariaPct = total > 0 ? Math.round((facRecords.filter(r => r.primaryDiagnosis.category === 'Malaria & Parasitic').length / total) * 100) : 0;
      const respPct = total > 0 ? Math.round((facRecords.filter(r => r.primaryDiagnosis.category === 'Respiratory Infections').length / total) * 100) : 0;
      const avgWait = total > 0 ? Math.round(facRecords.reduce((sum, r) => sum + r.waitTimeMinutes, 0) / total) : 0;
      return {
        ...facility,
        encountersCount: total,
        malariaPct,
        respPct,
        avgWait
      };
    });
  }, [filteredRecords]);

  // Pagination slice
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  const resetFilters = () => {
    setSelectedFacility('all');
    setSelectedSeason('all');
    setSelectedCategory('all');
    setSelectedAgeCohort('all');
    setSelectedDay('all');
    setNhiaFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Presentation Split with Hospital Context Image */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Text & Context */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-teal-800 tracking-wide mb-3">
                <span>EPIDEMIOLOGY & HEALTH INFORMATICS</span>
                <span aria-hidden="true">·</span>
                <span>NIGERIAN TERTIARY PUBLIC SECTOR</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
                Outpatient Attendance Patterns in Nigerian Public Hospitals
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Explore real and simulated outpatient records across major Nigerian teaching hospitals and federal medical centres. 
                Investigate how monsoon rains trigger malaria epidemics, how Harmattan dust storms surge northern respiratory caseloads, 
                and why hospital queues reach catastrophic peaks on Monday mornings.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>5 Major Referral Centres</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-slate-400" />
                <span>Bimodal Rainy & Harmattan Seasons</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span>ICD-10 Clinical Taxonomy</span>
              </div>
            </div>
          </div>

          {/* Right Editorial Documentary Image */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-slate-900">
            <img
              src="/src/assets/images/nigerian_hospital_opd_1792067014263.jpg"
              alt="Nigerian hospital outpatient consultation department with doctors and patients"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <p className="text-xs text-white/90 font-medium">
                Outpatient Department (OPD) Consultation Hall · Clinical Triage Desk
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Global Filter Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-800" />
            <h2 className="text-sm font-semibold text-slate-900">Cohort Filter & Stratification Engine</h2>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-teal-900 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          
          {/* Facility Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Facility / State</label>
            <select
              value={selectedFacility}
              onChange={(e) => { setSelectedFacility(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Hospitals (National)</option>
              {NIGERIAN_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.shortName} ({f.zone})</option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Epidemiological Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => { setSelectedSeason(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Seasons (12 Months)</option>
              <option value="Rainy">Rainy Season (May – Oct)</option>
              <option value="Harmattan">Harmattan Dry (Nov – Feb)</option>
              <option value="LateDryTransition">Dry Transition (Mar – Apr)</option>
            </select>
          </div>

          {/* Disease Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Disease Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Clinical Categories</option>
              <option value="Malaria & Parasitic">Malaria & Parasitic</option>
              <option value="Respiratory Infections">Respiratory Infections</option>
              <option value="Gastrointestinal & Waterborne">Gastrointestinal & Waterborne</option>
              <option value="Cardiovascular & Hypertension">Cardiovascular & Hypertension</option>
              <option value="Endocrine & Diabetes">Endocrine & Diabetes</option>
              <option value="Hematological & Sickle Cell">Hematological & Sickle Cell</option>
              <option value="Trauma & Road Injuries">Trauma & Road Injuries</option>
              <option value="Maternal & Reproductive OPD">Maternal & Reproductive</option>
            </select>
          </div>

          {/* Age Cohort */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Age Demographics</label>
            <select
              value={selectedAgeCohort}
              onChange={(e) => { setSelectedAgeCohort(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Age Groups</option>
              <option value="Under-5 (1-4y)">Under-5 Children (0-4y)</option>
              <option value="School-Age (5-14y)">School Age (5-14y)</option>
              <option value="Youth (15-24y)">Youth (15-24y)</option>
              <option value="Adult (25-49y)">Adult (25-49y)</option>
              <option value="Mature Adult (50-64y)">Mature Adult (50-64y)</option>
              <option value="Elderly (65+y)">Elderly (65+y)</option>
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Day of Week</label>
            <select
              value={selectedDay}
              onChange={(e) => { setSelectedDay(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday (Surge Day)</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          {/* NHIA Payment Modality */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">NHIA Insurance</label>
            <select
              value={nhiaFilter}
              onChange={(e) => { setNhiaFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Payment Modes</option>
              <option value="insured">NHIA Insured Only</option>
              <option value="cash">Out-of-Pocket Cash Only</option>
            </select>
          </div>

        </div>
      </section>

      {/* KPI Summary Strip */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Total Encounters
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {kpis.totalEncounters}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {records.length > 0 ? `${Math.round((kpis.totalEncounters / records.length) * 100)}% of dataset` : '0%'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Rain/Dry Ratio
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
            {kpis.rainyRatio}x
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Monsoon surge factor
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Pediatric Share
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-900">
            {kpis.underFiveShare}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Children under 5 years
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Mean OPD Wait
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {kpis.meanWaitTime} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Desk to consultation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Monday Volume
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {kpis.mondayVolumeShare}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Weekly Monday jam
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            NHIA Insured
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {kpis.nhiaCoverageShare}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Prepaid capitation
          </div>
        </div>

      </section>

      {/* 2-Column Analytical Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Seasonal Attendance Trajectory using Recharts (8 cols) */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-800" />
                  <h3 className="text-base font-bold text-slate-900">
                    Monthly Hospital Attendance Trend Analysis
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizing monthly patterns, monsoon malaria peaks, and Harmattan respiratory surges over the past year
                </p>
              </div>

              {/* Chart Visual Type Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTrendChartType('area')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    trendChartType === 'area'
                      ? 'bg-white text-teal-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stacked Area
                </button>
                <button
                  type="button"
                  onClick={() => setTrendChartType('line')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    trendChartType === 'line'
                      ? 'bg-white text-teal-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trend Lines
                </button>
                <button
                  type="button"
                  onClick={() => setTrendChartType('bar')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    trendChartType === 'bar'
                      ? 'bg-white text-teal-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Bars
                </button>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-64 sm:h-72 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                {trendChartType === 'area' ? (
                  <AreaChart data={monthlyData.months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.25} />
                      </linearGradient>
                      <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.25} />
                      </linearGradient>
                      <linearGradient id="colorChronic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.25} />
                      </linearGradient>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="malaria"
                      name="Malaria & Parasitic"
                      stackId="1"
                      stroke="#0d9488"
                      fill="url(#colorMalaria)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="respiratory"
                      name="Respiratory Infections"
                      stackId="1"
                      stroke="#0284c7"
                      fill="url(#colorResp)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="chronic"
                      name="Cardiovascular & NCDs"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="url(#colorChronic)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="waterborne"
                      name="Waterborne & Enteric"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="url(#colorWater)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : trendChartType === 'line' ? (
                  <LineChart data={monthlyData.months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Encounters"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0f172a' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="malaria"
                      name="Malaria"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0d9488' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="respiratory"
                      name="Respiratory"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0284c7' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="chronic"
                      name="Chronic NCDs"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={monthlyData.months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Bar dataKey="malaria" name="Malaria" stackId="stack" fill="#0d9488" />
                    <Bar dataKey="respiratory" name="Respiratory" stackId="stack" fill="#0284c7" />
                    <Bar dataKey="chronic" name="Chronic NCDs" stackId="stack" fill="#f59e0b" />
                    <Bar dataKey="waterborne" name="Waterborne" stackId="stack" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Custom Legend & Indicators Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-xs"></span>
                  <span className="text-slate-700 font-medium">Malaria & Vector</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-sky-500 rounded-xs"></span>
                  <span className="text-slate-700 font-medium">Respiratory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
                  <span className="text-slate-700 font-medium">Cardiovascular/NCDs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-xs"></span>
                  <span className="text-slate-700 font-medium">Waterborne</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                <span>Rainy: May–Oct</span>
                <span>·</span>
                <span>Harmattan: Nov–Feb</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Epidemiological Finding:</span>
              <span>Monsoon vector surge peaks June–July; Harmattan airborne dust spike in December–January.</span>
            </div>
            <button
              onClick={() => onSelectScenario('scenario-malaria-surge')}
              className="text-teal-800 font-medium hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Study Monsoon Surge Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Chart 2: The Monday OPD Jam & Wait-Time Curve (4 cols) */}
        <section className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                The "Monday Surge" Bottleneck
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekend care deferrals flood clinics on Monday, tripling waiting times
              </p>
            </div>

            <div className="space-y-2.5">
              {dayOfWeekStats.map((item) => {
                const isMonday = item.day === 'Monday';
                return (
                  <div key={item.day} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${isMonday ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {item.day} {isMonday && '(Peak Jam)'}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {item.count} patients · <strong className={item.avgWait > 120 ? 'text-rose-600' : 'text-slate-700'}>{item.avgWait}m wait</strong>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMonday ? 'bg-rose-600' : 'bg-slate-400'
                        }`}
                        style={{ width: `${item.heightPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Queue bottleneck threshold: 90 mins</span>
            <button
              onClick={() => onSelectScenario('scenario-monday-jam')}
              className="text-teal-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Queue Dynamics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

      </div>

      {/* 2nd Row: Morbidities Pareto & Demographic Age-Gender Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 7 Morbidities Pareto Breakdown (6 cols) */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top OPD Morbidities (ICD-10 Aligned)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency distribution of primary diagnoses triaged in public clinics
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">PARETO DISTRIBUTION</span>
          </div>

          <div className="space-y-3">
            {topMorbidities.map((item) => (
              <div key={item.code} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-800 px-1 bg-teal-50 rounded text-[11px]">
                      {item.code}
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[240px] sm:max-w-xs">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-600">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>WHO Nigerian Essential Health Package Categories</span>
            <span className="font-mono text-teal-800">Top 3 represent {topMorbidities.slice(0, 3).reduce((sum, i) => sum + i.percentage, 0)}% of burden</span>
          </div>
        </section>

        {/* Demographic Age & Sex Pyramid (6 cols) */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Demographic Age & Sex Vulnerability
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dual-sided cohort breakdown highlighting pediatric vulnerability and adult female attendance
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-700 font-medium">Female</span>
              <span className="text-indigo-700 font-medium">Male</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {agePyramid.cohorts.map((row) => {
              const femaleWidth = Math.round((row.female / agePyramid.maxSide) * 100);
              const maleWidth = Math.round((row.male / agePyramid.maxSide) * 100);

              return (
                <div key={row.cohort} className="text-xs">
                  <div className="text-center font-medium text-slate-700 mb-1">
                    {row.cohort}
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    
                    {/* Female bar (right aligned) */}
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono tabular-nums text-[11px] text-emerald-800">{row.female}</span>
                      <div className="h-3 bg-slate-100 w-full max-w-[140px] rounded-l flex justify-end overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-l"
                          style={{ width: `${femaleWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Male bar (left aligned) */}
                    <div className="flex items-center justify-start gap-2">
                      <div className="h-3 bg-slate-100 w-full max-w-[140px] rounded-r flex justify-start overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-r"
                          style={{ width: `${maleWidth}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-[11px] text-indigo-800">{row.male}</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>High pediatric under-5 burden mirrors Nigerian fertility demographics</span>
            <span className="text-slate-600">Median age ~ 18.5 years</span>
          </div>
        </section>

      </div>

      {/* Geopolitical Referral Centres Comparison Strip */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comparative Analysis Across Nigerian Referral Centres
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Geopolitical variations reflecting rainforest malaria ecology vs sahel meningitis belt
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">5 FEDERAL FACILITIES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {facilityBreakdown.map((facility) => (
            <div key={facility.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="text-xs font-mono text-teal-800 font-bold mb-0.5">{facility.shortName}</div>
              <div className="text-[11px] text-slate-500 mb-2">{facility.city} · {facility.zone}</div>
              
              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Encounters:</span>
                  <span className="font-mono font-semibold text-slate-900">{facility.encountersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Malaria Share:</span>
                  <span className="font-mono font-semibold text-teal-700">{facility.malariaPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resp. Share:</span>
                  <span className="font-mono font-semibold text-sky-700">{facility.respPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mean Wait:</span>
                  <span className="font-mono font-semibold text-slate-700">{facility.avgWait} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Master Patient Encounters Registry Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cleaned Outpatient Attendance Registry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized electronic encounter records following OODM domain transformation
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search card #, diagnosis, ICD..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-teal-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-mono">Date / Season</th>
                <th className="py-2.5 px-3 font-mono">Hospital Card #</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Age / Sex</th>
                <th className="py-2.5 px-3">Primary Diagnosis (ICD-10)</th>
                <th className="py-2.5 px-3">Triage Acuity</th>
                <th className="py-2.5 px-3">Wait Time</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No records match the active filter criteria. Try adjusting your parameters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.encounterId} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                      <div>{r.date}</div>
                      <div className="text-[10px] text-slate-500">{r.season} · {r.dayOfWeek.substring(0, 3)}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                      {r.hospitalNo}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-800">
                      {r.facilityName.split('(')[0].trim()}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-900">{r.age}y</span>
                      <span className="text-slate-400 ml-1">({r.gender === 'Female' ? 'F' : 'M'})</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 truncate max-w-xs">
                        <span className="font-mono text-teal-800 mr-1.5 font-bold">[{r.primaryDiagnosis.icd10}]</span>
                        {r.primaryDiagnosis.conditionName}
                      </div>
                      <div className="text-[10px] text-slate-500">{r.primaryDiagnosis.category}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        r.triageAcuity.includes('Emergency') || r.triageAcuity.includes('Resuscitation')
                          ? 'bg-rose-50 text-rose-700'
                          : r.triageAcuity.includes('Urgent')
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.triageAcuity.split('(')[0].trim()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      <span className={r.waitTimeMinutes > 150 ? 'text-rose-600 font-bold' : ''}>
                        {r.waitTimeMinutes} min
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[11px] ${r.nhiaEnrolled ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                        {r.nhiaEnrolled ? 'NHIA Covered' : 'Out-of-Pocket'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectRecord(r)}
                        className="px-2 py-1 text-[11px] text-teal-800 hover:text-teal-950 font-medium hover:bg-teal-50 rounded transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-medium text-slate-900">{filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-mono font-medium text-slate-900">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of <span className="font-mono font-medium text-slate-900">{filteredRecords.length}</span> records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-mono tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Clinical Encounter Detail Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-mono text-teal-800 font-bold">{inspectRecord.encounterId}</span>
                <h3 className="text-lg font-bold text-slate-900">Outpatient Encounter Record</h3>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              
              {/* Top Facility & Patient Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Hospital Card #</span>
                  <span className="font-mono font-bold text-slate-800">{inspectRecord.hospitalNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Facility</span>
                  <span className="font-medium text-slate-800">{inspectRecord.facilityName.split('(')[0]}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Date / Time</span>
                  <span className="font-mono text-slate-800">{inspectRecord.date} @ {inspectRecord.timeOfArrival}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Season</span>
                  <span className="font-semibold text-teal-800">{inspectRecord.season}</span>
                </div>
              </div>

              {/* Triage Vitals */}
              <div>
                <h4 className="font-semibold text-slate-900 uppercase text-[11px] font-mono tracking-wider mb-2">
                  Triage Station Physiological Measurements
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Body Temp</span>
                    <span className={`font-mono font-bold text-sm ${inspectRecord.vitals.temperatureC >= 38 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {inspectRecord.vitals.temperatureC}°C
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {inspectRecord.vitals.systolicBP}/{inspectRecord.vitals.diastolicBP}
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Pulse Rate</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {inspectRecord.vitals.pulseRate} bpm
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Resp. Rate</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {inspectRecord.vitals.respiratoryRate}/min
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Oxygen (SpO2)</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {inspectRecord.vitals.spO2}%
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-white text-center">
                    <span className="text-slate-400 block text-[10px]">Triage Acuity</span>
                    <span className="font-medium text-xs text-amber-700">
                      {inspectRecord.triageAcuity.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Workup & Diagnosis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase text-[11px] font-mono tracking-wider">
                  Physician Consultation & Diagnostic Form
                </h4>
                <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attending Cadre:</span>
                    <span className="font-medium text-slate-900">{inspectRecord.doctorCadre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Diagnosis:</span>
                    <span className="font-bold text-teal-900">
                      {inspectRecord.primaryDiagnosis.conditionName} ({inspectRecord.primaryDiagnosis.icd10})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lab Confirmation:</span>
                    <span className="font-mono text-slate-800">{inspectRecord.labTestPerformed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OPD Wait Time:</span>
                    <span className="font-mono text-slate-800">{inspectRecord.waitTimeMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Duration:</span>
                    <span className="font-mono text-slate-800">{inspectRecord.consultationDurationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Final Disposition:</span>
                    <span className="font-medium text-slate-900">{inspectRecord.disposition}</span>
                  </div>
                </div>
              </div>

              {/* Demographics & Payment */}
              <div>
                <h4 className="font-semibold text-slate-900 uppercase text-[11px] font-mono tracking-wider mb-2">
                  Demographic & Socioeconomic Context
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Age Cohort</span>
                    <span className="font-medium text-slate-900">{inspectRecord.ageCohort} ({inspectRecord.age}y)</span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Payment Modality</span>
                    <span className="font-medium text-slate-900">{inspectRecord.paymentMethod}</span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Catchment Distance</span>
                    <span className="font-medium text-slate-900">{inspectRecord.residenceDistanceKm} km</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg cursor-pointer"
              >
                Close Encounter Form
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

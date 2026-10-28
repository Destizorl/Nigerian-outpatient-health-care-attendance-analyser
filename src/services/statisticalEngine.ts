/**
 * Statistical Computing Engine for Patient Attendance Analysis System (PAAS)
 * Implements rigorous descriptive statistics, contingency table cross-tabulations,
 * Chi-Square test of independence with assumption validation, and effect sizes.
 */

import { CleanOPDRecord, ChiSquareTestResult, DescriptiveSummaryResult } from '../types/hospital';

/**
 * Gamma function approximation for Chi-Square distribution p-value
 */
function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;
  
  // Incomplete gamma series/continued fraction approximation
  if (x < a + 1.0) {
    let ap = a;
    let sum = 1.0 / a;
    let del = sum;
    for (let n = 1; n <= 100; n++) {
      ap += 1.0;
      del = (del * x) / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 3.0e-7) {
        break;
      }
    }
    // log gamma
    const gln = logGamma(a);
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  } else {
    // Continued fraction
    let b = x + 1.0 - a;
    let c = 1.0 / 1.0e-30;
    let d = 1.0 / b;
    let h = d;
    for (let i = 1; i <= 100; i++) {
      const an = -i * (i - a);
      b += 2.0;
      d = an * d + b;
      if (Math.abs(d) < 1.0e-30) d = 1.0e-30;
      c = b + an / c;
      if (Math.abs(c) < 1.0e-30) c = 1.0e-30;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 3.0e-7) break;
    }
    const gln = logGamma(a);
    return 1.0 - Math.exp(-x + a * Math.log(x) - gln) * h;
  }
}

function logGamma(z: number): number {
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    y += 1.0;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Chi-Square cumulative distribution upper-tail p-value
 * P(X >= chiSquareStat)
 */
export function chiSquarePValue(chiSquare: number, df: number): number {
  if (chiSquare <= 0 || df <= 0) return 1.0;
  const p = 1.0 - gammp(df / 2.0, chiSquare / 2.0);
  return Math.max(0.00001, Math.min(1.0, Math.round(p * 100000) / 100000));
}

/**
 * Execute Chi-Square Test of Independence on two categorical variables
 */
export function performChiSquareTest(
  records: CleanOPDRecord[],
  varXField: keyof CleanOPDRecord | 'diseaseCategory',
  varYField: keyof CleanOPDRecord | 'department',
  alpha: number = 0.05
): ChiSquareTestResult {
  // Extract values
  const getVal = (r: CleanOPDRecord, field: string): string => {
    if (field === 'diseaseCategory') return r.primaryDiagnosis?.category || 'Uncategorized';
    if (field === 'department') return r.department || 'GOPD';
    if (field === 'season') return r.season;
    if (field === 'gender') return r.gender;
    if (field === 'ageCohort') return r.ageCohort;
    if (field === 'triageAcuity') return r.triageAcuity.split('(')[0].trim();
    if (field === 'paymentMethod') return r.paymentMethod.split('/')[0].trim();
    if (field === 'dayOfWeek') return r.dayOfWeek;
    return String((r as any)[field] || 'Unknown');
  };

  const eligibleRecords = records.filter(r => r.isEligible);
  const totalN = eligibleRecords.length;

  // Distinct labels
  const rawRows = Array.from(new Set(eligibleRecords.map(r => getVal(r, varXField as string)))).filter(Boolean).slice(0, 8);
  const rawCols = Array.from(new Set(eligibleRecords.map(r => getVal(r, varYField as string)))).filter(Boolean).slice(0, 8);

  const rows = rawRows.sort();
  const cols = rawCols.sort();

  const rCount = rows.length;
  const cCount = cols.length;

  // Initialize Observed matrix
  const observed: number[][] = Array.from({ length: rCount }, () => Array(cCount).fill(0));

  eligibleRecords.forEach(rec => {
    const rVal = getVal(rec, varXField as string);
    const cVal = getVal(rec, varYField as string);
    const rIdx = rows.indexOf(rVal);
    const cIdx = cols.indexOf(cVal);
    if (rIdx >= 0 && cIdx >= 0) {
      observed[rIdx][cIdx] += 1;
    }
  });

  // Calculate row and column totals
  const rowTotals: number[] = observed.map(row => row.reduce((sum, val) => sum + val, 0));
  const colTotals: number[] = Array(cCount).fill(0);
  for (let c = 0; c < cCount; c++) {
    for (let r = 0; r < rCount; r++) {
      colTotals[c] += observed[r][c];
    }
  }

  const grandTotal = rowTotals.reduce((sum, val) => sum + val, 0) || 1;

  // Calculate Expected matrix & Cochran criteria
  const expected: number[][] = Array.from({ length: rCount }, () => Array(cCount).fill(0));
  let cellsUnder5Count = 0;
  let hasCellUnder1 = false;
  let chiSquareStat = 0;

  for (let r = 0; r < rCount; r++) {
    for (let c = 0; c < cCount; c++) {
      const expVal = (rowTotals[r] * colTotals[c]) / grandTotal;
      expected[r][c] = Math.round(expVal * 100) / 100;

      if (expVal < 5) cellsUnder5Count++;
      if (expVal < 1) hasCellUnder1 = true;

      if (expVal > 0) {
        const diff = observed[r][c] - expVal;
        chiSquareStat += (diff * diff) / expVal;
      }
    }
  }

  const totalCells = rCount * cCount;
  const cellsUnder5Percentage = totalCells > 0 ? Math.round((cellsUnder5Count / totalCells) * 100) : 0;
  const cochransAssumptionMet = !hasCellUnder1 && cellsUnder5Percentage <= 20;

  const df = Math.max(1, (rCount - 1) * (cCount - 1));
  chiSquareStat = Math.round(chiSquareStat * 100) / 100;

  const pValue = chiSquarePValue(chiSquareStat, df);
  const isStatisticallySignificant = pValue < alpha;

  // Cramér's V
  const minDim = Math.min(rCount - 1, cCount - 1);
  const cramersVRaw = minDim > 0 && grandTotal > 0
    ? Math.sqrt(chiSquareStat / (grandTotal * minDim))
    : 0;
  const cramersV = Math.round(Math.min(1.0, cramersVRaw) * 1000) / 1000;

  let effectSizeInterpretation: 'Negligible' | 'Small' | 'Medium' | 'Large' = 'Negligible';
  if (cramersV >= 0.35) effectSizeInterpretation = 'Large';
  else if (cramersV >= 0.20) effectSizeInterpretation = 'Medium';
  else if (cramersV >= 0.10) effectSizeInterpretation = 'Small';

  const friendlyX = String(varXField);
  const friendlyY = String(varYField);

  const researchQuestion = `Is there a statistically significant association between ${friendlyX} and ${friendlyY} among recorded outpatient visits?`;
  const nullHypothesis = `H₀: There is no association between ${friendlyX} and ${friendlyY} in outpatient encounters (they are statistically independent).`;
  const altHypothesis = `H₁: There is a statistically significant association between ${friendlyX} and ${friendlyY} (distribution is non-independent).`;

  let plainLanguageInterpretation = '';
  if (isStatisticallySignificant) {
    plainLanguageInterpretation = `A statistically significant association was observed between ${friendlyX} and ${friendlyY} (χ²(${df}) = ${chiSquareStat}, p = ${pValue < 0.001 ? '< 0.001' : pValue.toFixed(4)}, α = ${alpha}). The strength of association is ${effectSizeInterpretation.toLowerCase()} (Cramér's V = ${cramersV}). While statistically significant, this association reflects outpatient encounter patterns and does not establish clinical causality or population-level disease incidence.`;
  } else {
    plainLanguageInterpretation = `No statistically significant association was observed between ${friendlyX} and ${friendlyY} at the α = ${alpha} level (χ²(${df}) = ${chiSquareStat}, p = ${pValue.toFixed(4)}). The null hypothesis of independence cannot be rejected.`;
  }

  let methodologicalLimitations = 'Observations represent healthcare facility attendances and are subject to referral patterns, hospital accessibility, and service availability. Encounters cannot be treated as unique population individuals.';
  if (!cochransAssumptionMet) {
    methodologicalLimitations += ` Warning: ${cellsUnder5Percentage}% of contingency cells have expected counts < 5 (Cochran recommendation: <= 20%). Consider aggregating smaller diagnostic or demographic groups.`;
  }

  return {
    testName: 'Chi-Square Test of Independence',
    variableX: friendlyX,
    variableY: friendlyY,
    researchQuestion,
    nullHypothesis,
    altHypothesis,
    alpha,
    contingencyTable: {
      rows,
      cols,
      observed,
      expected,
      rowTotals,
      colTotals,
      grandTotal
    },
    chiSquareStat,
    degreesOfFreedom: df,
    pValue,
    isStatisticallySignificant,
    cramersV,
    effectSizeInterpretation,
    cochransAssumptionMet,
    cellsUnder5ExpectedCount: cellsUnder5Count,
    cellsUnder5Percentage,
    plainLanguageInterpretation,
    methodologicalLimitations
  };
}

/**
 * Calculate standard descriptive statistics for a numerical column
 */
export function calculateDescriptiveStats(
  values: number[],
  varName: string
): DescriptiveSummaryResult {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
  const missing = values.length - valid.length;
  const n = valid.length;

  if (n === 0) {
    return {
      variableName: varName,
      sampleSizeN: 0,
      missingCount: missing,
      missingPercentage: 100
    };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, cur) => acc + cur, 0);
  const mean = Math.round((sum / n) * 100) / 100;

  const variance = sorted.reduce((acc, cur) => acc + Math.pow(cur - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  const median = n % 2 === 0
    ? Math.round(((sorted[n / 2 - 1] + sorted[n / 2]) / 2) * 100) / 100
    : sorted[Math.floor(n / 2)];

  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = Math.round((q3 - q1) * 100) / 100;

  return {
    variableName: varName,
    sampleSizeN: n,
    missingCount: missing,
    missingPercentage: Math.round((missing / values.length) * 100),
    mean,
    stdDev,
    median,
    iqr,
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

export const calculateChiSquareTest = performChiSquareTest;


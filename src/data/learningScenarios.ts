/**
 * Interactive Learning Scenarios for Nigerian Public Hospital Outpatient Analytics.
 * Guides users through exploratory data analysis, data cleaning impact, and drawing meaningful conclusions.
 */

export interface LearningScenario {
  id: string;
  number: string;
  title: string;
  hospitalTarget: string;
  context: string;
  clinicalEpidemiologyProblem: string;
  dataInvestigationSteps: {
    stepNumber: number;
    title: string;
    actionDescription: string;
    oodmQueryPreset: {
      facilityId?: string;
      season?: string;
      diseaseCategory?: string;
      minAge?: number;
      maxAge?: number;
      gender?: string;
      nhiaOnly?: boolean;
      dayOfWeek?: string;
      acuity?: string;
    };
    expectedFinding: string;
    interpretationGuidance: string;
  }[];
  discussionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  policyTakeaway: string;
}

export const LEARNING_SCENARIOS: LearningScenario[] = [
  {
    id: 'scenario-malaria-surge',
    number: 'Case 01',
    title: 'The June–July Monsoon Pediatric Malaria Surge',
    hospitalTarget: 'University College Hospital (UCH) Ibadan & FMC Owerri',
    context: 'In southern Nigerian ecological zones, torrential rainfall from May to July leads to abundant Anopheles mosquito breeding sites in blocked gutters, discarded containers, and peri-urban agricultural zones.',
    clinicalEpidemiologyProblem: 'Every June, the Chief Medical Director (CMD) observes an acute stock-out of Artemisinin-based Combination Therapies (ACTs) and IV Artesunate, accompanied by 3-hour waiting room overflows in the Children\'s Emergency and Pediatric OPD.',
    dataInvestigationSteps: [
      {
        stepNumber: 1,
        title: 'Examine Seasonal Attendance by Disease',
        actionDescription: 'Filter records for "Rainy" season and compare the volume of "Malaria & Parasitic" cases against "Cardiovascular & Hypertension".',
        oodmQueryPreset: {
          season: 'Rainy',
          diseaseCategory: 'Malaria & Parasitic'
        },
        expectedFinding: 'Malaria accounts for over 48% of all presentations during the rainy season, whereas it drops below 22% during the dry season.',
        interpretationGuidance: 'Vector-borne transmission surges create an acute seasonal elasticity in pharmaceutical demand that static annual hospital budgets fail to accommodate.'
      },
      {
        stepNumber: 2,
        title: 'Analyze Pediatric Age Vulnerability (Under-5 Cohort)',
        actionDescription: 'Narrow the query to patients aged 0 to 4 years during the Rainy season.',
        oodmQueryPreset: {
          season: 'Rainy',
          diseaseCategory: 'Malaria & Parasitic',
          maxAge: 4
        },
        expectedFinding: 'Under-5 children account for >55% of all Severe Malaria cases with hyperpyrexia (temp > 38.5°C), with higher rates of inpatient ward admission.',
        interpretationGuidance: 'Lack of acquired immunity in children under 5 makes them high-acuity patients who cannot tolerate prolonged OPD waiting queues.'
      },
      {
        stepNumber: 3,
        title: 'Evaluate Out-of-Pocket Payment Delay',
        actionDescription: 'Inspect admission rates among uninsured out-of-pocket pediatric patients versus NHIA-covered children.',
        oodmQueryPreset: {
          season: 'Rainy',
          maxAge: 4
        },
        expectedFinding: 'Uninsured families present on average 2.8 days later, resulting in a 3.1x higher rate of emergency ward admission compared to insured children.',
        interpretationGuidance: 'Out-of-pocket costs act as a financial barrier that delays hospital presentation until the child is critically ill.'
      }
    ],
    discussionQuestions: [
      {
        question: 'What is the most effective operational intervention to prevent June drug stock-outs?',
        options: [
          'Order equal quantities of antimalarials in each quarter of the year',
          'Deploy seasonal buffer stocking with 60% procurement frontloaded into April',
          'Ration antimalarials strictly to adult patients to conserve supplies',
          'Discontinue routine RDT testing to speed up queue clearance'
        ],
        correctIndex: 1,
        explanation: 'Frontloading procurement in April before the monsoon rains begin aligns supply chain availability with the predictable epidemiological spike in Anopheles vector transmission.'
      },
      {
        question: 'Why did the raw hospital records show severe diagnosis nomenclature errors for malaria?',
        options: [
          'Doctors deliberately used fake codes to bypass hospital billing audits',
          'Paper registry clerks abbreviated lab entries as "Malaria ++" and "MP +ve" without standardized ICD-10 coding',
          'Malaria does not exist in standard WHO classification tables',
          'All Nigerian laboratory tests are uncalibrated'
        ],
        correctIndex: 1,
        explanation: 'Real-world hospital tally sheets frequently use clinical shorthand (e.g. "+" for parasitemia density). Data cleaning via regular expression entity resolution is necessary to map these to ICD-10 B54.'
      }
    ],
    policyTakeaway: 'Predictable seasonal surges require Dynamic Epidemiological Resource Allocation rather than static annual budget allocations. Linking the OODM seasonal attribute directly to inventory re-order formulas prevents preventable child mortality.'
  },
  {
    id: 'scenario-monday-jam',
    number: 'Case 02',
    title: 'The "Nigerian Monday Surge" & Operational Waiting Bottlenecks',
    hospitalTarget: 'Lagos University Teaching Hospital (LUTH) & National Hospital Abuja',
    context: 'Public tertiary hospitals in Nigeria operate on an 8:00 AM - 4:00 PM routine consultation schedule on weekdays, while weekends only operate emergency casualty suites with skeletal staffing.',
    clinicalEpidemiologyProblem: 'On Monday mornings between 7:30 AM and 11:00 AM, the central records hall and triage station experience chaotic overcrowding. Average wait time reaches 195 minutes before a patient sees a doctor, causing patient disputes and Left Against Medical Advice (LAMA) departures.',
    dataInvestigationSteps: [
      {
        stepNumber: 1,
        title: 'Quantify Day-of-Week Volume Imbalance',
        actionDescription: 'Filter the attendance dataset for Monday and examine the total volume and average waiting duration.',
        oodmQueryPreset: {
          dayOfWeek: 'Monday'
        },
        expectedFinding: 'Monday attendance represents nearly 32% of total weekly OPD volume, with average wait times exceeding 180 minutes.',
        interpretationGuidance: 'Patients who fall ill over the weekend avoid expensive private emergency clinics and defer care until the public clinic opens Monday.'
      },
      {
        stepNumber: 2,
        title: 'Inspect Triage Acuity Breakdown on Mondays',
        actionDescription: 'Check whether Monday patients have higher clinical urgency or routine complaints.',
        oodmQueryPreset: {
          dayOfWeek: 'Monday',
          acuity: 'Standard Routine (Green)'
        },
        expectedFinding: 'Over 68% of Monday attendees are actually Standard Routine (Green) and Non-Urgent (Blue) cases, yet they block urgent patients from timely triage.',
        interpretationGuidance: 'The absence of pre-triage queue separation creates an undifferentiated bottleneck where mild and severe cases compete for the same vital-sign stations.'
      }
    ],
    discussionQuestions: [
      {
        question: 'Which OODM state machine modification would best reduce the Monday morning records bottleneck?',
        options: [
          'Close the OPD on Mondays and only admit patients on Wednesdays',
          'Implement Fast-Track Decentralized Triage: Route routine prescription refills to nursing suites while routing febrile/urgent cases directly to doctor cubicles',
          'Double the consultation fees on Mondays to discourage people from coming',
          'Stop recording vital signs (blood pressure and temperature) on high-volume days'
        ],
        correctIndex: 1,
        explanation: 'De-coupling routine repeat medication refills (Green/Blue) from clinical workups reduces load on doctors and accelerates acute patient identification.'
      }
    ],
    policyTakeaway: 'Public hospital waiting room crises are primarily queueing architecture failures. By modeling the patient encounter as discrete OODM state transitions, management can identify whether the constraint lies in Paper Card Retrieval, Triage Nursing, or Doctor Cubicle availability.'
  },
  {
    id: 'scenario-harmattan-respiratory',
    number: 'Case 03',
    title: 'Harmattan Dust Influx & Northern Respiratory Morbidity',
    hospitalTarget: 'Aminu Kano Teaching Hospital (AKTH) Kano',
    context: 'Between November and February, the North-East trade winds carry fine desert dust particulates (Harmattan haze) across Northern Nigeria, causing extreme atmospheric dryness, cold nights, and heavy particulate pollution.',
    clinicalEpidemiologyProblem: 'Clinicians at AKTH Kano report an influx of pediatric and geriatric patients presenting with persistent dry cough, wheezing, and fever. The hospital must distinguish between seasonal allergic airway irritation and epidemic bacterial meningitis or bronchopneumonia.',
    dataInvestigationSteps: [
      {
        stepNumber: 1,
        title: 'Filter AKTH Kano During Harmattan Season',
        actionDescription: 'Select AKTH Kano during the "Harmattan" season and examine the Respiratory Infections category.',
        oodmQueryPreset: {
          facilityId: 'akth-kano',
          season: 'Harmattan',
          diseaseCategory: 'Respiratory Infections'
        },
        expectedFinding: 'Respiratory presentations spike by 210% compared to the rainy season, dominating the clinical workload in Kano.',
        interpretationGuidance: 'Inhaled dust particulates damage the respiratory epithelial mucosa, increasing secondary bacterial invasion risk in cold dry weather.'
      },
      {
        stepNumber: 2,
        title: 'Compare Pediatric vs Geriatric Vulnerability to Pneumonia',
        actionDescription: 'Examine patients under 5 years and elderly patients over 65 years presenting with Bronchopneumonia (J18.9).',
        oodmQueryPreset: {
          facilityId: 'akth-kano',
          season: 'Harmattan'
        },
        expectedFinding: 'Elderly patients (65+) and infants under 1 year exhibit the highest rates of hypoxia (SpO2 < 93%) and prolonged hospital admission.',
        interpretationGuidance: 'Immune senescence and immature airway calibers make the extremes of life especially susceptible to seasonal climatic stressors.'
      }
    ],
    discussionQuestions: [
      {
        question: 'Why is it critical to validate axillary temperature readings during the Harmattan cleaning pipeline?',
        options: [
          'Thermometers malfunction in dusty weather and always report zero',
          'Rapid triage under high volume often leads to missing decimal points (e.g., 389 recorded instead of 38.9°C), which skews pyrexia alert algorithms',
          'Harmattan causes all patients to have body temperatures below 20°C',
          'Public health officials ignore temperature in respiratory cases'
        ],
        correctIndex: 1,
        explanation: 'Paper-to-digital transcription errors frequently drop decimal points. Automated cleaning pipelines must detect physiological outliers (>43°C) and apply biological rectification.'
      }
    ],
    policyTakeaway: 'Climatic variation across Nigeria creates vastly different disease burdens: while southern coastal centers battle vector-borne malaria during the rains, northern centers face airborne and particulate crises during the dry Harmattan season.'
  },
  {
    id: 'scenario-nhia-insurance-gap',
    number: 'Case 04',
    title: 'The NHIA Insurance Equity Gap & Chronic Disease Control',
    hospitalTarget: 'All Public Facilities (National Assessment)',
    context: 'The National Health Insurance Authority (NHIA) Act of 2022 aims to make health insurance mandatory for all Nigerians, yet widespread out-of-pocket spending remains the norm for over 70% of public hospital patients.',
    clinicalEpidemiologyProblem: 'Cardiovascular clinics report that hypertensive patients who pay out-of-pocket attend clinics irregularly, experience high default rates, and frequently present with stroke or hypertensive encephalopathy in the emergency OPD.',
    dataInvestigationSteps: [
      {
        stepNumber: 1,
        title: 'Examine Insurance Enrollment in Hypertension Patients',
        actionDescription: 'Filter for "Cardiovascular & Hypertension" and calculate the proportion covered by NHIA insurance.',
        oodmQueryPreset: {
          diseaseCategory: 'Cardiovascular & Hypertension'
        },
        expectedFinding: 'Over 65% of hypertensive OPD attendees pay out-of-pocket in cash for their monthly review consultations and medications.',
        interpretationGuidance: 'Out-of-pocket financing imposes a recurring monthly penalty on patients with chronic non-communicable diseases.'
      },
      {
        stepNumber: 2,
        title: 'Compare Blood Pressure Control Between Payment Groups',
        actionDescription: 'Inspect systolic and diastolic blood pressure levels between NHIA-insured and cash-paying cohorts.',
        oodmQueryPreset: {
          diseaseCategory: 'Cardiovascular & Hypertension',
          nhiaOnly: true
        },
        expectedFinding: 'Insured patients maintain more consistent follow-up, lower mean systolic BP (138 mmHg vs 162 mmHg), and lower admission rates.',
        interpretationGuidance: 'Prepayment mechanisms remove the marginal consultation fee barrier, supporting steady compliance with antihypertensive regimens.'
      }
    ],
    discussionQuestions: [
      {
        question: 'In our OODM domain model, how is the relationship between Patient and AttendanceEncounter impacted by NHIA status?',
        options: [
          'Uninsured patients cannot be modeled in an object database',
          'The PaymentMethod attribute serves as a critical moderator for encounter frequency, time-to-presentation, and disposition outcome',
          'Insurance only affects accounting departments and has zero clinical significance',
          'Insured patients always see consultants while uninsured patients never see doctors'
        ],
        correctIndex: 1,
        explanation: 'In health informatics OODM, socioeconomic and financing attributes are not mere accounting tags—they directly modulate clinical trajectories and health outcomes.'
      }
    ],
    policyTakeaway: 'Universal Health Coverage (UHC) through decentralized state health insurance schemes is an essential public health intervention that directly prevents avoidable cardiovascular morbidity in Nigerian public hospitals.'
  }
];

import { Clinic, Doctor, FamilyMember, Appointment, MedicalRecord, ClinicMetricData } from '../types';

export const SEED_CLINICS: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Apex Care Super Clinic & Diagnostics',
    area: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    distanceKm: 1.2,
    qrCodeToken: 'APEX-CARE-INDIRANAGAR-QR',
    subscriptionPlan: 'YEARLY',
    subscriptionStatus: 'ACTIVE',
    rating: 4.8,
    openHours: '08:00 AM - 09:00 PM',
    phone: '+91 80 2521 8899',
    address: '#42, 12th Main, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru'
  },
  {
    id: 'clinic-2',
    name: 'Apollo Health Clinic & Heart Care',
    area: 'Koramangala 4th Block',
    city: 'Bengaluru',
    distanceKm: 2.8,
    qrCodeToken: 'APOLLO-HEALTH-KORAMANGALA-QR',
    subscriptionPlan: 'YEARLY',
    subscriptionStatus: 'ACTIVE',
    rating: 4.9,
    openHours: '08:30 AM - 08:30 PM',
    phone: '+91 80 4110 5500',
    address: 'Plot 77, 80ft Road, Near Sony Signal, Koramangala 4th Block, Bengaluru'
  },
  {
    id: 'clinic-3',
    name: 'LifeLine Family Clinic & Ortho Center',
    area: 'HSR Layout Sector 1',
    city: 'Bengaluru',
    distanceKm: 4.1,
    qrCodeToken: 'LIFELINE-HSR-SECTOR1-QR',
    subscriptionPlan: 'MONTHLY',
    subscriptionStatus: 'ACTIVE',
    rating: 4.7,
    openHours: '09:00 AM - 08:00 PM',
    phone: '+91 80 2572 3344',
    address: '14th Main, 17th Cross, HSR Layout Sector 1, Bengaluru'
  }
];

export const SEED_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic & Diagnostics',
    name: 'Dr. Arvind Rao',
    specialization: 'General Physician & Diabetologist',
    education: 'MBBS, MD (Internal Medicine) - AIIMS',
    experienceYears: 14,
    consultationFee: 400,
    availableSlots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:15 AM', '04:30 PM', '05:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    rating: 4.9
  },
  {
    id: 'doc-2',
    clinicId: 'clinic-2',
    clinicName: 'Apollo Health Clinic & Heart Care',
    name: 'Dr. Priya Nair',
    specialization: 'Cardiologist & Heart Specialist',
    education: 'MBBS, MD, DM (Cardiology) - CMC Vellore',
    experienceYears: 18,
    consultationFee: 700,
    availableSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '05:30 PM', '06:30 PM'],
    avatar: 'https://images.unsplash.com/photo-1594824813583-0570a256980e?w=200&h=200&fit=crop&crop=face',
    rating: 4.9
  },
  {
    id: 'doc-3',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic & Diagnostics',
    name: 'Dr. Ananya Iyer',
    specialization: 'Pediatrician & Child Health',
    education: 'MBBS, MD (Pediatrics) - Grant Medical College',
    experienceYears: 9,
    consultationFee: 500,
    availableSlots: ['09:00 AM', '10:30 AM', '11:30 AM', '04:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    rating: 4.8
  },
  {
    id: 'doc-4',
    clinicId: 'clinic-3',
    clinicName: 'LifeLine Family Clinic & Ortho Center',
    name: 'Dr. Rajesh Kulkarni',
    specialization: 'Orthopedic & Joint Care',
    education: 'MBBS, MS (Orthopedics) - KEM Hospital',
    experienceYears: 16,
    consultationFee: 600,
    availableSlots: ['11:00 AM', '12:30 PM', '05:00 PM', '06:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    rating: 4.7
  },
  {
    id: 'doc-5',
    clinicId: 'clinic-2',
    clinicName: 'Apollo Health Clinic & Heart Care',
    name: 'Dr. Rohan Mehta',
    specialization: 'Dermatologist & Skin Care',
    education: 'MBBS, DVD, MD (Dermatology) - St. Johns',
    experienceYears: 11,
    consultationFee: 550,
    availableSlots: ['02:00 PM', '03:00 PM', '04:00 PM', '06:30 PM'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    rating: 4.8
  }
];

export const SEED_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    primaryPatientId: 'patient-rahul',
    name: 'Rahul Sharma',
    relation: 'Self',
    age: 32,
    gender: 'Male',
    phone: '+91 98765 43210',
    govIds: {
      pan: 'ABCPS****F',
      aadhaar: 'XXXX-XXXX-4819',
      abha: '91-8842-1920-3312',
    },
    knownConditions: ['Seasonal Allergic Rhinitis']
  },
  {
    id: 'fam-2',
    primaryPatientId: 'patient-rahul',
    name: 'Suresh Sharma',
    relation: 'Father',
    age: 64,
    gender: 'Male',
    phone: '+91 98765 43211',
    govIds: {
      pan: 'ABZPS****K',
      aadhaar: 'XXXX-XXXX-9021',
      cghs: 'CGHS-BLR-09284',
      ayushman: 'PMJAY-KA-99120',
      abha: '91-1102-4491-8820'
    },
    knownConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Mild Dyslipidemia']
  },
  {
    id: 'fam-3',
    primaryPatientId: 'patient-rahul',
    name: 'Meena Sharma',
    relation: 'Mother',
    age: 59,
    gender: 'Female',
    phone: '+91 98765 43212',
    govIds: {
      pan: 'AOYPS****M',
      aadhaar: 'XXXX-XXXX-7145',
      ayushman: 'PMJAY-KA-99121',
      abha: '91-7721-3309-1144'
    },
    knownConditions: ['Knee Osteoarthritis', 'Hypothyroidism']
  }
];

export const SEED_INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    patientId: 'patient-rahul',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arvind Rao',
    doctorSpecialty: 'General Physician & Diabetologist',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic & Diagnostics',
    clinicAddress: '#42, 12th Main, 100ft Road, Indiranagar',
    slotTime: '10:30 AM',
    slotDate: 'Today, Nov 20',
    status: 'BOOKED',
    queuePosition: 2,
    feePaid: true,
    symptoms: 'Persistent dry cough, mild fever for 2 days, chest congestion'
  },
  {
    id: 'apt-100',
    patientId: 'patient-vikram',
    patientName: 'Vikram Malhotra',
    patientPhone: '+91 98220 11990',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arvind Rao',
    doctorSpecialty: 'General Physician & Diabetologist',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic & Diagnostics',
    clinicAddress: '#42, 12th Main, 100ft Road, Indiranagar',
    slotTime: '10:00 AM',
    slotDate: 'Today, Nov 20',
    status: 'IN_CONSULTATION',
    queuePosition: 1,
    checkedInAt: '09:55 AM',
    feePaid: true,
    symptoms: 'Routine BP follow up'
  },
  {
    id: 'apt-102',
    patientId: 'patient-sneha',
    patientName: 'Sneha Patel',
    patientPhone: '+91 97110 55420',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arvind Rao',
    doctorSpecialty: 'General Physician & Diabetologist',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic & Diagnostics',
    clinicAddress: '#42, 12th Main, 100ft Road, Indiranagar',
    slotTime: '11:15 AM',
    slotDate: 'Today, Nov 20',
    status: 'CHECKED_IN',
    queuePosition: 3,
    checkedInAt: '10:15 AM',
    feePaid: true,
    symptoms: 'Gastric discomfort, nausea'
  }
];

export const SEED_MEDICAL_RECORDS: MedicalRecord[] = [
  // Father's 6-Month Longitudinal History (Suresh Sharma)
  {
    id: 'rec-f1',
    patientId: 'patient-rahul',
    patientName: 'Suresh Sharma',
    familyMemberId: 'fam-2',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic',
    doctorName: 'Dr. Arvind Rao',
    visitDate: '2026-10-18',
    type: 'BLOODWORK',
    title: 'Comprehensive Diabetic & Lipid Profile',
    isAbnormal: true,
    aiSummary: 'HbA1c decreased from 8.2% to 7.1% (Good progress). Fasting glucose 128 mg/dL. Serum Creatinine borderline at 1.1 mg/dL.',
    structuredData: {
      symptoms_diagnosis: 'Diabetic routine quarterly evaluation',
      tests: [
        { name: 'HbA1c Glycated Hemoglobin', value: '7.1%', range: '< 5.7% (Normal), 7.0-8.0% (Target)' },
        { name: 'Fasting Plasma Glucose', value: '128 mg/dL', range: '70-99 mg/dL' },
        { name: 'Serum Creatinine', value: '1.1 mg/dL', range: '0.7 - 1.2 mg/dL' },
        { name: 'Total Cholesterol', value: '188 mg/dL', range: '< 200 mg/dL' }
      ]
    }
  },
  {
    id: 'rec-f2',
    patientId: 'patient-rahul',
    patientName: 'Suresh Sharma',
    familyMemberId: 'fam-2',
    clinicId: 'clinic-2',
    clinicName: 'Apollo Health Clinic',
    doctorName: 'Dr. Priya Nair',
    visitDate: '2026-08-12',
    type: 'SCAN',
    title: '12-Lead Resting ECG & Echocardiogram',
    isAbnormal: false,
    aiSummary: 'Normal sinus rhythm (72 bpm). Mild Left Ventricular Hypertrophy consistent with longstanding hypertension. Ejection Fraction 60%.',
    structuredData: {
      symptoms_diagnosis: 'Hypertensive cardiac surveillance',
      findings: 'LVEF 60%, no regional wall motion abnormalities, normal valves.'
    }
  },
  {
    id: 'rec-f3',
    patientId: 'patient-rahul',
    patientName: 'Suresh Sharma',
    familyMemberId: 'fam-2',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic',
    doctorName: 'Dr. Arvind Rao',
    visitDate: '2026-06-25',
    type: 'PRESCRIPTION',
    title: 'Hypertension & Glycemic Control Regimen',
    isAbnormal: false,
    aiSummary: 'Prescribed Metformin 500mg ER twice daily, Telmisartan 40mg once daily in morning, Atorvastatin 10mg at bedtime.',
    structuredData: {
      symptoms_diagnosis: 'Type 2 Diabetes Mellitus with Stage 1 Hypertension',
      medicines: [
        { name: 'Metformin 500mg ER', dosage: '1 tab', frequency: 'Twice daily with meals', duration: '90 days' },
        { name: 'Telmisartan 40mg', dosage: '1 tab', frequency: 'Once daily (morning)', duration: '90 days' },
        { name: 'Atorvastatin 10mg', dosage: '1 tab', frequency: 'Once daily at night', duration: '90 days' }
      ],
      recommended_tests_scans: ['HbA1c after 3 months', 'Urine Microalbumin/Creatinine Ratio'],
      follow_up_notes: 'Maintain low sodium diet (< 2g/day) and 30 mins brisk walking daily.'
    }
  },
  // Mother's Records (Meena Sharma)
  {
    id: 'rec-m1',
    patientId: 'patient-rahul',
    patientName: 'Meena Sharma',
    familyMemberId: 'fam-3',
    clinicId: 'clinic-3',
    clinicName: 'LifeLine Ortho Center',
    doctorName: 'Dr. Rajesh Kulkarni',
    visitDate: '2026-09-04',
    type: 'SCAN',
    title: 'Bilateral Knee X-Ray (Standing AP/Lateral)',
    isAbnormal: true,
    aiSummary: 'Grade 2 Osteoarthritis medial compartment narrowing in both knees. Advised quadriceps strengthening and weight management.',
    structuredData: {
      symptoms_diagnosis: 'Bilateral knee pain on ascending stairs',
      findings: 'Joint space narrowing, early osteophyte formation.'
    }
  },
  {
    id: 'rec-m2',
    patientId: 'patient-rahul',
    patientName: 'Meena Sharma',
    familyMemberId: 'fam-3',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic',
    doctorName: 'Dr. Arvind Rao',
    visitDate: '2026-07-15',
    type: 'BLOODWORK',
    title: 'Thyroid Function Test (T3, T4, TSH)',
    isAbnormal: false,
    aiSummary: 'TSH is 2.8 uIU/mL (Well controlled on Thyronorm 50 mcg).',
    structuredData: {
      symptoms_diagnosis: 'Routine hypothyroidism monitoring',
      tests: [{ name: 'TSH', value: '2.8 uIU/mL', range: '0.4 - 4.5 uIU/mL' }]
    }
  },
  // Rahul Sharma's Records
  {
    id: 'rec-r1',
    patientId: 'patient-rahul',
    patientName: 'Rahul Sharma',
    familyMemberId: 'fam-1',
    clinicId: 'clinic-1',
    clinicName: 'Apex Care Super Clinic',
    doctorName: 'Dr. Arvind Rao',
    visitDate: '2026-05-10',
    type: 'BLOODWORK',
    title: 'Annual Executive Health Panel & Vitamins',
    isAbnormal: true,
    aiSummary: 'Vitamin D3 is deficient at 14.2 ng/mL (Normal: 30-100). Vitamin B12 normal at 420 pg/mL. CBC normal.',
    structuredData: {
      symptoms_diagnosis: 'Fatigue and seasonal allergies',
      tests: [
        { name: 'Vitamin D3 (25-OH)', value: '14.2 ng/mL', range: '30 - 100 ng/mL (Deficient)' },
        { name: 'Vitamin B12', value: '420 pg/mL', range: '200 - 900 pg/mL' },
        { name: 'Hemoglobin', value: '14.8 g/dL', range: '13.0 - 17.0 g/dL' }
      ]
    }
  }
];

export const SEED_CLINIC_METRICS: ClinicMetricData = {
  clinicId: 'clinic-1',
  clinicName: 'Apex Care Super Clinic & Diagnostics',
  todayBooked: 24,
  todayCheckedIn: 18,
  todayCompleted: 14,
  todayNoShows: 2,
  monthlyRevenue: 348000,
  recurringPatientRate: 68,
  areaBreakdown: [
    { area: 'Indiranagar (0-2 km)', patients: 450 },
    { area: 'Domlur & Old Airport Rd (2-4 km)', patients: 280 },
    { area: 'Koramangala (4-5 km)', patients: 140 },
    { area: 'Other areas (> 5 km)', patients: 65 }
  ],
  aiGrowthSuggestions: [
    {
      category: 'REVENUE',
      title: 'Monetize 34% Unscreened Diabetic Patients for Microalbuminuria',
      description: 'Of 210 diabetic patients treated in last 90 days, 72 have not had a renal microalbumin screening. Automated WhatsApp nudges can bring ₹43,200 lab revenue and safeguard renal health.',
      projectedImpact: '+ ₹43,200/mo Lab Revenue'
    },
    {
      category: 'OPERATIONS',
      title: 'Buffer Evening Slot Bottlenecks with Dynamic Queue Smoothing',
      description: 'Average wait time between 05:30 PM - 07:00 PM spikes to 32 minutes vs 11 minutes in morning. Shifting non-acute reviews to 03:00 PM-04:30 PM slots reduces peak overcrowding by 40%.',
      projectedImpact: '- 65% Patient Wait Complaints'
    },
    {
      category: 'RETENTION',
      title: 'Automated 30-Day Chronic Medication Refill Recall',
      description: 'Hypertensive & diabetic recurring patient retention drops at Day 45. Introducing automated digital refill prescription reminders will boost repeat pharmacy & consult volume by 22%.',
      projectedImpact: '+ 22% Recurring Visits'
    }
  ],
  isAiGenerated: true,
  isDemoData: false
};

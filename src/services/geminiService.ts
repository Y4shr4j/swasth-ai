import {
  StructuredPrescription,
  AIHealthReport,
  ClinicMetricData,
  FamilyMember,
  MedicalRecord,
  PreSurgicalSummary,
} from '../types';

/**
 * All Gemini AI requests route through the Node.js backend (/api/gemini/*).
 * No API keys are ever stored, bundled, or sent from frontend JavaScript.
 *
 * If the app is hosted on static hosting (e.g. Firebase Hosting without a linked
 * Cloud Run backend), /api/* returns HTML instead of JSON. In that case, we never
 * expose raw JSON parse errors in the UI — instead we return clearly-labeled
 * Sample Data (Offline Mode) responses (isDemoData: true).
 */

async function postJsonOrNull<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; errorMessage?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Static host rewrite returned HTML (no backend attached)
      return { ok: false, status: 503 };
    }

    const parsed = await response.json();
    if (!response.ok) {
      return { ok: false, status: response.status, errorMessage: parsed?.message || parsed?.error };
    }
    return { ok: true, data: parsed as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function callVoicePrescription(transcript: string, _unusedKey?: string): Promise<StructuredPrescription> {
  const res = await postJsonOrNull<StructuredPrescription>('/api/gemini/voice-prescription', { transcript });
  if (res.ok) return res.data;

  return {
    symptoms_diagnosis: 'Acute Upper Respiratory Tract Infection with mild bronchospasm',
    medicines: [
      { name: 'Amoxicillin-Clavulanate 625mg', dosage: '1 tab', frequency: 'Twice daily after meals', duration: '5 days' },
      { name: 'Levocetirizine 5mg', dosage: '1 tab', frequency: 'Once daily at night', duration: '5 days' },
      { name: 'Salbutamol Inhaler (100mcg)', dosage: '2 puffs', frequency: 'As needed (SOS)', duration: '5 days' },
    ],
    recommended_tests_scans: ['Complete Blood Count (CBC)', 'Chest X-Ray (PA View) if cough persists beyond 5 days'],
    follow_up_notes: 'Review in 5 days if fever does not subside. Hydrate well. Avoid cold drinks.',
    ai_confidence: 'high',
    is_ai_draft: true,
    is_demo_data: true,
  };
}

export async function callHealthReport(
  familyMember: FamilyMember,
  records: MedicalRecord[],
  dateRange: string,
  _unusedKey?: string
): Promise<AIHealthReport> {
  const res = await postJsonOrNull<AIHealthReport>('/api/gemini/health-report', {
    patientId: familyMember.primaryPatientId,
    familyMemberName: familyMember.name,
    knownConditions: familyMember.knownConditions,
    records: records.map(r => ({
      title: r.title,
      type: r.type,
      visitDate: r.visitDate,
      aiSummary: r.aiSummary,
      structuredData: r.structuredData,
    })),
    dateRange,
  });
  if (res.ok) return res.data;

  const isFather = familyMember.relation === 'Father';
  const isMother = familyMember.relation === 'Mother';

  return {
    id: `report-${Date.now()}`,
    patientId: familyMember.primaryPatientId,
    patientName: familyMember.name,
    period: dateRange,
    generatedAt: new Date().toISOString(),
    chronic_conditions: isFather
      ? [
          'Type 2 Diabetes Mellitus (HbA1c improved from 8.2% to 7.1%)',
          'Essential Hypertension (Controlled on Telmisartan 40mg)',
          'Mild Dyslipidemia (Total Cholesterol 188 mg/dL)',
        ]
      : isMother
      ? [
          'Bilateral Knee Osteoarthritis (Grade 2 medial compartment narrowing)',
          'Primary Hypothyroidism (Controlled on Thyronorm 50mcg)',
        ]
      : ['Seasonal Allergic Rhinitis', 'Vitamin D3 Deficiency (14.2 ng/mL)'],
    medication_history: isFather
      ? [
          { drug: 'Metformin 500mg ER', status: 'Active', adherence: 'Regular' },
          { drug: 'Telmisartan 40mg', status: 'Active', adherence: 'Regular' },
          { drug: 'Atorvastatin 10mg', status: 'Active', adherence: 'Regular' },
        ]
      : isMother
      ? [
          { drug: 'Thyronorm 50mcg', status: 'Active', adherence: 'Regular' },
          { drug: 'Calcium + Vitamin D3', status: 'Active', adherence: 'Irregular' },
        ]
      : [{ drug: 'Levocetirizine 5mg', status: 'As needed', adherence: 'Occasional' }],
    abnormal_lab_trends: isFather
      ? [
          'Serum Creatinine: 1.1 mg/dL (Borderline — monitor renal profile quarterly)',
          'Fasting Glucose: 128 mg/dL (Improved from 164 mg/dL, still above target)',
        ]
      : isMother
      ? ['Bilateral knee joint space narrowing noted on standing X-ray']
      : ['Vitamin D3: 14.2 ng/mL (Below 30 ng/mL reference range)'],
    severity_flags: isFather
      ? [
          { level: 'MODERATE', note: 'Annual diabetic retinopathy eye screening overdue by 2 months' },
          { level: 'LOW', note: 'Urine microalbumin/creatinine ratio screening pending' },
        ]
      : isMother
      ? [{ level: 'MODERATE', note: 'Review physiotherapy & joint-strengthening progress' }]
      : [{ level: 'LOW', note: 'Retest Vitamin D3 after supplementation course' }],
    doctor_discussion_points: isFather
      ? [
          'Schedule diabetic retinopathy fundus exam',
          'Order urine microalbumin/creatinine ratio',
          'Discuss fasting glucose trend (128 mg/dL)',
        ]
      : isMother
      ? ['Discuss knee osteoarthritis physiotherapy options', 'Confirm Thyronorm 50mcg maintenance dose']
      : ['Review Vitamin D3 supplementation plan', 'Discuss seasonal allergy prevention'],
    disclaimer: 'AI-Generated Summary • For Clinical Review Only • Not a Medical Diagnosis',
    isAiGenerated: true,
    isDemoData: true,
  };
}

export async function callClinicGrowth(metrics: ClinicMetricData, _unusedKey?: string): Promise<ClinicMetricData> {
  const res = await postJsonOrNull<ClinicMetricData>('/api/gemini/clinic-growth', { metrics });
  if (res.ok) return res.data;

  return {
    ...metrics,
    isAiGenerated: true,
    isDemoData: true,
  };
}

export async function callPreSurgicalSummary(
  familyMember: FamilyMember,
  records: MedicalRecord[],
  clinicId: string
): Promise<PreSurgicalSummary> {
  const res = await postJsonOrNull<PreSurgicalSummary>('/api/gemini/pre-surgical-summary', {
    patientId: familyMember.primaryPatientId,
    clinicId,
    familyMemberName: familyMember.name,
    knownConditions: familyMember.knownConditions,
    records: records.map(r => ({
      title: r.title,
      type: r.type,
      visitDate: r.visitDate,
      aiSummary: r.aiSummary,
      structuredData: r.structuredData,
    })),
  });

  // Preserve real backend 403 consent enforcement errors
  if (!res.ok && res.status === 403) {
    throw new Error(res.errorMessage || 'Patient consent is required before generating a pre-surgical summary.');
  }
  if (res.ok) return res.data;

  // Clean, explicitly badged offline/static-host fallback (never shows raw HTML/JSON parse errors)
  const rxMeds = records
    .filter(r => r.type === 'PRESCRIPTION' && Array.isArray(r.structuredData?.medicines))
    .flatMap(r => r.structuredData.medicines.map((m: any) => `${m.name} (${m.dosage}, ${m.frequency})`));

  const diagList = records
    .filter(r => r.type === 'BLOODWORK' || r.type === 'SCAN')
    .map(r => `${r.visitDate}: ${r.title}${r.aiSummary ? ` — ${r.aiSummary}` : ''}`);

  return {
    id: `presurg-${Date.now()}`,
    patientId: familyMember.primaryPatientId,
    patientName: familyMember.name,
    generatedAt: new Date().toISOString(),
    medical_history_overview:
      familyMember.knownConditions.length > 0
        ? familyMember.knownConditions
        : ['No chronic medical conditions documented in available records'],
    allergies: ['None documented in available records (verify directly with patient)'],
    current_medications:
      rxMeds.length > 0 ? rxMeds : ['No active prescriptions documented in available records'],
    recent_diagnostics:
      diagList.length > 0 ? diagList : ['No recent diagnostic reports on file'],
    previous_surgeries: ['None documented in available records (verify directly with patient)'],
    disclaimer:
      'AI-Generated Summary • Requires Qualified Surgeon Review • Does NOT provide surgical risk scores or surgical clearance.',
    isAiGenerated: true,
    isDemoData: true,
    liveGemini: false,
  };
}

export async function uploadMedicalDocument(payload: {
  base64Data: string;
  mimeType: string;
  fileName: string;
  patientId: string;
  patientName: string;
  familyMemberId: string;
  docType: 'PRESCRIPTION' | 'SCAN' | 'BLOODWORK';
  title: string;
  clinicName: string;
  visitDate: string;
}): Promise<MedicalRecord> {
  const res = await postJsonOrNull<MedicalRecord>('/api/documents', payload);
  if (res.ok) return res.data;

  // Clean static-host fallback so document upload works smoothly even on Firebase Hosting
  const id = `doc-local-${Date.now()}`;
  return {
    id,
    patientId: payload.patientId,
    patientName: payload.patientName,
    familyMemberId: payload.familyMemberId,
    clinicId: 'clinic-uploaded',
    clinicName: payload.clinicName || 'Uploaded Past Record',
    doctorName: 'Self-Uploaded',
    visitDate: payload.visitDate || new Date().toISOString().slice(0, 10),
    type: payload.docType,
    title: payload.title || payload.fileName,
    aiSummary: `Document "${payload.fileName}" added to ${payload.patientName}'s vault. Connect backend for persistent cloud storage and live Gemini extraction. Doctor review recommended.`,
    isAbnormal: false,
    structuredData: {
      isDemoData: true,
      uploadedFileName: payload.fileName,
      ...(payload.docType === 'BLOODWORK'
        ? {
            tests: [
              { name: 'Haemoglobin', value: '13.5 g/dL', range: '12.0 - 16.0 g/dL' },
              { name: 'WBC Count', value: '7,200 cells/uL', range: '4,000 - 11,000 cells/uL' },
            ],
          }
        : {}),
    },
  };
}

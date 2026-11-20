import { StructuredPrescription, AIHealthReport, ClinicMetricData, FamilyMember, MedicalRecord } from '../types';

/**
 * All Gemini AI requests are routed strictly through the Node.js backend (/api/gemini/*).
 * No API keys are ever stored, bundled, or sent from frontend JavaScript.
 */

export async function callVoicePrescription(transcript: string, _unusedKey?: string): Promise<StructuredPrescription> {
  const response = await fetch('/api/gemini/voice-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!response.ok) {
    throw new Error(`Voice prescription request failed (${response.status})`);
  }
  return await response.json();
}

export async function callHealthReport(
  familyMember: FamilyMember,
  records: MedicalRecord[],
  dateRange: string,
  _unusedKey?: string
): Promise<AIHealthReport> {
  const response = await fetch('/api/gemini/health-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    }),
  });
  if (!response.ok) {
    throw new Error(`AI health report request failed (${response.status})`);
  }
  return await response.json();
}

export async function callClinicGrowth(metrics: ClinicMetricData, _unusedKey?: string): Promise<ClinicMetricData> {
  const response = await fetch('/api/gemini/clinic-growth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics }),
  });
  if (!response.ok) {
    throw new Error(`Clinic growth analysis failed (${response.status})`);
  }
  return await response.json();
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
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Document upload failed (${response.status})`);
  }
  return await response.json();
}

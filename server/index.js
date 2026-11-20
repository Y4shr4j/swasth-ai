'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ─── Load .env (server-side only) ────────────────────────────────────────────
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = val;
    }
  }
}
loadEnvFile();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ─── Directories for Persistence & Uploaded Documents ────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Seed Initial Persistent State ───────────────────────────────────────────
const INITIAL_DB = {
  appointments: [
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
      symptoms: 'Persistent dry cough, mild fever for 2 days, chest congestion',
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
      symptoms: 'Routine BP follow up',
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
      symptoms: 'Gastric discomfort, nausea',
    },
  ],
  medicalRecords: [
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
      aiSummary:
        'HbA1c decreased from 8.2% to 7.1% (Good progress). Fasting glucose 128 mg/dL. Serum Creatinine borderline at 1.1 mg/dL.',
      structuredData: {
        symptoms_diagnosis: 'Diabetic routine quarterly evaluation',
        tests: [
          { name: 'HbA1c Glycated Hemoglobin', value: '7.1%', range: '< 5.7% (Normal), 7.0-8.0% (Target)' },
          { name: 'Fasting Plasma Glucose', value: '128 mg/dL', range: '70-99 mg/dL' },
          { name: 'Serum Creatinine', value: '1.1 mg/dL', range: '0.7 - 1.2 mg/dL' },
          { name: 'Total Cholesterol', value: '188 mg/dL', range: '< 200 mg/dL' },
        ],
      },
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
      aiSummary:
        'Normal sinus rhythm (72 bpm). Mild Left Ventricular Hypertrophy consistent with longstanding hypertension. Ejection Fraction 60%.',
      structuredData: {
        symptoms_diagnosis: 'Hypertensive cardiac surveillance',
        findings: 'LVEF 60%, no regional wall motion abnormalities, normal valves.',
      },
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
      aiSummary:
        'Prescribed Metformin 500mg ER twice daily, Telmisartan 40mg once daily in morning, Atorvastatin 10mg at bedtime.',
      structuredData: {
        symptoms_diagnosis: 'Type 2 Diabetes Mellitus with Stage 1 Hypertension',
        medicines: [
          { name: 'Metformin 500mg ER', dosage: '1 tab', frequency: 'Twice daily with meals', duration: '90 days' },
          { name: 'Telmisartan 40mg', dosage: '1 tab', frequency: 'Once daily (morning)', duration: '90 days' },
          { name: 'Atorvastatin 10mg', dosage: '1 tab', frequency: 'Once daily at night', duration: '90 days' },
        ],
        recommended_tests_scans: ['HbA1c after 3 months', 'Urine Microalbumin/Creatinine Ratio'],
        follow_up_notes: 'Maintain low sodium diet (< 2g/day) and 30 mins brisk walking daily.',
      },
    },
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
      aiSummary:
        'Grade 2 Osteoarthritis medial compartment narrowing in both knees. Advised quadriceps strengthening and weight management.',
      structuredData: {
        symptoms_diagnosis: 'Bilateral knee pain on ascending stairs',
        findings: 'Joint space narrowing, early osteophyte formation.',
      },
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
        tests: [{ name: 'TSH', value: '2.8 uIU/mL', range: '0.4 - 4.5 uIU/mL' }],
      },
    },
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
      aiSummary:
        'Vitamin D3 is deficient at 14.2 ng/mL (Normal: 30-100). Vitamin B12 normal at 420 pg/mL. CBC normal.',
      structuredData: {
        symptoms_diagnosis: 'Fatigue and seasonal allergies',
        tests: [
          { name: 'Vitamin D3 (25-OH)', value: '14.2 ng/mL', range: '30 - 100 ng/mL (Deficient)' },
          { name: 'Vitamin B12', value: '420 pg/mL', range: '200 - 900 pg/mL' },
          { name: 'Hemoglobin', value: '14.8 g/dL', range: '13.0 - 17.0 g/dL' },
        ],
      },
    },
  ],
  consentRequests: [],
  whatsappMessages: [],
  aiHealthReport: null,
  uploadedFiles: {},
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return { ...INITIAL_DB, ...parsed };
    }
  } catch (err) {
    console.error('[db] Failed to read db.json, using initial seed:', err.message);
  }
  saveDb(INITIAL_DB);
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

let db = loadDb();

// ─── Real-Time Sync via Server-Sent Events (SSE) ─────────────────────────────
const sseClients = new Set();

function broadcastState(eventType = 'state_update') {
  const payload = JSON.stringify({
    eventType,
    appointments: db.appointments,
    medicalRecords: db.medicalRecords,
    consentRequests: db.consentRequests,
    whatsappMessages: db.whatsappMessages,
    aiHealthReport: db.aiHealthReport,
    timestamp: new Date().toISOString(),
  });
  for (const res of sseClients) {
    res.write(`event: ${eventType}\ndata: ${payload}\n\n`);
  }
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  res.write(
    `event: connected\ndata: ${JSON.stringify({
      appointments: db.appointments,
      medicalRecords: db.medicalRecords,
      consentRequests: db.consentRequests,
      whatsappMessages: db.whatsappMessages,
      aiHealthReport: db.aiHealthReport,
    })}\n\n`
  );

  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// ─── Health & State Endpoints ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    persistence: 'disk-json',
    realTimeSync: 'sse',
    connectedClients: sseClients.size,
  });
});

app.get('/api/state', (req, res) => {
  res.json({
    appointments: db.appointments,
    medicalRecords: db.medicalRecords,
    consentRequests: db.consentRequests,
    whatsappMessages: db.whatsappMessages,
    aiHealthReport: db.aiHealthReport,
  });
});

// ─── Appointments & Live Queue Routes ────────────────────────────────────────
app.post('/api/appointments', (req, res) => {
  const apt = req.body;
  if (!apt || !apt.id || !apt.patientId) {
    return res.status(400).json({ error: 'Invalid appointment payload' });
  }
  db.appointments.push(apt);
  saveDb(db);
  broadcastState('appointments_updated');
  res.status(201).json(apt);
});

app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status, checkedInAt, queuePosition } = req.body || {};
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });

  db.appointments[idx] = {
    ...db.appointments[idx],
    ...(status ? { status } : {}),
    ...(checkedInAt ? { checkedInAt } : {}),
    ...(typeof queuePosition === 'number' ? { queuePosition } : {}),
  };
  saveDb(db);
  broadcastState('appointments_updated');
  res.json(db.appointments[idx]);
});

// ─── Notifications Route ─────────────────────────────────────────────────────
app.post('/api/notifications', (req, res) => {
  const msg = req.body;
  if (!msg || !msg.id) return res.status(400).json({ error: 'Invalid notification' });
  db.whatsappMessages.push(msg);
  saveDb(db);
  broadcastState('notifications_updated');
  res.status(201).json(msg);
});

// ─── Records Route (Doctor Verified Prescriptions) ───────────────────────────
app.post('/api/records', (req, res) => {
  const rec = req.body;
  if (!rec || !rec.id || !rec.patientId) return res.status(400).json({ error: 'Invalid medical record' });
  db.medicalRecords.push(rec);
  saveDb(db);
  broadcastState('records_updated');
  res.status(201).json(rec);
});

// ─── Consent Gate Routes & Backend Enforcement ───────────────────────────────
function hasApprovedConsent(patientId, clinicId, scope) {
  return db.consentRequests.some(
    c =>
      c.patientId === patientId &&
      c.clinicId === clinicId &&
      c.status === 'APPROVED' &&
      (!scope || c.scope === scope || c.scope === 'ALL_MEDICAL_RECORDS')
  );
}

app.post('/api/consent', (req, res) => {
  const reqObj = req.body;
  if (!reqObj || !reqObj.patientId || !reqObj.clinicId) {
    return res.status(400).json({ error: 'patientId and clinicId are required' });
  }
  const consent = {
    ...reqObj,
    id: reqObj.id || `consent-${Date.now()}`,
    status: 'PENDING',
    requestedAt: reqObj.requestedAt || new Date().toISOString(),
  };
  db.consentRequests.push(consent);
  saveDb(db);
  broadcastState('consent_updated');
  res.status(201).json(consent);
});

app.patch('/api/consent/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!['APPROVED', 'DENIED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be APPROVED or DENIED' });
  }
  const idx = db.consentRequests.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Consent request not found' });

  db.consentRequests[idx] = {
    ...db.consentRequests[idx],
    status,
    respondedAt: new Date().toISOString(),
  };
  saveDb(db);
  broadcastState('consent_updated');
  res.json(db.consentRequests[idx]);
});

// Strict Backend-Enforced Patient Records Access
app.get('/api/patients/:patientId/records', (req, res) => {
  const { patientId } = req.params;
  const { role, clinicId } = req.query;

  if (role !== 'PATIENT') {
    if (!clinicId || !hasApprovedConsent(patientId, String(clinicId))) {
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message:
          'Access denied. Patient has not approved access for this clinic/partner. Pending or denied requests cannot view medical records.',
      });
    }
  }

  const records = db.medicalRecords.filter(r => r.patientId === patientId);
  return res.json({ patientId, count: records.length, records });
});

// ─── Persistent Medical Document Upload & Retrieval ──────────────────────────
const ALLOWED_MIMES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

app.post('/api/documents', async (req, res) => {
  const {
    base64Data,
    mimeType,
    fileName,
    patientId = 'patient-rahul',
    patientName = 'Rahul Sharma',
    familyMemberId = 'fam-1',
    docType = 'BLOODWORK',
    title,
    clinicName,
    visitDate,
  } = req.body || {};

  if (!base64Data || !mimeType || !fileName) {
    return res.status(400).json({ error: 'base64Data, mimeType, and fileName are required' });
  }
  if (!ALLOWED_MIMES.has(mimeType)) {
    return res.status(400).json({ error: 'Unsupported file type. Allowed: PDF, PNG, JPEG, WebP' });
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return res.status(413).json({ error: 'File exceeds 10 MB limit' });
  }

  const id = `doc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const ext = mimeType === 'application/pdf' ? '.pdf' : mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
  const storedName = `${id}${ext}`;
  const filePath = path.join(UPLOADS_DIR, storedName);
  fs.writeFileSync(filePath, buffer);

  db.uploadedFiles[id] = {
    id,
    patientId,
    fileName,
    storedName,
    mimeType,
    sizeBytes: buffer.length,
    uploadedAt: new Date().toISOString(),
  };

  // Run Gemini multimodal extraction server-side
  const extracted = await runDocumentExtraction(base64Data, mimeType, docType, fileName);

  const newRecord = {
    id,
    patientId,
    patientName,
    familyMemberId,
    clinicId: 'clinic-uploaded',
    clinicName: clinicName || 'Uploaded Past Record',
    doctorName: 'Self-Uploaded',
    visitDate: visitDate || new Date().toISOString().slice(0, 10),
    type: docType,
    title: title || fileName,
    fileUrl: `/api/documents/${id}/file?role=PATIENT`,
    aiSummary: extracted.aiSummary,
    isAbnormal: extracted.isAbnormal,
    structuredData: {
      ...extracted.structuredData,
      isDemoData: extracted.isDemoData,
      liveGemini: !extracted.isDemoData,
      uploadedFileName: fileName,
    },
  };

  db.medicalRecords.push(newRecord);
  saveDb(db);
  broadcastState('records_updated');
  res.status(201).json(newRecord);
});

app.get('/api/documents/:id/file', (req, res) => {
  const { id } = req.params;
  const { role, clinicId } = req.query;
  const meta = db.uploadedFiles[id];
  if (!meta) return res.status(404).json({ error: 'Document not found' });

  if (role !== 'PATIENT') {
    if (!clinicId || !hasApprovedConsent(meta.patientId, String(clinicId))) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Not authorized to access this document' });
    }
  }

  const filePath = path.join(UPLOADS_DIR, meta.storedName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Stored file missing on disk' });

  res.setHeader('Content-Type', meta.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${meta.fileName.replace(/"/g, '')}"`);
  fs.createReadStream(filePath).pipe(res);
});

// ─── Demo / Fallback Data (ALWAYS explicitly marked isDemoData: true) ────────
const VOICE_PRESCRIPTION_FALLBACK = {
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
  liveGemini: false,
};

const HEALTH_REPORT_FALLBACK = {
  chronic_conditions: [
    'Type 2 Diabetes Mellitus (HbA1c trending down: 8.2% → 7.1%)',
    'Essential Hypertension (Controlled on Telmisartan 40mg)',
    'Mild Dyslipidemia (Cholesterol 188 mg/dL)',
  ],
  medication_history: [
    { drug: 'Metformin 500mg ER', status: 'Active', adherence: 'Regular' },
    { drug: 'Telmisartan 40mg', status: 'Active', adherence: 'Regular' },
    { drug: 'Atorvastatin 10mg', status: 'Active', adherence: 'Regular' },
  ],
  abnormal_lab_trends: [
    'Serum Creatinine: 1.1 mg/dL (Borderline — monitor renal profile quarterly)',
    'Fasting Glucose: 128 mg/dL (Improved from 164 mg/dL, still above target)',
  ],
  severity_flags: [
    { level: 'MODERATE', note: 'Annual diabetic retinopathy eye screening overdue by 2 months' },
    { level: 'LOW', note: 'Microalbuminuria screening not yet completed this cycle' },
  ],
  doctor_discussion_points: [
    'Schedule diabetic retinopathy fundus exam',
    'Order urine microalbumin/creatinine ratio',
    'Consider dose optimization if fasting glucose stays above 120 mg/dL',
  ],
  disclaimer: 'AI-Generated Summary • For Clinical Review Only • Not a Medical Diagnosis',
};

const CLINIC_GROWTH_FALLBACK_SUGGESTIONS = [
  {
    category: 'REVENUE',
    title: 'Introduce Preventive Diabetic Screening Bundles',
    description: 'Bundle HbA1c, lipid profile, and microalbuminuria into quarterly packages for recurring chronic patients.',
    projectedImpact: '+12% monthly revenue within 60 days',
  },
  {
    category: 'OPERATIONS',
    title: 'Smooth Evening Slot Congestion',
    description: 'Shift non-urgent follow-ups from 5:30 PM–7:00 PM to 3:00 PM–4:30 PM to cut peak wait times.',
    projectedImpact: '-40% peak wait times',
  },
  {
    category: 'RETENTION',
    title: 'Automated 30-Day Refill Recall Reminders',
    description: 'Send proactive follow-up reminders before chronic prescriptions lapse at Day 30.',
    projectedImpact: '+18% recurring patient retention',
  },
];

// ─── Helper: Strip Markdown Fences & Call Gemini Server-Side ─────────────────
function stripCodeFences(text) {
  return String(text || '')
    .replace(/^```[a-zA-Z]*\n?/m, '')
    .replace(/```\s*$/m, '')
    .trim();
}

const GEMINI_MODEL_CANDIDATES = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

async function callGemini(systemInstruction, parts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set on server');
  }
  const { GoogleGenAI } = require('@google/genai');
  const genAI = new GoogleGenAI({ apiKey });

  let lastError = null;
  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      const response = await Promise.race([
        genAI.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${model} timed out after 12s`)), 12000)),
      ]);
      const raw = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) || '';
      const parsed = JSON.parse(stripCodeFences(raw));
      return { ...parsed, _modelUsed: model };
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] ${model} failed (${err.status || err.message}), trying next model...`);
    }
  }
  throw lastError || new Error('All Gemini models failed');
}

async function runDocumentExtraction(base64Data, mimeType, docType, fileName) {
  try {
    const systemInstruction = `You are a medical document extraction assistant for SwasthAI.
Extract factual data from the uploaded ${docType} document.
Rules:
- Never invent missing values.
- Preserve exact units and values.
- Do not diagnose diseases or recommend medicines.
- Include a disclaimer that a doctor should review the extracted information.
Return ONLY valid JSON:
{
  "aiSummary": "string",
  "isAbnormal": boolean,
  "tests": [{"name":"string","value":"string","range":"string"}],
  "medicines": [{"name":"string","dosage":"string","frequency":"string","duration":"string"}]
}`;
    const parsed = await callGemini(systemInstruction, [
      { text: `Analyze this uploaded ${docType} file named "${fileName}".` },
      { inlineData: { mimeType, data: base64Data } },
    ]);
    return {
      aiSummary: parsed.aiSummary || `Extracted from ${fileName}. Doctor review recommended.`,
      isAbnormal: Boolean(parsed.isAbnormal),
      structuredData: {
        ...(parsed.tests?.length ? { tests: parsed.tests } : {}),
        ...(parsed.medicines?.length ? { medicines: parsed.medicines } : {}),
      },
      isDemoData: false,
    };
  } catch (err) {
    console.error('[analyze-document] Gemini error:', err.message);
    return {
      aiSummary: `Uploaded ${docType.toLowerCase()} (${fileName}) stored safely. Sample extraction fallback shown (live Gemini unavailable). Doctor review required.`,
      isAbnormal: false,
      structuredData:
        docType === 'BLOODWORK'
          ? {
              tests: [
                { name: 'Haemoglobin', value: '13.5 g/dL', range: '12.0 - 16.0 g/dL' },
                { name: 'WBC Count', value: '7,200 cells/uL', range: '4,000 - 11,000 cells/uL' },
              ],
            }
          : {},
      isDemoData: true,
      errorReason: err.message,
    };
  }
}

// ─── Gemini Route 1: Voice Prescription ──────────────────────────────────────
app.post('/api/gemini/voice-prescription', async (req, res) => {
  const { transcript } = req.body || {};
  if (!transcript || !String(transcript).trim()) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  try {
    const systemInstruction = `You are a clinical documentation assistant for SwasthAI.
Extract structured prescription data from the doctor's consultation transcript.
Rules: Never invent medicines not mentioned. Mark as AI draft requiring doctor verification.
Return ONLY valid JSON:
{
  "symptoms_diagnosis": "string",
  "medicines": [{"name":"string","dosage":"string","frequency":"string","duration":"string"}],
  "recommended_tests_scans": ["string"],
  "follow_up_notes": "string",
  "ai_confidence": "high|medium",
  "is_ai_draft": true
}`;
    const result = await callGemini(systemInstruction, [
      { text: `Doctor consultation transcript:\n\n${transcript}` },
    ]);
    return res.json({
      ...result,
      is_ai_draft: true,
      is_demo_data: false,
      liveGemini: true,
    });
  } catch (err) {
    console.error('[voice-prescription] Gemini error:', err.message);
    return res.json({
      ...VOICE_PRESCRIPTION_FALLBACK,
      errorReason: err.message,
    });
  }
});

// ─── Gemini Route 2: Consolidated Family AI Health Report ────────────────────
app.post('/api/gemini/health-report', async (req, res) => {
  const { familyMemberName, knownConditions = [], records = [], dateRange, patientId = 'patient-rahul' } = req.body || {};

  const recordSummary = records
    .map((r, i) => `${i + 1}. ${r.title} (${r.type}, ${r.visitDate}): ${r.aiSummary || 'No summary'}`)
    .join('\n');

  const baseFields = {
    id: `report-${Date.now()}`,
    patientId,
    patientName: familyMemberName || 'Patient',
    period: dateRange || 'Last 6 Months',
    generatedAt: new Date().toISOString(),
    isAiGenerated: true,
  };

  try {
    const systemInstruction = `You are a clinical summarization assistant for SwasthAI.
Synthesize the patient's historical medical records into a longitudinal summary.
Rules: Do not diagnose new diseases or prescribe medicines. Include the clinical review disclaimer.
Return ONLY valid JSON:
{
  "chronic_conditions": ["string"],
  "medication_history": [{"drug":"string","status":"string","adherence":"string"}],
  "abnormal_lab_trends": ["string"],
  "severity_flags": [{"level":"LOW|MODERATE|HIGH","note":"string"}],
  "doctor_discussion_points": ["string"],
  "disclaimer": "AI-Generated Summary • For Clinical Review Only • Not a Medical Diagnosis"
}`;
    const userPrompt = `Patient: ${familyMemberName}\nKnown Conditions: ${knownConditions.join(', ') || 'None'}\nDate Range: ${dateRange}\n\nMedical Records:\n${recordSummary}`;
    const result = await callGemini(systemInstruction, [{ text: userPrompt }]);
    const report = { ...result, ...baseFields, isDemoData: false, liveGemini: true };
    db.aiHealthReport = report;
    saveDb(db);
    broadcastState('report_updated');
    return res.json(report);
  } catch (err) {
    console.error('[health-report] Gemini error:', err.message);
    const fallback = {
      ...HEALTH_REPORT_FALLBACK,
      ...baseFields,
      isDemoData: true,
      liveGemini: false,
      errorReason: err.message,
    };
    db.aiHealthReport = fallback;
    saveDb(db);
    broadcastState('report_updated');
    return res.json(fallback);
  }
});

// ─── Gemini Route 3: Clinic AI Growth Suggestions ────────────────────────────
app.post('/api/gemini/clinic-growth', async (req, res) => {
  const { metrics } = req.body || {};
  try {
    const systemInstruction = `You are a healthcare clinic growth strategist for SwasthAI.
Analyze the clinic's operational metrics and return exactly 3 actionable growth strategies (REVENUE, OPERATIONS, RETENTION).
Return ONLY valid JSON:
{
  "aiGrowthSuggestions": [
    {"category":"REVENUE|OPERATIONS|RETENTION","title":"string","description":"string","projectedImpact":"string"}
  ]
}`;
    const userPrompt = `Clinic: ${metrics?.clinicName}
Today Booked: ${metrics?.todayBooked}
Today Checked In: ${metrics?.todayCheckedIn}
Completed: ${metrics?.todayCompleted}
No-Shows: ${metrics?.todayNoShows}
Monthly Revenue: ₹${metrics?.monthlyRevenue}
Recurring Patient Rate: ${metrics?.recurringPatientRate}%
Area Breakdown: ${JSON.stringify(metrics?.areaBreakdown || [])}`;

    const result = await callGemini(systemInstruction, [{ text: userPrompt }]);
    return res.json({
      ...metrics,
      aiGrowthSuggestions: result.aiGrowthSuggestions || CLINIC_GROWTH_FALLBACK_SUGGESTIONS,
      isAiGenerated: true,
      isDemoData: false,
      liveGemini: true,
    });
  } catch (err) {
    console.error('[clinic-growth] Gemini error:', err.message);
    return res.json({
      ...metrics,
      aiGrowthSuggestions: CLINIC_GROWTH_FALLBACK_SUGGESTIONS,
      isAiGenerated: true,
      isDemoData: true,
      liveGemini: false,
      errorReason: err.message,
    });
  }
});

// ─── Static Frontend (Production / Cloud Run) ────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`SwasthAI backend listening on port ${PORT}`);
  console.log(`Server-side GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT SET'}`);
});

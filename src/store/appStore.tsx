import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  UserRole, Appointment, ConsentRequest, MedicalRecord,
  SimulatedWhatsAppMessage, AIHealthReport, ClinicMetricData,
  StructuredPrescription
} from '../types';
import {
  SEED_INITIAL_APPOINTMENTS, SEED_MEDICAL_RECORDS, SEED_CLINIC_METRICS
} from '../data/seedData';

export interface NavEntry {
  role: UserRole;
  tab: string;
}

export const DEFAULT_TAB_BY_ROLE: Record<UserRole, string> = {
  PATIENT: 'home',
  DOCTOR: 'queue',
  RECEPTIONIST: 'queue',
  ADMIN: 'overview',
  DIAGNOSTIC: 'lookup',
};

export interface AppState {
  role: UserRole;
  activeTab: string;
  navHistory: NavEntry[];
  appointments: Appointment[];
  consentRequests: ConsentRequest[];
  medicalRecords: MedicalRecord[];
  whatsappMessages: SimulatedWhatsAppMessage[];
  geminiApiKey: string; // Kept empty — server holds GEMINI_API_KEY
  serverGeminiReady: boolean;
  isLoading: boolean;
  loadingMessage: string;
  aiHealthReport: AIHealthReport | null;
  clinicGrowthData: ClinicMetricData;
  activePrescriptionDraft: StructuredPrescription | null;
  activePatientForDoctor: string | null;
}

type Action =
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'GO_BACK' }
  | { type: 'SET_GEMINI_KEY'; payload: string }
  | { type: 'SET_SERVER_GEMINI_READY'; payload: boolean }
  | { type: 'SYNC_SERVER_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT_STATUS'; payload: { id: string; status: Appointment['status']; checkedInAt?: string; queuePosition?: number } }
  | { type: 'ADD_CONSENT_REQUEST'; payload: ConsentRequest }
  | { type: 'RESPOND_CONSENT'; payload: { id: string; status: 'APPROVED' | 'DENIED' } }
  | { type: 'ADD_WHATSAPP_MESSAGE'; payload: SimulatedWhatsAppMessage }
  | { type: 'SET_AI_HEALTH_REPORT'; payload: AIHealthReport }
  | { type: 'SET_CLINIC_GROWTH'; payload: ClinicMetricData }
  | { type: 'SET_PRESCRIPTION_DRAFT'; payload: StructuredPrescription | null }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ACTIVE_PATIENT'; payload: string | null }
  | { type: 'ADD_MEDICAL_RECORD'; payload: MedicalRecord };

const initialState: AppState = {
  role: 'PATIENT',
  activeTab: 'home',
  navHistory: [],
  appointments: [...SEED_INITIAL_APPOINTMENTS],
  consentRequests: [],
  medicalRecords: [...SEED_MEDICAL_RECORDS],
  whatsappMessages: [],
  geminiApiKey: '',
  serverGeminiReady: false,
  isLoading: false,
  loadingMessage: '',
  aiHealthReport: {
    id: 'report-seed-suresh',
    patientId: 'patient-rahul',
    patientName: 'Suresh Sharma',
    period: 'Last 6 Months',
    generatedAt: '2026-11-20T09:00:00.000Z',
    chronic_conditions: [
      'Type 2 Diabetes Mellitus (HbA1c improved from 8.2% to 7.1%)',
      'Essential Hypertension (Controlled on Telmisartan 40mg)',
      'Mild Dyslipidemia (Total Cholesterol 188 mg/dL)',
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
      { level: 'LOW', note: 'Urine microalbumin/creatinine ratio screening pending' },
    ],
    doctor_discussion_points: [
      'Schedule diabetic retinopathy fundus exam',
      'Order urine microalbumin/creatinine ratio',
      'Discuss fasting glucose trend (128 mg/dL)',
    ],
    disclaimer: 'AI-Generated Summary • For Clinical Review Only • Not a Medical Diagnosis',
    isAiGenerated: true,
    isDemoData: true,
  },
  clinicGrowthData: { ...SEED_CLINIC_METRICS },
  activePrescriptionDraft: null,
  activePatientForDoctor: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE': {
      const nextRole = action.payload;
      const nextTab = DEFAULT_TAB_BY_ROLE[nextRole];
      if (state.role === nextRole && state.activeTab === nextTab) return state;
      return {
        ...state,
        role: nextRole,
        activeTab: nextTab,
        navHistory: [...state.navHistory, { role: state.role, tab: state.activeTab }],
      };
    }
    case 'SET_TAB': {
      const nextTab = action.payload;
      if (state.activeTab === nextTab) return state;
      return {
        ...state,
        activeTab: nextTab,
        navHistory: [...state.navHistory, { role: state.role, tab: state.activeTab }],
      };
    }
    case 'GO_BACK': {
      if (state.navHistory.length === 0) return state;
      const prev = state.navHistory[state.navHistory.length - 1];
      return {
        ...state,
        role: prev.role,
        activeTab: prev.tab,
        navHistory: state.navHistory.slice(0, -1),
      };
    }
    case 'SET_GEMINI_KEY':
      return state; // Never store API keys in frontend state
    case 'SET_SERVER_GEMINI_READY':
      return { ...state, serverGeminiReady: action.payload };
    case 'SYNC_SERVER_STATE':
      return {
        ...state,
        appointments: action.payload.appointments ?? state.appointments,
        medicalRecords: action.payload.medicalRecords ?? state.medicalRecords,
        consentRequests: action.payload.consentRequests ?? state.consentRequests,
        whatsappMessages: action.payload.whatsappMessages ?? state.whatsappMessages,
        aiHealthReport: action.payload.aiHealthReport ?? state.aiHealthReport,
      };
    case 'ADD_APPOINTMENT':
      if (state.appointments.some(a => a.id === action.payload.id)) return state;
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT_STATUS':
      return {
        ...state,
        appointments: state.appointments.map(a =>
          a.id === action.payload.id
            ? {
                ...a,
                status: action.payload.status,
                checkedInAt: action.payload.checkedInAt ?? a.checkedInAt,
                queuePosition: action.payload.queuePosition ?? a.queuePosition,
              }
            : a
        ),
      };
    case 'ADD_CONSENT_REQUEST':
      if (state.consentRequests.some(c => c.id === action.payload.id)) return state;
      return { ...state, consentRequests: [...state.consentRequests, action.payload] };
    case 'RESPOND_CONSENT':
      return {
        ...state,
        consentRequests: state.consentRequests.map(c =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      };
    case 'ADD_WHATSAPP_MESSAGE':
      if (state.whatsappMessages.some(m => m.id === action.payload.id)) return state;
      return { ...state, whatsappMessages: [...state.whatsappMessages, action.payload] };
    case 'SET_AI_HEALTH_REPORT':
      return { ...state, aiHealthReport: action.payload };
    case 'SET_CLINIC_GROWTH':
      return { ...state, clinicGrowthData: action.payload };
    case 'SET_PRESCRIPTION_DRAFT':
      return { ...state, activePrescriptionDraft: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload.isLoading, loadingMessage: action.payload.message ?? '' };
    case 'SET_ACTIVE_PATIENT':
      return { ...state, activePatientForDoctor: action.payload };
    case 'ADD_MEDICAL_RECORD':
      if (state.medicalRecords.some(r => r.id === action.payload.id)) return state;
      return { ...state, medicalRecords: [...state.medicalRecords, action.payload] };
    default:
      return state;
  }
}

const AppStoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync with browser/mobile hardware Back button
  useEffect(() => {
    const handlePopState = () => {
      dispatch({ type: 'GO_BACK' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load persisted state + check backend health + subscribe to real-time SSE stream
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

    fetch(`${apiBase}/api/health`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) dispatch({ type: 'SET_SERVER_GEMINI_READY', payload: Boolean(data.geminiConfigured) });
      })
      .catch(() => {});

    fetch(`${apiBase}/api/state`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) dispatch({ type: 'SYNC_SERVER_STATE', payload: data });
      })
      .catch(() => {});

    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource(`${apiBase}/api/events`);
      const onSync = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          dispatch({ type: 'SYNC_SERVER_STATE', payload: data });
        } catch {
          // Ignore malformed keepalive packets
        }
      };
      evtSource.addEventListener('connected', onSync);
      evtSource.addEventListener('appointments_updated', onSync);
      evtSource.addEventListener('consent_updated', onSync);
      evtSource.addEventListener('records_updated', onSync);
      evtSource.addEventListener('notifications_updated', onSync);
      evtSource.addEventListener('report_updated', onSync);
    } catch {
      // Ignore if SSE unavailable
    }

    return () => {
      evtSource?.close();
    };
  }, []);

  // Wrap dispatch to persist mutations to backend API & push browser history entries
  const wrappedDispatch: React.Dispatch<Action> = (action) => {
    if (action.type === 'SET_ROLE' || action.type === 'SET_TAB') {
      try {
        window.history.pushState({ swasthNav: true }, '');
      } catch {
        // Ignore history restrictions
      }
    }

    // Optimistic local update
    dispatch(action);

    // Persist to backend so separate sessions/refreshes stay in sync
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    if (action.type === 'ADD_APPOINTMENT') {
      fetch(`${apiBase}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      }).catch(() => {});
    } else if (action.type === 'UPDATE_APPOINTMENT_STATUS') {
      fetch(`${apiBase}/api/appointments/${encodeURIComponent(action.payload.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      }).catch(() => {});
    } else if (action.type === 'ADD_CONSENT_REQUEST') {
      fetch(`${apiBase}/api/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      }).catch(() => {});
    } else if (action.type === 'RESPOND_CONSENT') {
      fetch(`${apiBase}/api/consent/${encodeURIComponent(action.payload.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.payload.status }),
      }).catch(() => {});
    } else if (action.type === 'ADD_WHATSAPP_MESSAGE') {
      fetch(`${apiBase}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      }).catch(() => {});
    } else if (action.type === 'ADD_MEDICAL_RECORD') {
      fetch(`${apiBase}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      }).catch(() => {});
    }
  };

  return (
    <AppStoreContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

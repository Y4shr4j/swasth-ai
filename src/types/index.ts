export type UserRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | 'DIAGNOSTIC';

export interface Clinic {
  id: string;
  name: string;
  area: string;
  city: string;
  distanceKm: number;
  qrCodeToken: string;
  subscriptionPlan: 'MONTHLY' | 'YEARLY';
  subscriptionStatus: 'ACTIVE' | 'INACTIVE';
  rating: number;
  openHours: string;
  phone: string;
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export interface Doctor {
  id: string;
  clinicId: string;
  clinicName: string;
  name: string;
  specialization: string;
  education: string;
  experienceYears: number;
  consultationFee: number;
  availableSlots: string[];
  avatar: string;
  rating: number;
}

export interface FamilyMember {
  id: string;
  primaryPatientId: string;
  name: string;
  relation: 'Self' | 'Father' | 'Mother' | 'Spouse' | 'Child';
  age: number;
  gender: string;
  phone: string;
  avatar?: string;
  govIds: {
    pan?: string;
    aadhaar?: string;
    cghs?: string;
    echs?: string;
    ayushman?: string;
    abha?: string;
  };
  insuranceDocUrl?: string;
  knownConditions: string[];
}

export type AppointmentStatus = 'BOOKED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW';

export type ConsultationMode = 'IN_CLINIC' | 'VIDEO' | 'HOME_VISIT';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  familyMemberId?: string;
  familyMemberName?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
  slotTime: string;
  slotDate: string;
  consultationMode?: ConsultationMode;
  status: AppointmentStatus;
  queuePosition: number;
  checkedInAt?: string;
  feePaid: boolean;
  symptoms?: string;
  prescriptionId?: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface StructuredPrescription {
  symptoms_diagnosis: string;
  medicines: PrescriptionMedicine[];
  recommended_tests_scans: string[];
  follow_up_notes: string;
  ai_confidence?: 'high' | 'medium';
  is_ai_draft?: boolean;
  is_demo_data?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  familyMemberId?: string;
  clinicId: string;
  clinicName: string;
  doctorName: string;
  visitDate: string;
  type: 'PRESCRIPTION' | 'SCAN' | 'BLOODWORK' | 'SYMPTOM_CHECKIN';
  title: string;
  structuredData?: StructuredPrescription | any;
  fileUrl?: string;
  aiSummary?: string;
  isAbnormal?: boolean;
}

export interface ConsentRequest {
  id: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  doctorId?: string;
  doctorName?: string;
  requesterRole: 'DOCTOR' | 'DIAGNOSTIC' | 'RECEPTIONIST';
  requesterName: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
  scope: 'FULL_AI_HEALTH_REPORT' | 'ALL_MEDICAL_RECORDS' | 'PRESCRIPTION_DISPENSE';
}

export interface AIHealthReport {
  id: string;
  patientId: string;
  patientName: string;
  period: string;
  generatedAt: string;
  chronic_conditions: string[];
  medication_history: Array<{
    drug: string;
    status: string;
    adherence: string;
  }>;
  abnormal_lab_trends: string[];
  severity_flags: Array<{
    level: 'LOW' | 'MODERATE' | 'HIGH';
    note: string;
  }>;
  doctor_discussion_points: string[];
  disclaimer: string;
  isAiGenerated: boolean;
  isDemoData: boolean;
}

export interface ClinicMetricData {
  clinicId: string;
  clinicName: string;
  todayBooked: number;
  todayCheckedIn: number;
  todayCompleted: number;
  todayNoShows: number;
  monthlyRevenue: number;
  recurringPatientRate: number; // e.g. 68%
  areaBreakdown: { area: string; patients: number }[];
  aiGrowthSuggestions: Array<{
    category: 'REVENUE' | 'OPERATIONS' | 'RETENTION';
    title: string;
    description: string;
    projectedImpact: string;
  }>;
  isAiGenerated: boolean;
  isDemoData: boolean;
}

export interface PreSurgicalSummary {
  id: string;
  patientId: string;
  patientName: string;
  generatedAt: string;
  medical_history_overview: string[];
  allergies: string[];
  current_medications: string[];
  recent_diagnostics: string[];
  previous_surgeries: string[];
  disclaimer: string;
  isAiGenerated: boolean;
  isDemoData: boolean;
  liveGemini?: boolean;
}

export interface SimulatedWhatsAppMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  type: 'BOOKING_CONFIRMATION' | 'PRESCRIPTION_DELIVERY' | 'QUEUE_ALERT' | 'REPORT_READY';
  title: string;
  body: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

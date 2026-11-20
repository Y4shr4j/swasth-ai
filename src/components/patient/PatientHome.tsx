import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_DOCTORS, SEED_FAMILY_MEMBERS } from '../../data/seedData';
import {
  QrCode,
  Calendar,
  FileText,
  Users,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Clock,
  Activity,
  Pill,
  Bell,
  Smile,
  Meh,
  Frown,
  Video,
  Home,
  Building2,
} from 'lucide-react';
import AIHealthReportModal from './AIHealthReportModal';
import QRScannerModal from './QRScannerModal';
import Avatar from '../common/Avatar';

const MODE_LABELS: Record<string, { label: string; icon: typeof Building2 }> = {
  IN_CLINIC: { label: 'In-Clinic', icon: Building2 },
  VIDEO: { label: 'Video Consult', icon: Video },
  HOME_VISIT: { label: 'Home Visit', icon: Home },
};

export default function PatientHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { state, dispatch } = useAppStore();
  const [showQR, setShowQR] = useState(false);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);

  // Medication reminder local check-off state
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Symptom check-in state
  const [checkInMemberId, setCheckInMemberId] = useState<string>(SEED_FAMILY_MEMBERS[0].id);
  const [checkInSaved, setCheckInSaved] = useState<string | null>(null);

  const myAppointment = state.appointments.find(
    a => a.patientId === 'patient-rahul' && ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(a.status)
  );
  const recentRecords = state.medicalRecords
    .filter(r => r.familyMemberId === 'fam-1' || r.patientId === 'patient-rahul')
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
    .slice(0, 2);

  // Derive medication reminder schedules strictly from doctor-approved prescriptions
  const medicationSchedule = state.medicalRecords
    .filter(r => r.type === 'PRESCRIPTION' && Array.isArray(r.structuredData?.medicines))
    .flatMap(rec =>
      (rec.structuredData.medicines as Array<{ name: string; dosage: string; frequency: string; duration: string }>).map(
        (med, idx) => ({
          key: `${rec.id}-${idx}`,
          patientName: rec.patientName,
          doctorName: rec.doctorName,
          visitDate: rec.visitDate,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        })
      )
    )
    .slice(0, 4);

  function handleCheckIn() {
    if (!myAppointment) return;
    dispatch({
      type: 'UPDATE_APPOINTMENT_STATUS',
      payload: {
        id: myAppointment.id,
        status: 'CHECKED_IN',
        checkedInAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        queuePosition: 2,
      },
    });
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`,
        recipientPhone: '+91 98765 43210',
        recipientName: myAppointment.familyMemberName || myAppointment.patientName,
        type: 'QUEUE_ALERT',
        title: 'Checked In — Apex Care Clinic',
        body: `Checked in at ${myAppointment.clinicName}.\n\nDoctor: ${myAppointment.doctorName}\nQueue Position: #2\nEstimated Wait: ~15 mins`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setShowQR(false);
    setShowCheckInSuccess(true);
    setTimeout(() => setShowCheckInSuccess(false), 3000);
  }

  function handleSendMedReminder(med: (typeof medicationSchedule)[number]) {
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-med-${Date.now()}`,
        recipientPhone: '+91 98765 43210',
        recipientName: med.patientName,
        type: 'QUEUE_ALERT',
        title: `Medication Reminder: ${med.name}`,
        body: `Patient: ${med.patientName}\nMedicine: ${med.name}\nDosage: ${med.dosage}\nSchedule: ${med.frequency} (${med.duration})\nPrescribed by ${med.doctorName}. Follow your doctor's exact prescription.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setReminderToast(`Reminder sent for ${med.name} (${med.patientName})`);
    setTimeout(() => setReminderToast(null), 3000);
  }

  function handleSymptomCheckIn(feeling: 'Better' | 'No Change' | 'Worse') {
    const member = SEED_FAMILY_MEMBERS.find(m => m.id === checkInMemberId) || SEED_FAMILY_MEMBERS[0];
    const today = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    dispatch({
      type: 'ADD_MEDICAL_RECORD',
      payload: {
        id: `checkin-${Date.now()}`,
        patientId: 'patient-rahul',
        patientName: member.name,
        familyMemberId: member.id,
        clinicId: 'clinic-self',
        clinicName: 'Patient Symptom Check-In',
        doctorName: 'Self-Reported',
        visitDate: today,
        type: 'SYMPTOM_CHECKIN',
        title: `Symptom Check-In: Feeling ${feeling}`,
        isAbnormal: feeling === 'Worse',
        aiSummary: `Logged at ${timeStr} for ${member.name}: Reported feeling "${feeling}".${
          feeling === 'Worse'
            ? ' Recorded for doctor review. Please consult your doctor if symptoms worsen.'
            : ' Saved to longitudinal family timeline.'
        }`,
        structuredData: {
          feeling,
          loggedAt: timeStr,
          familyMemberName: member.name,
        },
      },
    });

    setCheckInSaved(
      feeling === 'Worse'
        ? `Logged "Worse" for ${member.name}. Please contact your doctor for medical guidance.`
        : `Logged "${feeling}" in ${member.name}'s timeline.`
    );
    setTimeout(() => setCheckInSaved(null), 4000);
  }

  const rahulProfile = SEED_FAMILY_MEMBERS[0];
  const appointmentDoctor = myAppointment ? SEED_DOCTORS.find(d => d.id === myAppointment.doctorId) : null;
  const aptMode = myAppointment?.consultationMode || 'IN_CLINIC';
  const modeInfo = MODE_LABELS[aptMode] || MODE_LABELS.IN_CLINIC;
  const ModeIcon = modeInfo.icon;

  return (
    <div className="p-4 space-y-5">
      {/* Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Avatar
            src={rahulProfile.avatar}
            name={rahulProfile.name}
            className="w-11 h-11 rounded-full ring-2 ring-white shadow-sm"
          />
          <div>
            <h1 className="text-xl font-bold text-[#0F2A3D] leading-tight">Hello, Rahul!</h1>
            <p className="text-xs text-[#5A7184]">Your family's health, our priority.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#D6E8F7] text-[11px] font-semibold text-[#0B5D7A] shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5A4]" /> ABHA Linked
        </span>
      </div>

      {/* Success Toast */}
      {showCheckInSuccess && (
        <div className="bg-[#E6F7F5] border border-[#99E2D8] rounded-2xl p-3.5 flex items-center gap-2.5 text-[#0B5D7A] text-sm font-medium shadow-sm">
          <CheckCircle className="w-5 h-5 text-[#0EA5A4] shrink-0" />
          <span>Checked in! You are #2 in queue.</span>
        </div>
      )}

      {/* Health Overview Card (Soft Sky-Mint Gradient) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#E2F4FB] via-[#E9F7F8] to-[#E6F6F2] border border-[#CBE7F3] p-4 shadow-[0_6px_24px_rgba(11,93,122,0.06)]">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#CBE7F3" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#0EA5A4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="163.36"
                strokeDashoffset="13"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-extrabold text-[#0F2A3D]">92%</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#0B5D7A] uppercase tracking-wide flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#0EA5A4]" /> Family Health Score
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex -space-x-2">
                {SEED_FAMILY_MEMBERS.map(m => (
                  <Avatar
                    key={m.id}
                    src={m.avatar}
                    name={m.name}
                    className="w-7 h-7 rounded-full ring-2 ring-white"
                  />
                ))}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-[#0EA5A4] border border-[#BEEBE4]">
                Healthy Overall
              </span>
            </div>
            <p className="text-[11px] text-[#4A6578] mt-1">
              {SEED_FAMILY_MEMBERS.length} Family Members • {state.medicalRecords.length} vault records
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-[#0F2A3D] mb-2.5">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Stethoscope, label: 'Find a Doctor', sub: 'Zero-pay booking', action: () => onNavigate('find') },
            { icon: FileText, label: 'Health Vault', sub: 'Records & uploads', action: () => onNavigate('records') },
            { icon: Users, label: 'My Family', sub: '3 linked profiles', action: () => onNavigate('family') },
            { icon: Sparkles, label: 'AI Health Report', sub: 'Gemini synthesis', action: () => setShowAIReport(true) },
          ].map(({ icon: Icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              className="bg-white rounded-2xl border border-[#DFECF5] p-3.5 flex items-center gap-3 text-left shadow-[0_2px_12px_rgba(11,93,122,0.04)] hover:shadow-[0_6px_18px_rgba(11,93,122,0.1)] hover:border-[#AEDCF2] transition"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF6FC] text-[#0B5D7A] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F2A3D] truncate">{label}</div>
                <div className="text-[11px] text-[#5A7184] truncate">{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Appointment Card */}
      {myAppointment && (
        <div className="bg-white rounded-3xl border border-[#D6E8F7] shadow-[0_6px_22px_rgba(11,93,122,0.07)] overflow-hidden">
          <div className="bg-gradient-to-r from-[#0B5D7A] to-[#0E7490] px-4 py-2.5 flex items-center justify-between">
            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Upcoming Appointment
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">
                <ModeIcon className="w-3 h-3" /> {modeInfo.label}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  myAppointment.status === 'IN_CONSULTATION'
                    ? 'bg-[#0EA5A4] text-white'
                    : myAppointment.status === 'CHECKED_IN'
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-white/20 text-white'
                }`}
              >
                {myAppointment.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            <div className="flex items-start gap-3">
              <Avatar
                src={appointmentDoctor?.avatar}
                name={myAppointment.doctorName}
                className="w-12 h-12 rounded-2xl ring-2 ring-[#EBF6FC]"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#0F2A3D]">{myAppointment.doctorName}</div>
                <div className="text-xs text-[#0EA5A4] font-medium">{myAppointment.doctorSpecialty}</div>
                <div className="text-xs text-[#5A7184] mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0B5D7A]" />
                  <span className="truncate">
                    {myAppointment.clinicName} • {myAppointment.slotTime}
                  </span>
                </div>
                {myAppointment.familyMemberName && (
                  <div className="text-[11px] font-semibold text-[#0B5D7A] mt-1">
                    Patient: {myAppointment.familyMemberName}
                  </div>
                )}
              </div>
            </div>

            {myAppointment.status === 'BOOKED' && aptMode === 'IN_CLINIC' && (
              <button
                onClick={() => setShowQR(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#0B5D7A] text-white py-3 rounded-2xl font-semibold hover:bg-[#084961] shadow-sm transition text-sm"
              >
                <QrCode className="w-4 h-4" /> Scan Clinic QR &amp; Check In
              </button>
            )}

            {myAppointment.status === 'BOOKED' && aptMode !== 'IN_CLINIC' && (
              <div className="bg-[#EBF6FC] border border-[#AEDCF2] rounded-2xl p-3 text-xs text-[#0B5D7A] font-medium text-center">
                {aptMode === 'VIDEO'
                  ? 'Video consultation booked — doctor will initiate at your scheduled slot.'
                  : 'Home visit requested — clinic desk will coordinate arrival.'}
              </div>
            )}

            {myAppointment.status === 'CHECKED_IN' && (
              <div className="bg-[#EBF6FC] border border-[#AEDCF2] rounded-2xl p-3.5 text-center">
                <div className="text-3xl font-extrabold text-[#0B5D7A]">#{myAppointment.queuePosition}</div>
                <div className="text-xs text-[#0B5D7A] font-semibold mt-0.5">Live Queue Position</div>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#0EA5A4] animate-pulse" />
                  <span className="text-xs text-[#4A6578]">Waiting — Estimated ~15 mins</span>
                </div>
              </div>
            )}

            {myAppointment.status === 'IN_CONSULTATION' && (
              <div className="bg-[#E6F7F5] border border-[#99E2D8] rounded-2xl p-4 text-center">
                <div className="font-bold text-[#0B5D7A] text-base">It's your turn!</div>
                <div className="text-xs text-[#4A6578] mt-1">Please proceed to the consultation room.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptom Check-In Card ("How Are You Feeling?") */}
      <div className="bg-white rounded-2xl border border-[#DFECF5] p-4 shadow-[0_2px_12px_rgba(11,93,122,0.04)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0F2A3D]">How Are You Feeling?</h3>
            <p className="text-[11px] text-[#5A7184]">Log a quick check-in to the family timeline</p>
          </div>
          <select
            value={checkInMemberId}
            onChange={e => setCheckInMemberId(e.target.value)}
            className="px-2.5 py-1 bg-[#F3F8FC] border border-[#D6E8F7] rounded-lg text-xs font-semibold text-[#0F2A3D]"
          >
            {SEED_FAMILY_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name.split(' ')[0]} ({m.relation})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSymptomCheckIn('Better')}
            className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-[#E6F7F5] text-[#0B5D7A] border border-[#BEEBE4] hover:bg-[#D2F0EC] text-xs font-semibold transition"
          >
            <Smile className="w-5 h-5 text-[#0EA5A4]" />
            Better
          </button>
          <button
            onClick={() => handleSymptomCheckIn('No Change')}
            className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-[#EBF6FC] text-[#0B5D7A] border border-[#AEDCF2] hover:bg-[#D6EEF9] text-xs font-semibold transition"
          >
            <Meh className="w-5 h-5 text-[#0B5D7A]" />
            No Change
          </button>
          <button
            onClick={() => handleSymptomCheckIn('Worse')}
            className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition"
          >
            <Frown className="w-5 h-5 text-amber-600" />
            Worse
          </button>
        </div>

        {checkInSaved && (
          <div className="text-xs bg-[#EBF6FC] text-[#0B5D7A] border border-[#AEDCF2] rounded-xl px-3 py-2 font-medium">
            {checkInSaved}
          </div>
        )}
      </div>

      {/* Medication Reminders (Derived strictly from doctor-approved prescriptions) */}
      {medicationSchedule.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DFECF5] p-4 shadow-[0_2px_12px_rgba(11,93,122,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F2A3D] flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#0EA5A4]" /> Medication Reminders
            </h3>
            <span className="text-[10px] font-semibold text-[#0B5D7A] bg-[#EBF6FC] px-2 py-0.5 rounded-full">
              From Approved Rx
            </span>
          </div>

          {reminderToast && (
            <div className="text-xs bg-[#E6F7F5] text-[#0B5D7A] border border-[#99E2D8] rounded-xl px-3 py-2 font-medium">
              {reminderToast}
            </div>
          )}

          <div className="space-y-2">
            {medicationSchedule.map(med => {
              const isTaken = Boolean(takenMeds[med.key]);
              return (
                <div
                  key={med.key}
                  className={`rounded-xl border p-3 flex items-center justify-between gap-2 transition ${
                    isTaken ? 'bg-[#F3F8FC] border-[#DFECF5] opacity-75' : 'bg-white border-[#DFECF5]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isTaken ? 'line-through text-[#5A7184]' : 'text-[#0F2A3D]'}`}>
                        {med.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBF6FC] text-[#0B5D7A] font-semibold">
                        {med.patientName.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5A7184] mt-0.5">
                      {med.dosage} • {med.frequency} • {med.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSendMedReminder(med)}
                      title="Preview notification reminder"
                      className="p-1.5 rounded-lg bg-[#EBF6FC] text-[#0B5D7A] hover:bg-[#D6EEF9] transition"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTakenMeds(prev => ({ ...prev, [med.key]: !prev[med.key] }))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        isTaken
                          ? 'bg-[#0EA5A4] text-white'
                          : 'bg-[#0B5D7A] text-white hover:bg-[#084961]'
                      }`}
                    >
                      {isTaken ? 'Taken ✓' : 'Mark Taken'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#5A7184]">
            Schedules reflect verified doctor prescriptions only. Never alter dosage without physician guidance.
          </p>
        </div>
      )}

      {/* Recent Records */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#0F2A3D]">Recent Records</h3>
          <button
            onClick={() => onNavigate('records')}
            className="text-xs font-semibold text-[#0B5D7A] hover:underline flex items-center gap-0.5"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentRecords.map(rec => (
            <button
              key={rec.id}
              onClick={() => onNavigate('records')}
              className="w-full bg-white rounded-2xl border border-[#DFECF5] p-3.5 flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(11,93,122,0.04)] hover:border-[#AEDCF2] transition"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  rec.type === 'PRESCRIPTION'
                    ? 'bg-[#E6F7F5] text-[#0EA5A4]'
                    : rec.type === 'BLOODWORK'
                    ? 'bg-[#EBF6FC] text-[#0B5D7A]'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {rec.type === 'PRESCRIPTION'
                  ? 'Rx'
                  : rec.type === 'BLOODWORK'
                  ? 'Lab'
                  : rec.type === 'SYMPTOM_CHECKIN'
                  ? 'Log'
                  : 'Scan'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0F2A3D] truncate">{rec.title}</div>
                <div className="text-xs text-[#5A7184]">
                  {rec.patientName} • {rec.visitDate}
                </div>
              </div>
              {rec.isAbnormal && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  Review
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Assurance Footer Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#E6F7F5] to-[#EBF6FC] border border-[#CBE7F3] p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#0B5D7A] flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#0EA5A4]" />
        </div>
        <div className="text-xs text-[#335266] leading-snug">
          <span className="font-semibold text-[#0F2A3D]">Your records are private.</span> No clinic or pharmacy can view your history without your live in-app approval.
        </div>
      </div>

      {/* Live Mobile Camera QR Check-In Modal */}
      {showQR && (
        <QRScannerModal
          clinicName={myAppointment?.clinicName || 'Apex Care Super Clinic & Diagnostics'}
          onScanSuccess={handleCheckIn}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* AI Health Report Modal */}
      {showAIReport && <AIHealthReportModal onClose={() => setShowAIReport(false)} />}
    </div>
  );
}

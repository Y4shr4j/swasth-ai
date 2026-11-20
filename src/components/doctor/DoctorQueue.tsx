import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { UserCheck, Clock, ArrowRight, Stethoscope } from 'lucide-react';
import VoicePrescription from './VoicePrescription';
import type { Appointment } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  BOOKED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-amber-100 text-amber-700',
  IN_CONSULTATION: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-slate-100 text-slate-500',
  NO_SHOW: 'bg-red-100 text-red-700',
};

export default function DoctorQueue() {
  const { state, dispatch } = useAppStore();
  const [prescribingApt, setPrescribingApt] = useState<Appointment | null>(null);

  const clinicApts = state.appointments
    .filter(a => a.clinicId === 'clinic-1')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const counts = {
    booked: clinicApts.filter(a => a.status === 'BOOKED').length,
    checkedIn: clinicApts.filter(a => a.status === 'CHECKED_IN').length,
    inConsult: clinicApts.filter(a => a.status === 'IN_CONSULTATION').length,
    completed: clinicApts.filter(a => a.status === 'COMPLETED').length,
  };

  function handleNext() {
    // Complete current IN_CONSULTATION
    const current = clinicApts.find(a => a.status === 'IN_CONSULTATION');
    // Advance first CHECKED_IN to IN_CONSULTATION
    const next = clinicApts.find(a => a.status === 'CHECKED_IN');
    if (next) {
      dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id: next.id, status: 'IN_CONSULTATION' } });
      dispatch({
        type: 'ADD_WHATSAPP_MESSAGE',
        payload: {
          id: `wa-${Date.now()}`, recipientPhone: next.patientPhone, recipientName: next.patientName,
          type: 'QUEUE_ALERT', title: "🔔 It's Your Turn!",
          body: `Hi ${next.patientName}! The doctor is ready to see you now.\n\nPlease proceed to the consultation room.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      });
    }
  }

  if (prescribingApt) {
    return <VoicePrescription appointment={prescribingApt} onBack={() => setPrescribingApt(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dr. Arvind Rao — Live Queue</h2>
          <p className="text-sm text-slate-500">Apex Care Super Clinic, Indiranagar</p>
        </div>
        <button onClick={handleNext} disabled={counts.checkedIn === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-40">
          Next Patient <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Booked', value: counts.booked, color: 'text-blue-600 bg-blue-50' },
          { label: 'Checked In', value: counts.checkedIn, color: 'text-amber-600 bg-amber-50' },
          { label: 'In Consult', value: counts.inConsult, color: 'text-green-600 bg-green-50' },
          { label: 'Completed', value: counts.completed, color: 'text-slate-600 bg-slate-50' },
        ].map(k => (
          <div key={k.label} className={`${k.color} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs font-medium mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Queue List */}
      <div className="space-y-2">
        {clinicApts.map(apt => (
          <div key={apt.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
            apt.status === 'IN_CONSULTATION' ? 'border-green-300 ring-1 ring-green-100' : 'border-slate-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              apt.status === 'IN_CONSULTATION' ? 'bg-green-600 text-white' :
              apt.status === 'CHECKED_IN' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>#{apt.queuePosition}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">{apt.familyMemberName || apt.patientName}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF6FC] text-[#0B5D7A] border border-[#AEDCF2]">
                  {apt.consultationMode === 'VIDEO'
                    ? 'Video'
                    : apt.consultationMode === 'HOME_VISIT'
                    ? 'Home Visit'
                    : 'In-Clinic'}
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate">{apt.symptoms || 'No symptoms recorded'}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.slotTime}</span>
                {apt.checkedInAt && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />In at {apt.checkedInAt}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[apt.status]}`}>
                {apt.status.replace(/_/g, ' ')}
              </span>
              {apt.status === 'IN_CONSULTATION' && (
                <button onClick={() => setPrescribingApt(apt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  <Stethoscope className="w-3.5 h-3.5" /> Prescribe
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

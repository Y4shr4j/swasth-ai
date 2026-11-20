import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Phone, ArrowRight, Clock, Calendar, LayoutList, BarChart3 } from 'lucide-react';

const RECEPTION_TABS = [
  { id: 'queue', label: 'Live Desk Queue', icon: LayoutList },
  { id: 'calls', label: 'Call Reminders', icon: Phone },
  { id: 'stats', label: 'Desk Stats', icon: BarChart3 },
];

export default function ReceptionistApp() {
  const { state, dispatch } = useAppStore();
  const tab = RECEPTION_TABS.some(t => t.id === state.activeTab) ? state.activeTab : 'queue';
  const setTab = (nextTab: string) => dispatch({ type: 'SET_TAB', payload: nextTab });

  const clinicApts = state.appointments
    .filter(a => a.clinicId === 'clinic-1')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const stats = {
    total: clinicApts.length + 18,
    booked: clinicApts.filter(a => a.status === 'BOOKED').length,
    checkedIn: clinicApts.filter(a => a.status === 'CHECKED_IN').length,
    inConsult: clinicApts.filter(a => a.status === 'IN_CONSULTATION').length,
    completed: clinicApts.filter(a => a.status === 'COMPLETED').length + 14,
  };

  function handleSendIn(id: string, patientName: string, phone: string) {
    dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id, status: 'IN_CONSULTATION' } });
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`,
        recipientPhone: phone,
        recipientName: patientName,
        type: 'QUEUE_ALERT',
        title: '🔔 Consultation Calling',
        body: `Hi ${patientName}! Dr. Arvind Rao is ready for you now in Room 1. Please step in.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  }

  function handleCallPatient(phone: string, name: string) {
    alert(`Calling ${name} at ${phone}...`);
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Live Clinic Desk</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Reception Desk — Apex Care Clinic</h1>
            <p className="text-sm text-slate-500">Indiranagar 100ft Road • Managing Queue &amp; Walk-ins</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextCheckedIn = clinicApts.find(a => a.status === 'CHECKED_IN');
                if (nextCheckedIn) {
                  handleSendIn(nextCheckedIn.id, nextCheckedIn.patientName, nextCheckedIn.patientPhone);
                } else {
                  alert('No patients currently checked in waiting in queue.');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm transition"
            >
              Call Next to Doctor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Today', val: stats.total, color: 'text-[#0F2A3D] bg-white border-[#DFECF5]' },
            { label: 'Pending Check-in', val: stats.booked, color: 'text-[#0B5D7A] bg-[#EBF6FC] border-[#AEDCF2]' },
            { label: 'Waiting in Queue', val: stats.checkedIn, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'In Consultation', val: stats.inConsult, color: 'text-[#0EA5A4] bg-[#E6F7F5] border-[#99E2D8]' },
            { label: 'Completed', val: stats.completed, color: 'text-[#084961] bg-[#D6EEF9] border-[#AEDCF2]' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border shadow-sm`}>
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-xs font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Appointment Queue Table / Views */}
        {tab === 'queue' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Today's Scheduled Consultations (Dr. Arvind Rao)
              </h2>
              <span className="text-xs text-slate-500 font-medium">Real-time sync active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Queue #</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Slot Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Phone &amp; Reminder</th>
                    <th className="px-4 py-3 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clinicApts.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          #{apt.queuePosition}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{apt.familyMemberName || apt.patientName}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF6FC] text-[#0B5D7A] border border-[#AEDCF2]">
                            {apt.consultationMode === 'VIDEO'
                              ? 'Video'
                              : apt.consultationMode === 'HOME_VISIT'
                              ? 'Home Visit'
                              : 'In-Clinic'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{apt.symptoms || 'General Checkup'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                        {apt.slotTime}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'IN_CONSULTATION' ? 'bg-green-100 text-green-700' :
                          apt.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleCallPatient(apt.patientPhone, apt.patientName)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          <Phone className="w-3 h-3" />
                          {apt.patientPhone}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {apt.status === 'BOOKED' && (
                          <button
                            onClick={() => {
                              dispatch({
                                type: 'UPDATE_APPOINTMENT_STATUS',
                                payload: {
                                  id: apt.id,
                                  status: 'CHECKED_IN',
                                  checkedInAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                                },
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
                          >
                            Mark Check-In
                          </button>
                        )}
                        {apt.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleSendIn(apt.id, apt.patientName, apt.patientPhone)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                          >
                            Send to Doctor →
                          </button>
                        )}
                        {apt.status === 'IN_CONSULTATION' && (
                          <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                            In Room 1
                          </span>
                        )}
                        {apt.status === 'COMPLETED' && (
                          <span className="text-xs text-slate-500 font-medium">Done ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'calls' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" /> Patient Telephone Reminder Desk
            </h3>
            <p className="text-xs text-slate-500">Call upcoming booked patients to confirm arrival time and reduce clinic no-shows.</p>
            <div className="space-y-3">
              {clinicApts.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{apt.patientName}</div>
                    <div className="text-xs text-slate-500">Slot: {apt.slotTime} • Status: {apt.status}</div>
                  </div>
                  <button
                    onClick={() => handleCallPatient(apt.patientPhone, apt.patientName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call ({apt.patientPhone})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" /> Front Desk Operational Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-700">11.4 min</div>
                <div className="text-xs text-purple-900 mt-1">Average Waiting Room Time</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">96.2%</div>
                <div className="text-xs text-emerald-900 mt-1">Check-in On-Time Rate</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">3.8%</div>
                <div className="text-xs text-blue-900 mt-1">No-Show Rate Today</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {RECEPTION_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                tab === id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

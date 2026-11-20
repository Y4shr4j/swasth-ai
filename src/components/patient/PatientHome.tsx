import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_MEDICAL_RECORDS } from '../../data/seedData';
import { QrCode, Calendar, FileText, Users, Heart, CheckCircle } from 'lucide-react';
import AIHealthReportModal from './AIHealthReportModal';
import QRScannerModal from './QRScannerModal';

export default function PatientHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { state, dispatch } = useAppStore();
  const [showQR, setShowQR] = useState(false);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);

  const myAppointment = state.appointments.find(a => a.patientId === 'patient-rahul' && ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(a.status));
  const recentRecords = SEED_MEDICAL_RECORDS.filter(r => r.familyMemberId === 'fam-1').slice(0, 2);

  function handleCheckIn() {
    if (!myAppointment) return;
    dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id: myAppointment.id, status: 'CHECKED_IN', checkedInAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), queuePosition: 2 } });
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`, recipientPhone: '+91 98765 43210', recipientName: 'Rahul Sharma',
        type: 'QUEUE_ALERT', title: '✅ Checked In — Apex Care Clinic',
        body: `Hi Rahul! You've checked in at Apex Care Clinic, Indiranagar.\n\nDoctor: Dr. Arvind Rao\nQueue Position: #2\nEstimated Wait: ~15 mins\n\nWe'll notify you when it's your turn.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setShowQR(false);
    setShowCheckInSuccess(true);
    setTimeout(() => setShowCheckInSuccess(false), 3000);
  }

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, Rahul 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your health, your family — all in one place.</p>
      </div>

      {/* Success Toast */}
      {showCheckInSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm font-medium animate-pulse">
          <CheckCircle className="w-5 h-5" /> Checked in! You are #2 in queue.
        </div>
      )}

      {/* Active Appointment Card */}
      {myAppointment && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between">
            <span className="text-white text-xs font-medium">Today's Appointment</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              myAppointment.status === 'IN_CONSULTATION' ? 'bg-green-400 text-white' :
              myAppointment.status === 'CHECKED_IN' ? 'bg-amber-400 text-amber-900' :
              'bg-white/20 text-white'
            }`}>{myAppointment.status.replace('_', ' ')}</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">AR</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{myAppointment.doctorName}</div>
                <div className="text-xs text-slate-500">{myAppointment.doctorSpecialty}</div>
                <div className="text-xs text-slate-500 mt-1">{myAppointment.clinicName} • {myAppointment.slotTime}</div>
              </div>
            </div>

            {myAppointment.status === 'BOOKED' && (
              <button onClick={() => setShowQR(true)} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition">
                <QrCode className="w-4 h-4" /> Scan Clinic QR & Check In
              </button>
            )}

            {myAppointment.status === 'CHECKED_IN' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <div className="text-3xl font-bold text-amber-600">#{myAppointment.queuePosition}</div>
                <div className="text-xs text-amber-700 font-medium mt-1">Your Queue Position</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-600">Waiting — Estimated ~15 mins</span>
                </div>
              </div>
            )}

            {myAppointment.status === 'IN_CONSULTATION' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🎉</div>
                <div className="font-semibold text-green-700">It's your turn!</div>
                <div className="text-xs text-green-600 mt-1">Please proceed to the consultation room.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Calendar, label: 'Book Appointment', color: 'bg-blue-50 text-blue-600', action: () => onNavigate('find') },
          { icon: FileText, label: 'Health Vault', color: 'bg-purple-50 text-purple-600', action: () => onNavigate('records') },
          { icon: Users, label: 'Family Profiles', color: 'bg-orange-50 text-orange-600', action: () => onNavigate('family') },
          { icon: Heart, label: 'AI Health Report', color: 'bg-rose-50 text-rose-600', action: () => setShowAIReport(true) },
        ].map(({ icon: Icon, label, color, action }) => (
          <button key={label} onClick={action} className={`${color} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Recent Records */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Recent Records</h3>
        <div className="space-y-2">
          {recentRecords.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                rec.type === 'PRESCRIPTION' ? 'bg-emerald-100 text-emerald-700' :
                rec.type === 'BLOODWORK' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>{rec.type.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{rec.title}</div>
                <div className="text-xs text-slate-500">{rec.clinicName} • {rec.visitDate}</div>
              </div>
              {rec.isAbnormal && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">⚠</span>}
            </div>
          ))}
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

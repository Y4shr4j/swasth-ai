import { useAppStore } from '../../store/appStore';
import { ShieldCheck, ShieldX } from 'lucide-react';

export default function ConsentGateModal() {
  const { state, dispatch } = useAppStore();
  const pending = state.consentRequests.find(c => c.status === 'PENDING' && c.patientId === 'patient-rahul');
  if (!pending) return null;

  const scopeLabels: Record<string, string> = {
    FULL_AI_HEALTH_REPORT: 'Full AI Health Report',
    ALL_MEDICAL_RECORDS: 'All Medical Records',
    PRESCRIPTION_DISPENSE: 'Prescription for Dispensing',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
          <div className="flex items-center gap-2 text-amber-800">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">Access Request</span>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            <span className="font-semibold text-slate-900">{pending.requesterName}</span> from{' '}
            <span className="font-semibold text-slate-900">{pending.clinicName}</span> is requesting access to your:
          </p>
          <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm font-medium text-slate-700">
            {scopeLabels[pending.scope] || pending.scope}
          </div>
          <p className="text-xs text-slate-500 mb-6">Your data is private. Only approved requests can access your medical records.</p>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch({ type: 'RESPOND_CONSENT', payload: { id: pending.id, status: 'APPROVED' } })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => dispatch({ type: 'RESPOND_CONSENT', payload: { id: pending.id, status: 'DENIED' } })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 border border-red-200 transition"
            >
              <ShieldX className="w-4 h-4" /> Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

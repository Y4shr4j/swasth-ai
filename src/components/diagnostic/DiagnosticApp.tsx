import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Search, ShieldAlert, ShieldCheck, Pill, CheckCircle2, Clock } from 'lucide-react';

const DIAGNOSTIC_TABS = [
  { id: 'lookup', label: 'Patient Lookup', icon: Search },
  { id: 'consent', label: 'Consent Gate', icon: ShieldCheck },
  { id: 'prescriptions', label: 'Dispense Rx', icon: Pill },
];

export default function DiagnosticApp() {
  const { state, dispatch } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('98765 43210');
  const [searched, setSearched] = useState(false);
  const tab = DIAGNOSTIC_TABS.some(t => t.id === state.activeTab) ? state.activeTab : 'lookup';
  const setTab = (nextTab: string) => dispatch({ type: 'SET_TAB', payload: nextTab });

  // Check consent status for Rahul Sharma and diagnostic scope
  const consent = state.consentRequests.find(
    c => c.patientId === 'patient-rahul' && c.scope === 'PRESCRIPTION_DISPENSE'
  );

  const isApproved = consent?.status === 'APPROVED';
  const isPending = consent?.status === 'PENDING';

  // Get prescriptions for Rahul
  const prescriptions = state.medicalRecords.filter(
    r => r.patientId === 'patient-rahul' && r.type === 'PRESCRIPTION'
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearched(true);
    }
  }

  function handleRequestConsent() {
    dispatch({
      type: 'ADD_CONSENT_REQUEST',
      payload: {
        id: `consent-${Date.now()}`,
        patientId: 'patient-rahul',
        patientName: 'Rahul Sharma',
        clinicId: 'clinic-apollo-pharmacy',
        clinicName: 'Apollo Pharmacy & Diagnostics (Indiranagar)',
        requesterRole: 'DIAGNOSTIC',
        requesterName: 'Apollo Pharmacy Partner',
        status: 'PENDING',
        requestedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        scope: 'PRESCRIPTION_DISPENSE',
      },
    });
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧪</span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Fulfillment Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Apollo Pharmacy &amp; Diagnostic Partner Desk</h1>
          <p className="text-sm text-slate-500">
            Enter a patient's mobile number or ABHA ID to look up prescribed medications and lab tests under real-time consent.
          </p>
        </div>

        {/* Lookup Bar */}
        {(tab === 'lookup' || tab === 'consent') && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Enter Patient Phone (e.g. 98765 43210) or ABHA ID..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
            >
              Lookup Patient
            </button>
          </form>
        )}

        {/* Result Card */}
        {searched && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-5 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Rahul Sharma</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Verified Patient
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Phone: +91 98765 43210 • ABHA: 91-8842-1920-3312
                </div>
              </div>

              {/* Consent Status Pill */}
              <div>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Consent Approved
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    Waiting for Patient In-App Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    <ShieldAlert className="w-4 h-4" />
                    No Active Access Grant
                  </span>
                )}
              </div>
            </div>

            {/* Consent Lock / Unlock View */}
            {!isApproved ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                  🔒
                </div>
                <h4 className="font-semibold text-slate-800">Medical Data Protected by Patient Consent Gate</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Under SwasthAI patient-owned privacy rules, pharmacies and diagnostic labs must receive explicit real-time In-App approval from the patient before accessing clinical records.
                </p>
                {!isPending ? (
                  <button
                    onClick={handleRequestConsent}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Request Access from Rahul Sharma
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-medium">
                    Approval request sent to Rahul's phone! Switch to "Patient" tab above to approve it.
                  </div>
                )}
              </div>
            ) : (
              /* Unlocked Prescriptions */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    Prescriptions Approved for Fulfillment
                  </h4>
                  <span className="text-xs text-emerald-600 font-medium">Real-time unlocked</span>
                </div>

                <div className="space-y-3">
                  {prescriptions.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{p.title}</div>
                          <div className="text-xs text-slate-500">By {p.doctorName} • {p.clinicName} • {p.visitDate}</div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          VALID RX
                        </span>
                      </div>

                      {p.structuredData?.medicines && (
                        <div className="space-y-1.5">
                          {p.structuredData.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{med.name}</span>
                              <span className="text-slate-600">{med.dosage} • {med.frequency} • {med.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => alert('Medications marked as dispensed!')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Dispensed &amp; Fulfill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {DIAGNOSTIC_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (id !== 'lookup') setSearched(true);
              }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                tab === id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
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

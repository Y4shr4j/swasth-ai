import { useState } from 'react';
import { SEED_FAMILY_MEMBERS } from '../../data/seedData';
import { User, ChevronRight, Shield, Heart, X } from 'lucide-react';
import AIHealthReportModal from './AIHealthReportModal';

export default function FamilyProfiles() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAIReport, setShowAIReport] = useState(false);
  const selected = SEED_FAMILY_MEMBERS.find(m => m.id === selectedId);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Family Profiles</h2>
      <p className="text-sm text-slate-500">Manage health records for your family members.</p>

      <div className="space-y-3">
        {SEED_FAMILY_MEMBERS.map(m => (
          <button key={m.id} onClick={() => setSelectedId(m.id)}
            className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 text-left hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
              m.relation === 'Self' ? 'bg-emerald-100 text-emerald-700' :
              m.relation === 'Father' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
            }`}>{m.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900">{m.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m.relation}</span>
                <span className="text-xs text-slate-500">{m.age} yrs • {m.gender}</span>
              </div>
              {m.knownConditions.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {m.knownConditions.map(c => (
                    <span key={c} className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Profile Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">{selected.name}</h3>
              <button onClick={() => setSelectedId(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                  selected.relation === 'Self' ? 'bg-emerald-100 text-emerald-700' :
                  selected.relation === 'Father' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>{selected.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="text-sm text-slate-500">{selected.relation} • {selected.age} yrs • {selected.gender}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{selected.phone}</div>
                </div>
              </div>

              {/* Gov IDs */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Government & Health IDs</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selected.govIds.aadhaar && <IdCard label="Aadhaar" value={selected.govIds.aadhaar} />}
                  {selected.govIds.pan && <IdCard label="PAN" value={selected.govIds.pan} />}
                  {selected.govIds.abha && <IdCard label="ABHA" value={selected.govIds.abha} />}
                  {selected.govIds.cghs && <IdCard label="CGHS" value={selected.govIds.cghs} />}
                  {selected.govIds.ayushman && <IdCard label="Ayushman" value={selected.govIds.ayushman} />}
                  {selected.govIds.echs && <IdCard label="ECHS" value={selected.govIds.echs} />}
                </div>
              </div>

              {/* Conditions */}
              {selected.knownConditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1"><Heart className="w-3 h-3" /> Known Conditions</h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {selected.knownConditions.map(c => (
                      <span key={c} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setSelectedId(null); setShowAIReport(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-semibold border border-rose-200 hover:bg-rose-100 transition">
                <Heart className="w-4 h-4" /> Generate AI Health Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showAIReport && <AIHealthReportModal onClose={() => setShowAIReport(false)} />}
    </div>
  );
}

function IdCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      <div className="text-xs font-mono text-slate-700 mt-0.5">{value}</div>
    </div>
  );
}

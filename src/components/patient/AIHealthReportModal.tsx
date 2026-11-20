import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_FAMILY_MEMBERS } from '../../data/seedData';
import { callHealthReport } from '../../services/geminiService';
import AIBadge from '../common/AIBadge';
import { X, Loader2, AlertTriangle, Pill, TrendingUp, MessageCircle, FileText } from 'lucide-react';

const DATE_RANGES = ['Last 3 Months', 'Last 6 Months', 'Last 1 Year', 'All Time'];

export default function AIHealthReportModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useAppStore();
  const [selectedMember, setSelectedMember] = useState(SEED_FAMILY_MEMBERS[1].id); // Father by default
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [loading, setLoading] = useState(false);

  const member = SEED_FAMILY_MEMBERS.find(m => m.id === selectedMember)!;
  const report = state.aiHealthReport;

  async function handleGenerate() {
    const memberRecords = state.medicalRecords.filter(r =>
      r.familyMemberId === selectedMember || (selectedMember === 'fam-1' && !r.familyMemberId && r.patientId === 'patient-rahul')
    );
    setLoading(true);
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Generating AI Health Report...' } });
    try {
      const result = await callHealthReport(member, memberRecords, dateRange, state.geminiApiKey);
      dispatch({ type: 'SET_AI_HEALTH_REPORT', payload: result });
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between z-10">
          <h3 className="font-semibold text-lg">AI Health Report</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Config */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Family Member</label>
              <select value={selectedMember} onChange={e => { setSelectedMember(e.target.value); dispatch({ type: 'SET_AI_HEALTH_REPORT', payload: null as any }); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                {SEED_FAMILY_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Date Range</label>
              <div className="flex gap-2 flex-wrap">
                {DATE_RANGES.map(d => (
                  <button key={d} onClick={() => setDateRange(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${dateRange === d ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{d}</button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini...</> : '🧠 Generate AI Health Report'}
            </button>
          </div>

          {/* Report Output */}
          {report && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">{report.patientName}</h4>
                <AIBadge isDemoData={report.isDemoData} />
              </div>
              <p className="text-xs text-slate-500">Period: {report.period} • Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>

              {/* Chronic Conditions */}
              <Section icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} title="Chronic Conditions">
                <div className="space-y-1.5">
                  {report.chronic_conditions.map((c, i) => (
                    <div key={i} className="text-xs bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100">{c}</div>
                  ))}
                </div>
              </Section>

              {/* Medication History */}
              <Section icon={<Pill className="w-4 h-4 text-emerald-600" />} title="Medication History">
                <div className="space-y-1">
                  {report.medication_history.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-lg">
                      <span className="font-medium text-emerald-800">{m.drug}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-600">{m.status}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${m.adherence === 'Regular' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{m.adherence}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Lab Trends */}
              <Section icon={<TrendingUp className="w-4 h-4 text-blue-600" />} title="Abnormal Lab Trends">
                <div className="space-y-1.5">
                  {report.abnormal_lab_trends.map((t, i) => (
                    <div key={i} className="text-xs bg-blue-50 text-blue-800 p-2 rounded-lg border border-blue-100">⚠ {t}</div>
                  ))}
                </div>
              </Section>

              {/* Severity Flags */}
              {report.severity_flags.length > 0 && (
                <Section icon={<AlertTriangle className="w-4 h-4 text-red-500" />} title="Attention Flags">
                  <div className="space-y-1.5">
                    {report.severity_flags.map((f, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg border ${
                        f.level === 'HIGH' ? 'bg-red-50 text-red-800 border-red-200' :
                        f.level === 'MODERATE' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        <span className="font-semibold">{f.level}:</span> {f.note}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Discussion Points */}
              <Section icon={<MessageCircle className="w-4 h-4 text-purple-600" />} title="Discuss with Doctor">
                <div className="space-y-1.5">
                  {report.doctor_discussion_points.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-purple-800">
                      <FileText className="w-3 h-3 mt-0.5 shrink-0 text-purple-500" />
                      {p}
                    </div>
                  ))}
                </div>
              </Section>

              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 italic">{report.disclaimer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <h5 className="text-sm font-semibold text-slate-700">{title}</h5>
      </div>
      {children}
    </div>
  );
}

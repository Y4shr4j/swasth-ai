import { LayoutList, Users, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import DoctorQueue from './DoctorQueue';
import PatientHistory from './PatientHistory';
import ClinicAnalytics from './ClinicAnalytics';

const TABS = [
  { id: 'queue', label: 'Live Queue', icon: LayoutList },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'analytics', label: 'Clinic Analytics', icon: BarChart3 },
];

export default function DoctorApp() {
  const { state, dispatch } = useAppStore();
  const tab = TABS.some(t => t.id === state.activeTab) ? state.activeTab : 'queue';
  const setTab = (nextTab: string) => dispatch({ type: 'SET_TAB', payload: nextTab });

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Top Sub-nav for Desktop */}
        <div className="hidden sm:flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'queue' && <DoctorQueue />}
        {tab === 'patients' && <PatientHistory />}
        {tab === 'analytics' && <ClinicAnalytics />}
      </div>

      {/* Fixed Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, icon: Icon }) => (
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

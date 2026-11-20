import { Home, Search, FileText, Users } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import PatientHome from './PatientHome';
import DoctorDiscovery from './DoctorDiscovery';
import MedicalVault from './MedicalVault';
import FamilyProfiles from './FamilyProfiles';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'find', label: 'Find Doctor', icon: Search },
  { id: 'records', label: 'My Records', icon: FileText },
  { id: 'family', label: 'Family', icon: Users },
] as const;

export default function PatientApp() {
  const { state, dispatch } = useAppStore();
  const tab = TABS.some(t => t.id === state.activeTab) ? state.activeTab : 'home';
  const setTab = (nextTab: string) => dispatch({ type: 'SET_TAB', payload: nextTab });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto">
        {tab === 'home' && <PatientHome onNavigate={setTab} />}
        {tab === 'find' && <DoctorDiscovery />}
        {tab === 'records' && <MedicalVault />}
        {tab === 'family' && <FamilyProfiles />}
      </div>

      {/* Bottom Nav */}
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

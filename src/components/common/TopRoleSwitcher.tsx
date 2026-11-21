import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';
import { User, Stethoscope, ClipboardList, BarChart3, ShieldCheck, LucideIcon } from 'lucide-react';
import Logo from './Logo';

const ROLES: { role: UserRole; label: string; icon: LucideIcon }[] = [
  { role: 'PATIENT', label: 'Patient', icon: User },
  { role: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
  { role: 'RECEPTIONIST', label: 'Receptionist', icon: ClipboardList },
  { role: 'ADMIN', label: 'Admin', icon: BarChart3 },
];

export default function TopRoleSwitcher() {
  const { state, dispatch } = useAppStore();
  const hasPendingConsent = state.consentRequests.some(
    c => c.status === 'PENDING' && c.patientId === 'patient-rahul'
  );

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DFECF5] shadow-[0_2px_12px_rgba(11,93,122,0.05)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* App Logo */}
          <Logo />

          {/* Role Tabs (Patient, Doctor, Receptionist, Admin) */}
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {ROLES.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={() => dispatch({ type: 'SET_ROLE', payload: role })}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  state.role === role
                    ? 'bg-[#0B5D7A] text-white shadow-md'
                    : 'text-slate-600 hover:bg-[#EBF6FC] hover:text-[#0B5D7A]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                {role === 'PATIENT' && hasPendingConsent && (
                  <span
                    className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-amber-950 animate-pulse"
                    title="Consent approval requested"
                  >
                    1
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Server-Side AI Status Badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F8FC] border border-[#D6E8F7] text-xs font-medium text-[#0B5D7A] shrink-0"
            title="Gemini AI integration status"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${state.serverGeminiReady ? 'text-[#0EA5A4]' : 'text-[#0B5D7A]'}`} />
            <span>{state.serverGeminiReady ? 'Backend AI Ready' : 'Demo AI Ready'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

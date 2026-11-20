import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';
import { User, Stethoscope, ClipboardList, BarChart3, FlaskConical, ShieldCheck, LucideIcon } from 'lucide-react';
import Logo from './Logo';

const ROLES: { role: UserRole; label: string; icon: LucideIcon }[] = [
  { role: 'PATIENT', label: 'Patient', icon: User },
  { role: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
  { role: 'RECEPTIONIST', label: 'Receptionist', icon: ClipboardList },
  { role: 'ADMIN', label: 'Admin', icon: BarChart3 },
  { role: 'DIAGNOSTIC', label: 'Diagnostics', icon: FlaskConical },
];

export default function TopRoleSwitcher() {
  const { state, dispatch } = useAppStore();

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DFECF5] shadow-[0_2px_12px_rgba(11,93,122,0.05)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* App Logo */}
          <Logo />

          {/* Role Tabs */}
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {ROLES.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={() => dispatch({ type: 'SET_ROLE', payload: role })}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  state.role === role
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                {(role === 'PATIENT' || role === 'DOCTOR') && (
                  <span
                    className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full ${
                      state.role === role ? 'bg-emerald-200' : 'bg-emerald-500'
                    } animate-pulse`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Server-Side AI Status Badge (Zero keys in browser) */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 shrink-0"
            title="Gemini API calls are secured on the Node.js backend"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${state.serverGeminiReady ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{state.serverGeminiReady ? 'Backend AI Ready' : 'Server Standby'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

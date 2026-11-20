import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import TopRoleSwitcher from './components/common/TopRoleSwitcher';
import ConsentGateModal from './components/common/ConsentGateModal';
import SimulatedWhatsApp from './components/common/SimulatedWhatsApp';
import PatientApp from './components/patient/PatientApp';
import DoctorApp from './components/doctor/DoctorApp';
import ReceptionistApp from './components/receptionist/ReceptionistApp';
import AdminApp from './components/admin/AdminApp';
import DiagnosticApp from './components/diagnostic/DiagnosticApp';
import { useAppStore } from './store/appStore';

function RoleView() {
  const { state } = useAppStore();
  switch (state.role) {
    case 'PATIENT':
      return <PatientApp />;
    case 'DOCTOR':
      return <DoctorApp />;
    case 'RECEPTIONIST':
      return <ReceptionistApp />;
    case 'ADMIN':
      return <AdminApp />;
    case 'DIAGNOSTIC':
      return <DiagnosticApp />;
    default:
      return <PatientApp />;
  }
}

export default function App() {
  const { state } = useAppStore();
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const msgCount = state.whatsappMessages.length;

  return (
    <div className="min-h-screen bg-[#F3F8FC]">
      <TopRoleSwitcher />
      <ConsentGateModal />

      <main>
        <RoleView />
      </main>

      {/* Floating Notifications button */}
      <button
        onClick={() => setWhatsappOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-20 sm:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-transform hover:scale-105 active:scale-95"
        title="Open notifications"
      >
        <Bell size={24} />
        {msgCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
            {msgCount > 9 ? '9+' : msgCount}
          </span>
        )}
      </button>

      <SimulatedWhatsApp isOpen={whatsappOpen} onClose={() => setWhatsappOpen(false)} />
    </div>
  );
}

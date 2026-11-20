import { useAppStore } from '../../store/appStore';
import { X, Bell } from 'lucide-react';

export default function SimulatedWhatsApp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state } = useAppStore();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 text-white bg-emerald-600">
          <Bell className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Notifications</div>
            <div className="text-xs opacity-80">Live Updates</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {state.whatsappMessages.length === 0 && (
            <div className="text-center text-sm text-slate-500 mt-8">
              No notifications yet. Book an appointment or receive a prescription to see notifications here.
            </div>
          )}
          {state.whatsappMessages.map(msg => (
            <div key={msg.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Notification
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mb-1">{msg.title}</div>
              <div className="text-xs text-slate-600 whitespace-pre-line">{msg.body}</div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t text-center text-xs text-slate-400">SwasthAI Live Notification Center</div>
      </div>
    </>
  );
}

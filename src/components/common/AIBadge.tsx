export default function AIBadge({ isDemoData }: { isDemoData?: boolean }) {
  if (isDemoData) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
        Sample Data (Offline Mode)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      AI-Generated • Clinical Review Only
    </span>
  );
}

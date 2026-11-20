import React, { useState } from 'react';
import { BarChart3, TrendingUp, Loader2, Sparkles, Users, DollarSign, CalendarCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { callClinicGrowth } from '../../services/geminiService';
import AIBadge from '../common/AIBadge';

const CATEGORY_COLORS: Record<string, string> = {
  REVENUE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OPERATIONS: 'bg-blue-50 text-blue-700 border-blue-200',
  RETENTION: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function ClinicAnalytics() {
  const { state, dispatch } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const data = state.clinicGrowthData;

  async function handleRefreshInsights() {
    setIsLoading(true);
    try {
      const result = await callClinicGrowth(data, state.geminiApiKey);
      dispatch({ type: 'SET_CLINIC_GROWTH', payload: result });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Clinic Analytics</h2>
        <button
          onClick={handleRefreshInsights}
          disabled={isLoading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {isLoading ? 'Generating…' : 'Refresh AI Insights'}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today Booked', value: data.todayBooked, icon: <CalendarCheck size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Checked In', value: data.todayCheckedIn, icon: <Users size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Completed', value: data.todayCompleted, icon: <BarChart3 size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Monthly Revenue', value: `₹${(data.monthlyRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={20} className="text-violet-600" />, bg: 'bg-violet-50' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 flex items-center gap-3`}>
            {card.icon}
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-600">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Area breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Patient Area Breakdown</h3>
        <div className="space-y-2">
          {data.areaBreakdown.map((area) => {
            const max = Math.max(...data.areaBreakdown.map((a) => a.patients));
            const pct = Math.round((area.patients / max) * 100);
            return (
              <div key={area.area}>
                <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                  <span>{area.area}</span>
                  <span className="font-medium">{area.patients}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Growth Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-800">AI Growth Insights</h3>
          <AIBadge isDemoData={data.isDemoData} />
        </div>
        <div className="space-y-3">
          {data.aiGrowthSuggestions.map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${CATEGORY_COLORS[s.category] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-sm">{s.title}</p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 border border-current">
                  {s.category}
                </span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed mb-2">{s.description}</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} />
                <span className="text-xs font-semibold">{s.projectedImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Building2, Users, Calendar, Stethoscope, FileText, CheckCircle2, TrendingUp, ShieldCheck, BarChart3 } from 'lucide-react';
import { SEED_CLINICS } from '../../data/seedData';
import { useAppStore } from '../../store/appStore';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'clinics', label: 'Clinics', icon: Building2 },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
];

export default function AdminApp() {
  const { state, dispatch } = useAppStore();
  const tab = ADMIN_TABS.some(t => t.id === state.activeTab) ? state.activeTab : 'overview';
  const setTab = (nextTab: string) => dispatch({ type: 'SET_TAB', payload: nextTab });

  const stats = [
    { label: 'Active Clinics', value: '3', sub: '100% active on SaaS', icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Registered Patients', value: '1,247', sub: '+18% this month', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Bookings Today', value: '71', sub: '54 checked in', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Rx Prescriptions Created', value: '2,841', sub: 'Gemini Voice Assisted', icon: Stethoscope, color: 'text-purple-600 bg-purple-50' },
    { label: 'AI Health Reports Sold', value: '128', sub: '₹499 per family report', icon: FileText, color: 'text-rose-600 bg-rose-50' },
    { label: 'Platform MRR', value: '₹3,48,000', sub: 'SaaS + AI Report splits', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Platform Executive Control
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">SwasthAI — Founder / Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Real-time network performance across clinics, doctors, and patient vault subscriptions.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            HIPAA &amp; ABDM Compliant Mesh
          </div>
        </div>

        {/* Tab content */}
        {(tab === 'overview' || tab === 'revenue') && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-sm font-medium text-slate-700 mt-0.5">{s.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(tab === 'overview' || tab === 'clinics') && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Partner Clinics &amp; Active Subscriptions</h2>
              <span className="text-xs font-medium text-slate-500">3 of 3 Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Clinic Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">QR Token</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SEED_CLINICS.map(clinic => (
                    <tr key={clinic.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{clinic.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{clinic.area}, {clinic.city}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200">
                          {clinic.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{clinic.qrCodeToken}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {clinic.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-amber-600">★ {clinic.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                tab === id ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
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

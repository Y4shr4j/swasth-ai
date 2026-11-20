import React, { useState } from 'react';
import {
  FileText,
  Droplets,
  ScanLine,
  Activity,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  AlertTriangle,
  Stethoscope,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SEED_FAMILY_MEMBERS } from '../../data/seedData';
import { callPreSurgicalSummary } from '../../services/geminiService';
import { FamilyMember, MedicalRecord, PreSurgicalSummary } from '../../types';
import AIBadge from '../common/AIBadge';
import Avatar from '../common/Avatar';

function RecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false);
  const typeIcon: Record<string, React.ReactNode> = {
    PRESCRIPTION: <FileText size={16} className="text-[#0EA5A4]" />,
    BLOODWORK: <Droplets size={16} className="text-[#0B5D7A]" />,
    SCAN: <ScanLine size={16} className="text-indigo-600" />,
    SYMPTOM_CHECKIN: <Activity size={16} className="text-amber-600" />,
  };
  return (
    <div className={`bg-white rounded-xl border p-3 ${record.isAbnormal ? 'border-amber-300' : 'border-[#DFECF5]'}`}>
      <button className="w-full text-left" onClick={() => setExpanded(p => !p)}>
        <div className="flex items-start gap-2">
          {typeIcon[record.type] || <FileText size={16} className="text-[#0B5D7A]" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#0F2A3D]">{record.title}</span>
              {record.isAbnormal && (
                <span className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  <AlertTriangle size={10} /> Attention
                </span>
              )}
            </div>
            <div className="flex gap-2 text-xs text-[#5A7184] mt-0.5">
              <span>{record.visitDate}</span>
              <span>· {record.doctorName}</span>
              <span>· {record.clinicName}</span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400 shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-slate-400 shrink-0" />
          )}
        </div>
      </button>
      {expanded && record.aiSummary && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700 bg-[#F3F8FC] rounded-lg px-2.5 py-2">
          <span className="font-semibold text-[#0F2A3D]">Summary: </span>
          {record.aiSummary}
        </div>
      )}
      {expanded && record.type === 'PRESCRIPTION' && record.structuredData?.medicines && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#EBF6FC]">
              <tr>
                {['Medicine', 'Dosage', 'Frequency', 'Duration'].map(h => (
                  <th key={h} className="px-2 py-1 text-left text-[#0B5D7A] font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {record.structuredData.medicines.map((m: any, i: number) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-2 py-1 font-medium">{m.name}</td>
                  <td className="px-2 py-1">{m.dosage}</td>
                  <td className="px-2 py-1">{m.frequency}</td>
                  <td className="px-2 py-1">{m.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PatientHistory() {
  const { state, dispatch } = useAppStore();
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(SEED_FAMILY_MEMBERS[0]);
  const [preSurgical, setPreSurgical] = useState<PreSurgicalSummary | null>(null);
  const [preSurgicalLoading, setPreSurgicalLoading] = useState(false);
  const [preSurgicalError, setPreSurgicalError] = useState<string | null>(null);

  const consentForSelected = state.consentRequests.find(
    cr => cr.clinicId === 'clinic-1' && cr.patientId === 'patient-rahul'
  );
  const isApproved = consentForSelected?.status === 'APPROVED';

  const memberRecords = state.medicalRecords.filter(r => r.familyMemberId === selectedMember.id);
  const recordsByType = {
    PRESCRIPTION: memberRecords.filter(r => r.type === 'PRESCRIPTION'),
    BLOODWORK: memberRecords.filter(r => r.type === 'BLOODWORK'),
    SCAN: memberRecords.filter(r => r.type === 'SCAN'),
    SYMPTOM_CHECKIN: memberRecords.filter(r => r.type === 'SYMPTOM_CHECKIN'),
  };

  const handleRequestConsent = () => {
    dispatch({
      type: 'ADD_CONSENT_REQUEST',
      payload: {
        id: `cr-doc-${Date.now()}`,
        patientId: 'patient-rahul',
        patientName: selectedMember.name,
        clinicId: 'clinic-1',
        clinicName: 'Apex Care Super Clinic & Diagnostics',
        doctorId: 'doc-1',
        doctorName: 'Dr. Arvind Rao',
        requesterRole: 'DOCTOR',
        requesterName: 'Dr. Arvind Rao',
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        scope: 'FULL_AI_HEALTH_REPORT',
      },
    });
  };

  const handleGeneratePreSurgical = async () => {
    setPreSurgicalLoading(true);
    setPreSurgicalError(null);
    try {
      const result = await callPreSurgicalSummary(selectedMember, memberRecords, 'clinic-1');
      setPreSurgical(result);
    } catch (err: any) {
      setPreSurgicalError(err?.message || 'Unable to generate pre-surgical summary.');
    } finally {
      setPreSurgicalLoading(false);
    }
  };

  const typeConfig: { key: keyof typeof recordsByType; label: string; icon: React.ReactNode }[] = [
    { key: 'PRESCRIPTION', label: 'Prescriptions', icon: <FileText size={15} className="text-[#0EA5A4]" /> },
    { key: 'BLOODWORK', label: 'Bloodwork', icon: <Droplets size={15} className="text-[#0B5D7A]" /> },
    { key: 'SCAN', label: 'Scans', icon: <ScanLine size={15} className="text-indigo-600" /> },
    { key: 'SYMPTOM_CHECKIN', label: 'Symptom Check-Ins', icon: <Activity size={15} className="text-amber-600" /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F2A3D]">Patient Records &amp; Clinical Summaries</h2>

      {/* Family member selector */}
      <div className="flex gap-3 flex-wrap">
        {SEED_FAMILY_MEMBERS.map(member => (
          <button
            key={member.id}
            onClick={() => {
              setSelectedMember(member);
              setPreSurgical(null);
              setPreSurgicalError(null);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              selectedMember.id === member.id
                ? 'bg-[#EBF6FC] border-[#0B5D7A] text-[#0B5D7A] shadow-sm'
                : 'bg-white border-[#DFECF5] text-[#0F2A3D] hover:bg-[#F3F8FC]'
            }`}
          >
            <Avatar src={member.avatar} name={member.name} className="w-8 h-8 rounded-full" />
            <div className="text-left">
              <p className="font-semibold leading-tight">{member.name}</p>
              <p className="text-xs text-[#5A7184]">
                {member.relation} · {member.age}y
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Consent Gate Card */}
      <div className="bg-white rounded-2xl border border-[#DFECF5] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <ShieldCheck size={18} className="text-[#0EA5A4]" />
            ) : (
              <Lock size={18} className="text-amber-600" />
            )}
            <span className="font-bold text-[#0F2A3D] text-sm">
              Patient Consent Gate — Records, AI Health Report &amp; Pre-Surgical Summary
            </span>
          </div>
          {isApproved && (
            <span className="text-xs font-semibold text-[#0EA5A4] bg-[#E6F7F5] px-2.5 py-0.5 rounded-full border border-[#99E2D8]">
              Consent Approved
            </span>
          )}
        </div>

        {!consentForSelected ? (
          <div>
            <p className="text-xs text-[#5A7184] mb-3">
              Under SwasthAI privacy rules, request live in-app approval from {selectedMember.name} before accessing medical history, AI Health Reports, or generating a surgeon-facing Pre-Surgical Summary.
            </p>
            <button
              onClick={handleRequestConsent}
              className="bg-[#0B5D7A] hover:bg-[#084961] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Request Patient Access Approval
            </button>
          </div>
        ) : consentForSelected.status === 'PENDING' ? (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Clock size={16} className="animate-pulse" />
            <span>Waiting for patient approval... (Switch to Patient tab to Approve/Deny)</span>
          </div>
        ) : isApproved ? (
          <div className="space-y-4">
            {/* Existing AI Health Report if generated */}
            {state.aiHealthReport && (
              <div className="bg-[#EBF6FC] border border-[#AEDCF2] rounded-xl p-3.5 text-xs text-[#0F2A3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B5D7A]">Consolidated AI Health Report</span>
                  <AIBadge isDemoData={state.aiHealthReport.isDemoData} />
                </div>
                <p>
                  <strong>Patient:</strong> {state.aiHealthReport.patientName} ({state.aiHealthReport.period})
                </p>
                <p>
                  <strong>Chronic Conditions:</strong> {state.aiHealthReport.chronic_conditions.join(', ')}
                </p>
                <p>
                  <strong>Abnormal Trends:</strong> {state.aiHealthReport.abnormal_lab_trends.join('; ')}
                </p>
                <p className="text-[#5A7184] italic">{state.aiHealthReport.disclaimer}</p>
              </div>
            )}

            {/* Surgeon-Facing Pre-Surgical Health Summary */}
            <div className="border-t border-[#DFECF5] pt-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#0F2A3D] flex items-center gap-1.5">
                    <Stethoscope size={16} className="text-[#0B5D7A]" /> Surgeon-Facing Pre-Surgical Health Summary
                  </h3>
                  <p className="text-[11px] text-[#5A7184]">
                    Gemini-compiled history, allergies, medications, diagnostics &amp; prior surgeries (no risk scores or clearance).
                  </p>
                </div>
                <button
                  onClick={handleGeneratePreSurgical}
                  disabled={preSurgicalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5D7A] hover:bg-[#084961] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {preSurgicalLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    'Generate Pre-Surgical Summary'
                  )}
                </button>
              </div>

              {preSurgicalError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {preSurgicalError}
                </div>
              )}

              {preSurgical && (
                <div className="bg-[#F3F8FC] border border-[#AEDCF2] rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-[#0F2A3D] text-sm">
                      Pre-Surgical Summary — {preSurgical.patientName}
                    </span>
                    <AIBadge isDemoData={preSurgical.isDemoData} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-[#DFECF5]">
                      <div className="font-bold text-[#0B5D7A] mb-1">Medical History Overview</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {preSurgical.medical_history_overview.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-[#DFECF5]">
                      <div className="font-bold text-[#0B5D7A] mb-1">Allergies</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {preSurgical.allergies.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-[#DFECF5]">
                      <div className="font-bold text-[#0B5D7A] mb-1">Current Medications</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {preSurgical.current_medications.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-[#DFECF5]">
                      <div className="font-bold text-[#0B5D7A] mb-1">Recent Diagnostics &amp; Previous Surgeries</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {preSurgical.recent_diagnostics.map((item, i) => (
                          <li key={`d-${i}`}>{item}</li>
                        ))}
                        {preSurgical.previous_surgeries.map((item, i) => (
                          <li key={`s-${i}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] font-medium text-amber-900">
                    {preSurgical.disclaimer}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-red-600 font-medium">Consent denied by patient. Records remain locked.</p>
        )}
      </div>

      {/* Consent-Gated Medical Records Timeline */}
      {isApproved ? (
        <div className="space-y-4">
          {typeConfig.map(
            ({ key, label, icon }) =>
              recordsByType[key].length > 0 && (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <h3 className="text-sm font-bold text-[#0F2A3D]">{label}</h3>
                    <span className="text-xs bg-[#EBF6FC] text-[#0B5D7A] px-2 py-0.5 rounded-full font-semibold">
                      {recordsByType[key].length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {recordsByType[key].map(record => (
                      <RecordCard key={record.id} record={record} />
                    ))}
                  </div>
                </div>
              )
          )}
          {memberRecords.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No medical records found for {selectedMember.name}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-[#AEDCF2] p-8 text-center text-xs text-[#5A7184]">
          Medical timeline is locked until {selectedMember.name} approves access in the Patient view.
        </div>
      )}
    </div>
  );
}

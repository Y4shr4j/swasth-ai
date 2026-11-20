import React, { useState } from 'react';
import { FileText, Droplets, ScanLine, ChevronDown, ChevronUp, Lock, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SEED_FAMILY_MEMBERS } from '../../data/seedData';
import { FamilyMember, MedicalRecord } from '../../types';

function RecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false);
  const typeIcon: Record<string, React.ReactNode> = {
    PRESCRIPTION: <FileText size={16} className="text-blue-600" />,
    BLOODWORK: <Droplets size={16} className="text-red-500" />,
    SCAN: <ScanLine size={16} className="text-purple-600" />,
  };
  return (
    <div className={`bg-white rounded-lg border p-3 ${record.isAbnormal ? 'border-orange-300' : 'border-gray-200'}`}>
      <button className="w-full text-left" onClick={() => setExpanded((p) => !p)}>
        <div className="flex items-start gap-2">
          {typeIcon[record.type]}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{record.title}</span>
              {record.isAbnormal && (
                <span className="inline-flex items-center gap-0.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                  <AlertTriangle size={10} /> Abnormal
                </span>
              )}
            </div>
            <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
              <span>{record.visitDate}</span>
              <span>· {record.doctorName}</span>
              <span>· {record.clinicName}</span>
            </div>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
        </div>
      </button>
      {expanded && record.aiSummary && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-700 bg-gray-50 rounded px-2 py-1.5">
          <span className="font-semibold text-gray-800">AI Summary: </span>{record.aiSummary}
        </div>
      )}
      {expanded && record.type === 'PRESCRIPTION' && record.structuredData?.medicines && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-blue-50">
              <tr>
                {['Medicine', 'Dosage', 'Frequency', 'Duration'].map((h) => (
                  <th key={h} className="px-2 py-1 text-left text-blue-800 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {record.structuredData.medicines.map((m: any, i: number) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-2 py-1">{m.name}</td>
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

  const consentForSelected = state.consentRequests.find(
    (cr) =>
      cr.scope === 'FULL_AI_HEALTH_REPORT' &&
      cr.clinicId === 'clinic-1' &&
      cr.patientId === 'patient-rahul',
  );

  const memberRecords = state.medicalRecords.filter((r) => r.familyMemberId === selectedMember.id);
  const recordsByType = {
    PRESCRIPTION: memberRecords.filter((r) => r.type === 'PRESCRIPTION'),
    BLOODWORK: memberRecords.filter((r) => r.type === 'BLOODWORK'),
    SCAN: memberRecords.filter((r) => r.type === 'SCAN'),
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

  const typeConfig: { key: keyof typeof recordsByType; label: string; icon: React.ReactNode }[] = [
    { key: 'PRESCRIPTION', label: 'Prescriptions', icon: <FileText size={15} className="text-blue-600" /> },
    { key: 'BLOODWORK', label: 'Bloodwork', icon: <Droplets size={15} className="text-red-500" /> },
    { key: 'SCAN', label: 'Scans', icon: <ScanLine size={15} className="text-purple-600" /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Patient Records</h2>

      {/* Family member selector */}
      <div className="flex gap-3 flex-wrap">
        {SEED_FAMILY_MEMBERS.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
              ${selectedMember.id === member.id
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {member.name[0]}
            </div>
            <div className="text-left">
              <p className="font-semibold leading-tight">{member.name}</p>
              <p className="text-xs text-gray-500">{member.relation} · {member.age}y</p>
            </div>
          </button>
        ))}
      </div>

      {/* Consent gate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-amber-600" />
          <span className="font-semibold text-gray-900 text-sm">AI Health Report Access</span>
        </div>
        {!consentForSelected ? (
          <div>
            <p className="text-xs text-gray-600 mb-3">
              Request consent from {selectedMember.name} to view their full AI-generated health report.
            </p>
            <button
              onClick={handleRequestConsent}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Request AI Health Report Access
            </button>
          </div>
        ) : consentForSelected.status === 'PENDING' ? (
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Clock size={15} /> Waiting for patient approval...
          </div>
        ) : consentForSelected.status === 'APPROVED' ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700">✅ Access Approved</p>
            {state.aiHealthReport ? (
              <div className="bg-emerald-50 rounded-lg p-3 text-xs text-gray-800 space-y-1">
                <p><strong>Patient:</strong> {state.aiHealthReport.patientName}</p>
                <p><strong>Period:</strong> {state.aiHealthReport.period}</p>
                <p><strong>Chronic Conditions:</strong> {state.aiHealthReport.chronic_conditions.join(', ')}</p>
                <p><strong>Abnormal Trends:</strong> {state.aiHealthReport.abnormal_lab_trends.join('; ')}</p>
                <p className="text-gray-500 italic">{state.aiHealthReport.disclaimer}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No AI health report generated yet. Ask patient to generate one.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-red-600">❌ Consent denied by patient.</p>
        )}
      </div>

      {/* Medical records timeline */}
      <div className="space-y-4">
        {typeConfig.map(({ key, label, icon }) => (
          recordsByType[key].length > 0 && (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{recordsByType[key].length}</span>
              </div>
              <div className="space-y-2">
                {recordsByType[key].map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          )
        ))}
        {memberRecords.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No medical records found for {selectedMember.name}
          </div>
        )}
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_FAMILY_MEMBERS } from '../../data/seedData';
import { uploadMedicalDocument } from '../../services/geminiService';
import AIBadge from '../common/AIBadge';
import {
  ChevronDown,
  ChevronUp,
  Share2,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PRESCRIPTION: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Rx' },
  BLOODWORK: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lab' },
  SCAN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Scan' },
};

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function MedicalVault() {
  const { state, dispatch } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [memberFilter, setMemberFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(SEED_FAMILY_MEMBERS[0].id);
  const [docType, setDocType] = useState<'BLOODWORK' | 'PRESCRIPTION' | 'SCAN'>('BLOODWORK');
  const [title, setTitle] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const records = state.medicalRecords
    .filter(r => typeFilter === 'All' || r.type === typeFilter)
    .filter(r => memberFilter === 'All' || r.patientName === memberFilter)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  function handleShare(recTitle: string) {
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`,
        recipientPhone: '+91 98765 43210',
        recipientName: 'Rahul Sharma',
        type: 'REPORT_READY',
        title: 'Report Shared',
        body: `Medical record "${recTitle}" shared via SwasthAI.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError('');
    const chosen = e.target.files?.[0];
    if (!chosen) return;

    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setFileError('Unsupported file type. Please upload a PDF, PNG, JPG, or WebP file.');
      setFile(null);
      return;
    }
    if (chosen.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File exceeds the 10 MB size limit. Please choose a smaller document.');
      setFile(null);
      return;
    }

    setFile(chosen);
    if (!title.trim()) {
      setTitle(chosen.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
    }
  }

  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a PDF or image file to upload.');
      return;
    }

    const member = SEED_FAMILY_MEMBERS.find(m => m.id === selectedMemberId) || SEED_FAMILY_MEMBERS[0];
    setUploading(true);
    setFileError('');

    try {
      const base64 = await fileToBase64(file);
      const recordTitle = title.trim() || file.name;

      const savedRecord = await uploadMedicalDocument({
        base64Data: base64,
        mimeType: file.type,
        fileName: file.name,
        patientId: 'patient-rahul',
        patientName: member.name,
        familyMemberId: member.id,
        docType,
        title: recordTitle,
        clinicName: clinicName.trim() || 'Uploaded Past Record',
        visitDate,
      });

      dispatch({
        type: 'ADD_MEDICAL_RECORD',
        payload: savedRecord,
      });

      dispatch({
        type: 'ADD_WHATSAPP_MESSAGE',
        payload: {
          id: `wa-${Date.now()}`,
          recipientPhone: member.phone,
          recipientName: member.name,
          type: 'REPORT_READY',
          title: 'Medical History Uploaded',
          body: `"${recordTitle}" for ${member.name} has been saved securely and added to your Health Vault.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      });

      // Reset & show newly added record
      setShowUpload(false);
      setFile(null);
      setTitle('');
      setClinicName('');
      setExpanded(savedRecord.id);
      setUploadSuccess(`"${recordTitle}" uploaded & persisted in ${member.name}'s timeline.`);
      setTimeout(() => setUploadSuccess(null), 4500);
    } catch (err: any) {
      setFileError(err?.message || 'Failed to process the uploaded file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Health Records</h2>
          <p className="text-xs text-slate-500">Prescriptions, labs &amp; past history</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm transition shrink-0"
        >
          <Upload className="w-4 h-4" /> Upload History
        </button>
      </div>

      {/* Upload Success Banner */}
      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {['All', 'PRESCRIPTION', 'BLOODWORK', 'SCAN'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              typeFilter === t ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t === 'All' ? 'All' : TYPE_STYLES[t]?.label || t}
          </button>
        ))}
      </div>

      {/* Family Member Filter */}
      <select
        value={memberFilter}
        onChange={e => setMemberFilter(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
      >
        <option value="All">All Family Members</option>
        {SEED_FAMILY_MEMBERS.map(m => (
          <option key={m.id} value={m.name}>
            {m.name} ({m.relation})
          </option>
        ))}
      </select>

      {/* Records List */}
      <div className="space-y-2">
        {records.map(rec => {
          const style = TYPE_STYLES[rec.type] || TYPE_STYLES.PRESCRIPTION;
          const isOpen = expanded === rec.id;
          return (
            <div key={rec.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : rec.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${style.bg} ${style.text}`}
                >
                  {style.label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{rec.title}</div>
                  <div className="text-xs text-slate-500">
                    {rec.patientName} • {rec.clinicName} • {rec.visitDate}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {rec.isAbnormal && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      ⚠ Abnormal
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-3 space-y-2.5">
                  {rec.aiSummary && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Extracted Summary</span>
                        <AIBadge isDemoData={Boolean(rec.structuredData?.isDemoData)} />
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">{rec.aiSummary}</p>
                    </div>
                  )}

                  {rec.structuredData?.medicines && (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Medicines</div>
                      <div className="space-y-1">
                        {rec.structuredData.medicines.map((m: any, i: number) => (
                          <div key={i} className="text-xs bg-emerald-50 rounded p-2 flex justify-between gap-2">
                            <span className="font-medium text-emerald-800">{m.name}</span>
                            <span className="text-emerald-600 text-right">
                              {m.dosage} • {m.frequency} • {m.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.structuredData?.tests && (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Test Results</div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="pb-1">Test</th>
                            <th className="pb-1">Value</th>
                            <th className="pb-1">Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rec.structuredData.tests.map((t: any, i: number) => (
                            <tr key={i} className="border-t border-slate-50">
                              <td className="py-1 font-medium">{t.name}</td>
                              <td>{t.value}</td>
                              <td className="text-slate-500">{t.range}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleShare(rec.title)}
                      className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share Record
                    </button>
                    {rec.fileUrl && (
                      <a
                        href={rec.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Original File
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Previous Medical History Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Upload Medical History</h3>
                  <p className="text-[11px] text-slate-500">PDFs, lab reports, prescriptions or scans</p>
                </div>
              </div>
              <button
                onClick={() => !uploading && setShowUpload(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Select Document (PDF or Image, max 10 MB)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-5 text-center transition ${
                    file
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
                  }`}
                >
                  {file ? (
                    <div className="space-y-1">
                      <FileText className="w-7 h-7 text-emerald-600 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800 truncate px-2">{file.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • Tap to change file
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <div className="text-xs font-semibold text-slate-700">Tap to choose PDF or photo</div>
                      <div className="text-[11px] text-slate-400">Supports PDF, JPG, PNG, WebP</div>
                    </div>
                  )}
                </button>
                {fileError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              {/* Family Member & Record Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Patient / Member</label>
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SEED_FAMILY_MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Record Type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as 'BLOODWORK' | 'PRESCRIPTION' | 'SCAN')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BLOODWORK">Lab / Bloodwork</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="SCAN">Scan / X-Ray / ECG</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count or Old Prescription"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Clinic / Lab & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Hospital / Lab Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="e.g. Lal PathLabs"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Report Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Upload &amp; Extract with Gemini
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

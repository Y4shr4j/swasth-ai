import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { callVoicePrescription } from '../../services/geminiService';
import AIBadge from '../common/AIBadge';
import { Mic, MicOff, Brain, ArrowLeft, CheckCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Appointment, PrescriptionMedicine } from '../../types';

export default function VoicePrescription({ appointment, onBack }: { appointment: Appointment; onBack: () => void }) {
  const { state, dispatch } = useAppStore();
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Editable fields from AI output
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [tests, setTests] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isDemoData, setIsDemoData] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);

  const recognitionRef = useRef<any>(null);

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser. Please type the transcript.'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  async function handleExtract() {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const result = await callVoicePrescription(transcript, state.geminiApiKey);
      setDiagnosis(result.symptoms_diagnosis);
      setMedicines([...result.medicines]);
      setTests(result.recommended_tests_scans.join('\n'));
      setFollowUp(result.follow_up_notes);
      setIsDemoData(result.is_demo_data || false);
      setHasOutput(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    // Add prescription to medical records
    dispatch({
      type: 'ADD_MEDICAL_RECORD',
      payload: {
        id: `rec-${Date.now()}`, patientId: appointment.patientId, patientName: appointment.patientName,
        clinicId: appointment.clinicId, clinicName: appointment.clinicName, doctorName: appointment.doctorName,
        visitDate: new Date().toISOString().slice(0, 10), type: 'PRESCRIPTION',
        title: `Consultation — ${diagnosis.slice(0, 50)}`,
        structuredData: {
          symptoms_diagnosis: diagnosis,
          medicines,
          recommended_tests_scans: tests.split('\n').filter(Boolean),
          follow_up_notes: followUp,
          is_ai_draft: false,
        },
        aiSummary: `${diagnosis}. ${medicines.length} medicines prescribed.`,
      },
    });

    // Complete appointment
    dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id: appointment.id, status: 'COMPLETED' } });

    // WhatsApp
    const medsText = medicines.map(m => `💊 ${m.name} — ${m.dosage}, ${m.frequency}, ${m.duration}`).join('\n');
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`, recipientPhone: appointment.patientPhone, recipientName: appointment.patientName,
        type: 'PRESCRIPTION_DELIVERY', title: '📋 New Prescription from Dr. Arvind Rao',
        body: `Hi ${appointment.patientName}!\n\nYour prescription is ready:\n\n📌 ${diagnosis}\n\n${medsText}\n\n🔬 Tests: ${tests}\n\n📝 ${followUp}\n\nView full details in your SwasthAI Health Vault.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });

    setSent(true);
  }

  function addMedicine() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  }

  function updateMedicine(index: number, field: keyof PrescriptionMedicine, value: string) {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  }

  function removeMedicine(index: number) {
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
        <h3 className="text-2xl font-bold text-slate-900">Prescription Sent!</h3>
        <p className="text-slate-500">Prescription delivered to <span className="font-semibold">{appointment.patientName}</span> via the app and simulated WhatsApp.</p>
        <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
          <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Voice Prescription</h2>
          <p className="text-sm text-slate-500">Patient: {appointment.patientName} • {appointment.symptoms}</p>
        </div>
      </div>

      {/* Transcript Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <label className="text-sm font-medium text-slate-700">Consultation Transcript</label>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
          placeholder="Speak or type your consultation notes here... e.g. 'Patient has persistent dry cough for 2 days with mild fever. Prescribe Amoxicillin-Clavulanate 625mg twice daily for 5 days. Recommend CBC and chest X-ray if cough persists.'"
          className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex items-center gap-3">
          <button onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              isRecording ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            {isRecording ? <><MicOff className="w-4 h-4" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Start Recording</>}
          </button>
          <button onClick={handleExtract} disabled={!transcript.trim() || loading}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-40">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Brain className="w-4 h-4" /> Extract with Gemini</>}
          </button>
        </div>
      </div>

      {/* Structured Output */}
      {hasOutput && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Structured Prescription</h3>
            <AIBadge isDemoData={isDemoData} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Diagnosis / Symptoms</label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Medicines</label>
              <button onClick={addMedicine} className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:text-emerald-700">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {medicines.map((m, i) => (
                <div key={i} className="bg-emerald-50 rounded-lg p-3 grid grid-cols-4 gap-2 relative">
                  <input value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="Medicine"
                    className="col-span-4 sm:col-span-1 px-2 py-1.5 border border-emerald-200 rounded text-xs bg-white" />
                  <input value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="Dosage"
                    className="px-2 py-1.5 border border-emerald-200 rounded text-xs bg-white" />
                  <input value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} placeholder="Frequency"
                    className="px-2 py-1.5 border border-emerald-200 rounded text-xs bg-white" />
                  <div className="flex gap-1">
                    <input value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} placeholder="Duration"
                      className="flex-1 px-2 py-1.5 border border-emerald-200 rounded text-xs bg-white" />
                    <button onClick={() => removeMedicine(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Recommended Tests / Scans</label>
            <textarea value={tests} onChange={e => setTests(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Follow-up Notes</label>
            <textarea value={followUp} onChange={e => setFollowUp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <button onClick={handleSend}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Verify & Send Prescription
          </button>
        </div>
      )}
    </div>
  );
}

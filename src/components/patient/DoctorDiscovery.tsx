import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_DOCTORS, SEED_CLINICS } from '../../data/seedData';
import { Star, MapPin, IndianRupee, X, Clock, CreditCard, CheckCircle } from 'lucide-react';

const SPECIALTIES = ['All', 'General Physician', 'Cardiologist', 'Pediatrician', 'Orthopedic', 'Dermatologist'];
const DEMO_DATES = ['Today, Nov 20', 'Tomorrow, Nov 21', 'Sat, Nov 22'];

export default function DoctorDiscovery() {
  const { dispatch } = useAppStore();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [bookingDoc, setBookingDoc] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(DEMO_DATES[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'done'>('select');

  const filtered = SEED_DOCTORS.filter(d => {
    const matchSpec = filter === 'All' || d.specialization.toLowerCase().includes(filter.toLowerCase());
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const activeDoc = SEED_DOCTORS.find(d => d.id === bookingDoc);
  const activeClinic = activeDoc ? SEED_CLINICS.find(c => c.id === activeDoc.clinicId) : null;

  function handleConfirm() {
    if (!activeDoc || !activeClinic) return;
    const apt = {
      id: `apt-${Date.now()}`, patientId: 'patient-rahul', patientName: 'Rahul Sharma', patientPhone: '+91 98765 43210',
      doctorId: activeDoc.id, doctorName: activeDoc.name, doctorSpecialty: activeDoc.specialization,
      clinicId: activeClinic.id, clinicName: activeClinic.name, clinicAddress: activeClinic.address,
      slotTime: selectedSlot, slotDate: selectedDate, status: 'BOOKED' as const,
      queuePosition: 4, feePaid: true, symptoms,
    };
    dispatch({ type: 'ADD_APPOINTMENT', payload: apt });
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`, recipientPhone: '+91 98765 43210', recipientName: 'Rahul Sharma',
        type: 'BOOKING_CONFIRMATION', title: '📅 Appointment Confirmed!',
        body: `Hi Rahul!\n\nYour appointment is confirmed:\n\n👨‍⚕️ ${activeDoc.name}\n${activeDoc.specialization}\n🏥 ${activeClinic.name}\n📍 ${activeClinic.area}\n🕐 ${selectedSlot}, ${selectedDate}\n💰 ₹${activeDoc.consultationFee} (Paid)\n\nPlease arrive 10 minutes early and scan the clinic QR code to check in.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setStep('done');
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Find a Doctor</h2>

      <input
        type="text" placeholder="Search doctors, specialties..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(doc => {
          const clinic = SEED_CLINICS.find(c => c.id === doc.clinicId);
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                  {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{doc.name}</div>
                  <div className="text-xs text-emerald-600 font-medium">{doc.specialization}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate">{doc.education}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{clinic?.area} ({clinic?.distanceKm} km)</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{doc.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-800"><IndianRupee className="w-3.5 h-3.5" />{doc.consultationFee}</span>
                <button onClick={() => { setBookingDoc(doc.id); setStep('select'); setSelectedSlot(doc.availableSlots[0]); }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Book</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {bookingDoc && activeDoc && activeClinic && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="bg-emerald-600 px-5 py-3 flex items-center justify-between text-white">
              <span className="font-semibold text-sm">{step === 'done' ? 'Booking Confirmed!' : 'Book Appointment'}</span>
              <button onClick={() => setBookingDoc(null)} className="p-1 hover:bg-white/20 rounded"><X className="w-5 h-5" /></button>
            </div>

            {step === 'done' ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Appointment Booked!</h3>
                <p className="text-sm text-slate-500">{activeDoc.name} • {selectedSlot}, {selectedDate}</p>
                <p className="text-xs text-slate-400">A WhatsApp confirmation has been sent.</p>
                <button onClick={() => setBookingDoc(null)} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium">Done</button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">{activeDoc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div>
                    <div className="font-semibold text-sm">{activeDoc.name}</div>
                    <div className="text-xs text-slate-500">{activeClinic.name} • {activeClinic.area}</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Select Date</label>
                  <div className="flex gap-2">
                    {DEMO_DATES.map(d => (
                      <button key={d} onClick={() => setSelectedDate(d)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition ${selectedDate === d ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{d.split(', ')[0]}<br/><span className="text-[10px]">{d.split(', ')[1]}</span></button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Select Time</label>
                  <div className="flex gap-2 flex-wrap">
                    {activeDoc.availableSlots.map(s => (
                      <button key={s} onClick={() => setSelectedSlot(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedSlot === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />{s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Symptoms (optional)</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe your symptoms..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                {step === 'select' && (
                  <button onClick={() => setStep('payment')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <CreditCard className="w-4 h-4" /> Pay ₹{activeDoc.consultationFee} & Book
                  </button>
                )}

                {step === 'payment' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-medium text-blue-800 text-center">Payment Simulation</div>
                    <div className="text-2xl font-bold text-blue-700 text-center">₹{activeDoc.consultationFee}</div>
                    <button onClick={handleConfirm}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
                      ✓ Complete Payment & Confirm
                    </button>
                    <p className="text-xs text-slate-400 text-center">Simulated payment — no real charges</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

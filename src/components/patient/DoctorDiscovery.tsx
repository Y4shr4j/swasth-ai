import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SEED_DOCTORS, SEED_CLINICS, SEED_FAMILY_MEMBERS } from '../../data/seedData';
import {
  Star,
  MapPin,
  IndianRupee,
  X,
  Clock,
  CheckCircle,
  Navigation,
  Building2,
  Video,
  Home,
  Users,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import type { ConsultationMode } from '../../types';

const SPECIALTIES = ['All', 'General Physician', 'Cardiologist', 'Pediatrician', 'Orthopedic', 'Dermatologist'];
const DEMO_DATES = ['Today, Nov 20', 'Tomorrow, Nov 21', 'Sat, Nov 22'];

const MANUAL_AREAS: Record<string, { label: string; lat: number; lng: number }> = {
  indiranagar: { label: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  koramangala: { label: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  hsr: { label: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  mgroad: { label: 'MG Road / Central', lat: 12.9756, lng: 77.6066 },
};

const CONSULTATION_MODES: { id: ConsultationMode; label: string; icon: typeof Building2; note: string }[] = [
  { id: 'IN_CLINIC', label: 'In-Clinic', icon: Building2, note: 'QR Check-in & Live Queue' },
  { id: 'VIDEO', label: 'Video', icon: Video, note: 'Remote consultation mode' },
  { id: 'HOME_VISIT', label: 'Home Visit', icon: Home, note: 'Doctor home visit request' },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export default function DoctorDiscovery() {
  const { dispatch } = useAppStore();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Ephemeral location state (never persisted to storage or backend)
  const [manualAreaKey, setManualAreaKey] = useState<string>('indiranagar');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');

  // Booking modal state
  const [bookingDoc, setBookingDoc] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(DEMO_DATES[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('IN_CLINIC');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(SEED_FAMILY_MEMBERS[0].id);
  const [symptoms, setSymptoms] = useState('');
  const [bookedDone, setBookedDone] = useState(false);

  const activeOrigin = gpsCoords || MANUAL_AREAS[manualAreaKey];

  function requestOneTimeGPS() {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        // Keep coordinates strictly in ephemeral component state only
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('granted');
      },
      () => {
        setGpsCoords(null);
        setGpsStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  function getClinicDistance(clinicId: string): number {
    const clinic = SEED_CLINICS.find(c => c.id === clinicId);
    if (!clinic) return 0;
    return haversineKm(activeOrigin.lat, activeOrigin.lng, clinic.coords.lat, clinic.coords.lng);
  }

  const filtered = SEED_DOCTORS.filter(d => {
    const matchSpec = filter === 'All' || d.specialization.toLowerCase().includes(filter.toLowerCase());
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  }).sort((a, b) => getClinicDistance(a.clinicId) - getClinicDistance(b.clinicId));

  const activeDoc = SEED_DOCTORS.find(d => d.id === bookingDoc);
  const activeClinic = activeDoc ? SEED_CLINICS.find(c => c.id === activeDoc.clinicId) : null;
  const selectedMember = SEED_FAMILY_MEMBERS.find(m => m.id === selectedMemberId) || SEED_FAMILY_MEMBERS[0];

  function handleConfirmBooking() {
    if (!activeDoc || !activeClinic) return;
    const modeLabel =
      consultationMode === 'IN_CLINIC' ? 'In-Clinic' : consultationMode === 'VIDEO' ? 'Video Consult' : 'Home Visit';

    const apt = {
      id: `apt-${Date.now()}`,
      patientId: 'patient-rahul',
      patientName: selectedMember.name,
      patientPhone: selectedMember.phone,
      familyMemberId: selectedMember.id,
      familyMemberName: selectedMember.name,
      doctorId: activeDoc.id,
      doctorName: activeDoc.name,
      doctorSpecialty: activeDoc.specialization,
      clinicId: activeClinic.id,
      clinicName: activeClinic.name,
      clinicAddress: activeClinic.address,
      slotTime: selectedSlot,
      slotDate: selectedDate,
      consultationMode,
      status: 'BOOKED' as const,
      queuePosition: 4,
      feePaid: false,
      symptoms,
    };

    dispatch({ type: 'ADD_APPOINTMENT', payload: apt });
    dispatch({
      type: 'ADD_WHATSAPP_MESSAGE',
      payload: {
        id: `wa-${Date.now()}`,
        recipientPhone: selectedMember.phone,
        recipientName: selectedMember.name,
        type: 'BOOKING_CONFIRMATION',
        title: `Appointment Booked (${modeLabel})`,
        body: `Patient: ${selectedMember.name} (${selectedMember.relation})\nDoctor: ${activeDoc.name} (${activeDoc.specialization})\nClinic: ${activeClinic.name}, ${activeClinic.area}\nMode: ${modeLabel}\nTime: ${selectedSlot}, ${selectedDate}\nFee: ₹${activeDoc.consultationFee} (Pay at consultation — zero upfront payment)`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setBookedDone(true);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0F2A3D]">Find a Doctor</h2>
        <button
          onClick={requestOneTimeGPS}
          disabled={gpsStatus === 'locating'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF6FC] text-[#0B5D7A] border border-[#AEDCF2] text-xs font-semibold hover:bg-[#D6EEF9] transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          {gpsStatus === 'locating' ? 'Locating...' : gpsStatus === 'granted' ? 'GPS Active' : 'Use GPS'}
        </button>
      </div>

      {/* Location Selector / GPS Status */}
      <div className="bg-white rounded-2xl border border-[#DFECF5] p-3 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#5A7184] min-w-0">
          <MapPin className="w-4 h-4 text-[#0B5D7A] shrink-0" />
          {gpsStatus === 'granted' ? (
            <span className="font-medium text-[#0B5D7A] truncate">
              Live GPS distance (not stored)
            </span>
          ) : (
            <span className="truncate">
              {gpsStatus === 'denied' ? 'GPS unavailable — manual area:' : 'Area:'}
            </span>
          )}
        </div>
        <select
          value={manualAreaKey}
          onChange={e => {
            setManualAreaKey(e.target.value);
            setGpsCoords(null);
            setGpsStatus('idle');
          }}
          className="px-2.5 py-1 bg-[#F3F8FC] border border-[#D6E8F7] rounded-lg text-xs font-semibold text-[#0F2A3D] focus:outline-none"
        >
          {Object.entries(MANUAL_AREAS).map(([key, area]) => (
            <option key={key} value={key}>
              {area.label}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Search doctors, specialties..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-[#DFECF5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D7A]"
      />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SPECIALTIES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filter === s ? 'bg-[#0B5D7A] text-white shadow-sm' : 'bg-[#EBF6FC] text-[#0B5D7A] hover:bg-[#D6EEF9]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(doc => {
          const clinic = SEED_CLINICS.find(c => c.id === doc.clinicId);
          const distKm = getClinicDistance(doc.clinicId);
          return (
            <div key={doc.id} className="bg-white rounded-2xl border border-[#DFECF5] p-4 shadow-[0_2px_12px_rgba(11,93,122,0.05)] hover:border-[#AEDCF2] transition">
              <div className="flex gap-3">
                <Avatar src={doc.avatar} name={doc.name} className="w-14 h-14 rounded-2xl ring-2 ring-[#EBF6FC]" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#0F2A3D]">{doc.name}</div>
                  <div className="text-xs text-[#0EA5A4] font-semibold">{doc.specialization}</div>
                  <div className="text-xs text-[#5A7184] mt-0.5 truncate">{doc.education}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#5A7184]">
                    <span className="flex items-center gap-1 font-medium text-[#0B5D7A]">
                      <MapPin className="w-3 h-3" />
                      {clinic?.area} ({distKm} km)
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {doc.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EBF6FC]">
                <div>
                  <span className="flex items-center gap-0.5 text-sm font-bold text-[#0F2A3D]">
                    <IndianRupee className="w-3.5 h-3.5 text-[#0B5D7A]" />
                    {doc.consultationFee}
                  </span>
                  <span className="text-[10px] text-[#5A7184]">Pay at clinic • Zero upfront</span>
                </div>
                <button
                  onClick={() => {
                    setBookingDoc(doc.id);
                    setBookedDone(false);
                    setConsultationMode('IN_CLINIC');
                    setSelectedMemberId(SEED_FAMILY_MEMBERS[0].id);
                    setSelectedSlot(doc.availableSlots[0]);
                    setSymptoms('');
                  }}
                  className="px-4 py-2 bg-[#0B5D7A] text-white rounded-full text-xs font-semibold hover:bg-[#084961] shadow-sm transition"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero-Pay Booking Modal */}
      {bookingDoc && activeDoc && activeClinic && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[#0B5D7A] px-5 py-3.5 flex items-center justify-between text-white">
              <span className="font-semibold text-sm">{bookedDone ? 'Appointment Confirmed!' : 'Book Appointment'}</span>
              <button onClick={() => setBookingDoc(null)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookedDone ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle className="w-16 h-16 text-[#0EA5A4] mx-auto" />
                <h3 className="text-lg font-bold text-[#0F2A3D]">Appointment Booked!</h3>
                <p className="text-sm text-[#5A7184]">
                  For <span className="font-semibold text-[#0F2A3D]">{selectedMember.name} ({selectedMember.relation})</span>
                </p>
                <p className="text-xs text-[#0B5D7A] font-medium">
                  {activeDoc.name} • {selectedSlot}, {selectedDate} •{' '}
                  {consultationMode === 'IN_CLINIC' ? 'In-Clinic' : consultationMode === 'VIDEO' ? 'Video Consult' : 'Home Visit'}
                </p>
                <p className="text-xs text-[#5A7184]">No upfront payment charged. Pay ₹{activeDoc.consultationFee} at consultation.</p>
                <button
                  onClick={() => setBookingDoc(null)}
                  className="mt-4 px-6 py-2.5 bg-[#0B5D7A] text-white rounded-xl font-semibold text-sm hover:bg-[#084961]"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar src={activeDoc.avatar} name={activeDoc.name} className="w-12 h-12 rounded-2xl ring-2 ring-[#EBF6FC]" />
                  <div>
                    <div className="font-bold text-sm text-[#0F2A3D]">{activeDoc.name}</div>
                    <div className="text-xs text-[#5A7184]">
                      {activeClinic.name} • {getClinicDistance(activeClinic.id)} km
                    </div>
                  </div>
                </div>

                {/* Family Member Selector */}
                <div>
                  <label className="text-xs font-semibold text-[#0F2A3D] mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#0B5D7A]" /> Booking For
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SEED_FAMILY_MEMBERS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                          selectedMemberId === m.id
                            ? 'bg-[#0B5D7A] text-white border-[#0B5D7A]'
                            : 'bg-[#F3F8FC] text-[#0F2A3D] border-[#DFECF5] hover:border-[#AEDCF2]'
                        }`}
                      >
                        <div className="truncate">{m.name.split(' ')[0]}</div>
                        <div className={`text-[10px] ${selectedMemberId === m.id ? 'text-[#CBE7F3]' : 'text-[#5A7184]'}`}>
                          {m.relation}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Mode Selector */}
                <div>
                  <label className="text-xs font-semibold text-[#0F2A3D] mb-1.5 block">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CONSULTATION_MODES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setConsultationMode(id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                          consultationMode === id
                            ? 'bg-[#0B5D7A] text-white border-[#0B5D7A]'
                            : 'bg-[#F3F8FC] text-[#0F2A3D] border-[#DFECF5] hover:border-[#AEDCF2]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-xs font-semibold text-[#0F2A3D] mb-1.5 block">Select Date</label>
                  <div className="flex gap-2">
                    {DEMO_DATES.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          selectedDate === d ? 'bg-[#0B5D7A] text-white' : 'bg-[#EBF6FC] text-[#0B5D7A] hover:bg-[#D6EEF9]'
                        }`}
                      >
                        {d.split(', ')[0]}
                        <br />
                        <span className="text-[10px] opacity-80">{d.split(', ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="text-xs font-semibold text-[#0F2A3D] mb-1.5 block">Select Time</label>
                  <div className="flex gap-2 flex-wrap">
                    {activeDoc.availableSlots.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          selectedSlot === s ? 'bg-[#0B5D7A] text-white' : 'bg-[#EBF6FC] text-[#0B5D7A] hover:bg-[#D6EEF9]'
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="text-xs font-semibold text-[#0F2A3D] mb-1.5 block">Symptoms (optional)</label>
                  <textarea
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms for the doctor..."
                    className="w-full px-3 py-2 border border-[#DFECF5] rounded-xl text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[#0B5D7A]"
                  />
                </div>

                {/* Zero-Pay Instant Book Button */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full py-3 bg-[#0B5D7A] text-white rounded-xl font-semibold hover:bg-[#084961] shadow-sm transition text-sm"
                  >
                    Book Appointment
                  </button>
                  <p className="text-[11px] text-center text-[#5A7184]">
                    Zero upfront payment • Consultation fee ₹{activeDoc.consultationFee} payable at visit
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

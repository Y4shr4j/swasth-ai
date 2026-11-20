# Project Prototype Specification — Google DeepMind & Google Cloud Startup Buildathon

## 1. Objective & Prototype Scope
Build a **clean, fast, functional web prototype** (mobile-first responsive UI so both Mobile Patient View and Desktop Clinic/Admin Views can be demonstrated seamlessly) deployed on **Google Cloud** and powered by **Google AI (Gemini)**.

### Jury Demo Priorities (Aligned to Evaluation Rubric)
* **Functional Product & Implementation (30%) & UX (10%):** End-to-end live working flow for **Patient** and **Clinic (Doctor & Receptionist)**, plus lightweight functional views with pre-seeded data for **Company (Admin)** and **Diagnostics/Pharmacy**.
* **Google AI Integration Depth (20%):** Live Gemini API integration (no hardcoded mock AI outputs) for:
  1. **Voice-to-Structured Prescription** (Doctor workflow).
  2. **Consolidated Family AI Health Report** across past prescriptions, scans, bloodwork, and custom date ranges (Patient workflow).
  3. **Clinic Performance & AI Growth Suggestions** (Clinic workflow).
* **Technical Architecture (20%):** Deployed on **Google Cloud** with real-time state sync (live queue updates & live In-App Approve/Deny consent gate).
* **Simulations Allowed for Demo:** WhatsApp notifications/sharing must be **simulated cleanly in the UI** (e.g., an in-app "WhatsApp Preview / Simulated Message Sent" drawer/toast) rather than live WhatsApp Business API integration. Subscription/report payments can be simulated with a 1-click "Complete Payment" modal.

---

## 2. Recommended Google Cloud & Google AI Stack (Fastest Build)
* **Frontend:** React / Next.js (Tailwind CSS, mobile-responsive layout with a top **Role Switcher Bar** for instant switching during the jury demo: *Patient*, *Doctor*, *Receptionist*, *Admin*, *Diagnostics/Pharmacy*).
* **Backend & Hosting:** **Google Cloud Run** (Node.js/Python FastAPI) or **Firebase Hosting + Cloud Functions**.
* **Database & Real-Time Sync:** **Cloud Firestore** (essential for instant real-time updates when Patient scans QR $\rightarrow$ Receptionist/Doctor queue updates $\rightarrow$ Doctor clicks "Next" $\rightarrow$ Patient sees live queue position; and for real-time In-App Approve/Deny consent).
* **File Storage:** **Google Cloud Storage (GCS)** (stores uploaded scans, bloodwork PDFs/images, and ID documents).
* **Google AI Models (via Vertex AI or Google AI Studio SDK):**
  * `gemini-2.5-flash` (or `gemini-2.5-pro`): Multimodal audio-to-JSON for Doctor Voice Prescriptions, multi-document medical synthesis for Patient AI Health Reports, and Clinic analytics suggestions.

---

## 3. Core Data Entities & Strict Privacy Rule

### Strict Consent & Privacy Architecture
* **Rule:** No clinic, doctor, diagnostic center, or pharmacy can view a patient's past medical records or AI Health Report without **explicit real-time In-App Approval** from the patient (only the Company/Admin sees aggregated platform metrics).
* **Implementation:** When a Clinic clicks *"Request Full AI Health Report"*, create a `consent_requests` document in Firestore (`status: "PENDING"`). The Patient app listens in real time and pops up an **Approve / Deny** modal. Only when `status === "APPROVED"` does the backend/Firestore rule expose the report to that specific clinic.

### Core Firestore Collections
1. `users`: `id`, `role` (`ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PATIENT`, `DIAGNOSTIC`), `name`, `phone`, `uniqueHealthId`, `clinicId` (if clinic staff).
2. `family_members`: `id`, `primaryPatientId`, `name`, `relation`, `age`, `govIds` (`pan`, `aadhaar`, `cghs`, `echs`, `ayushman`), `insuranceDocUrl`.
3. `clinics`: `id`, `name`, `area`, `distanceKm` (e.g., within 5 km), `qrCodeToken`, `subscriptionPlan` (`MONTHLY`/`YEARLY`), `subscriptionStatus` (`ACTIVE`/`INACTIVE`), `listingActive`.
4. `doctors`: `id`, `clinicId`, `name`, `specialization`, `education`, `consultationFee`, `availableSlots`.
5. `appointments_queue`: `id`, `patientId`, `patientName`, `familyMemberId` (optional), `doctorId`, `clinicId`, `slotTime`, `status` (`BOOKED`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `NO_SHOW`), `queuePosition`, `checkedInAt`, `feePaid`.
6. `medical_records`: `id`, `patientId`, `familyMemberId` (optional), `clinicId`, `doctorName`, `visitDate`, `type` (`PRESCRIPTION`, `SCAN`, `BLOODWORK`), `structuredData` (medications, dosage, tests, symptoms), `fileUrl`, `aiSummary`.
7. `consent_requests`: `id`, `patientId`, `clinicId`, `clinicName`, `status` (`PENDING`, `APPROVED`, `DENIED`), `requestedAt`.

---

## 4. End-to-End Prototype Workflows to Build

### A. Primary Live Demo Flow: Patient + Clinic (Must Be 100% Functional)

#### Step 1: Discovery & Booking (Patient View)
* Patient opens app $\rightarrow$ searches nearby doctors within **5 km** filtered by **Location, Fees, Distance, and Specialization**.
* Patient selects a doctor and clicks **Book**.
* **System Action:**
  * Creates an active consultation record (`status: "BOOKED"`).
  * Triggers a **Simulated WhatsApp Confirmation Card** displaying: Patient Name, Phone, Clinic Name & Address, Doctor Name, Specialization/Education, and Booked Time.

#### Step 2: QR Scan Check-In & Live Queue (Patient + Receptionist + Doctor Views)
* Patient arrives at clinic $\rightarrow$ taps the prominently placed **Scan Clinic QR** button on the Patient home screen (provide both camera QR scan and a 1-click *"Simulate Scan Clinic QR"* button for smooth stage demos).
* Patient sees clinic details and clicks **Check In**.
* **System Action (Real-Time Firestore Sync):**
  * Updates status to `CHECKED_IN`, records `checkedInAt`, and assigns `queuePosition`.
  * **Receptionist & Doctor Dashboards** immediately display the patient's profile, check-in time, and updated queue count (*Total Booked* vs. *Total Checked In*).
* **Queue Progression:**
  * Doctor clicks **Next Patient**.
  * **Receptionist** gets an instant alert to send the next patient in.
  * **Patient** gets an instant notification showing their updated live **Queue Position** (or *"It's your turn now"*).

#### Step 3: Voice-Based Prescription & Delivery (Doctor $\rightarrow$ Patient)
* Post-consultation, Doctor clicks **Voice Prescription**, speaks the diagnosis, medicines, dosage, duration, and recommended lab tests/scans.
* **Google AI Action:** Send audio/transcript to **Gemini** with a strict JSON schema to extract:
  * `symptoms_diagnosis`
  * `medicines` (`name`, `dosage`, `frequency`, `duration`)
  * `recommended_tests_scans`
  * `follow_up_notes`
* Doctor reviews/edits the structured output on screen, verifies it, and clicks **Send Prescription**.
* **System Action:**
  * Saves prescription to `medical_records` under the visit date.
  * Instantly delivers it to the **Patient's App** AND triggers a **Simulated WhatsApp Prescription Delivery** preview.
  * Marks consultation as `COMPLETED` (automatically moving it into Patient's Past Bookings/History).

#### Step 4: Consolidated Vault, Family Profiles & AI Health Report (Patient View)
* **Unified Health Documents:** Displays all past prescriptions, scans, and bloodwork in one place, sorted **latest first**, filterable by **Date, Clinic, Month, and Year**.
* **Profile & Family Management:**
  * Main profile + ability to **Add Family Members** (each family member gets their own dedicated sub-profile page with Name, Phone, Insurance, PAN, Aadhaar, CGHS, ECHS, and Ayushman IDs, plus their own medical history).
* **AI Health Report Generator (Paid Feature Simulation):**
  * Patient selects self or a family member + optional **Custom Date Range** (e.g., Last 6 Months / All Time) and clicks **Generate AI Health Report**.
  * **Google AI Action:** Passes all selected historical prescriptions, symptoms, bloodwork, surgeries, and scans to **Gemini** to generate a structured longitudinal summary (Chronic Conditions, Medication History, Abnormal Lab Trends, Severity/Attention Flags, and Doctor Discussion Points).
* **Clinic Consent Gate:**
  * On the Doctor dashboard, clicking **Request Patient AI Health Report** sends a real-time prompt to the Patient app.
  * Patient clicks **Approve** or **Deny**. Only upon **Approve** does the report render on the Doctor's screen.
* **Pharmacy & Diagnostics Sharing:**
  * Patient selects any prescription or lab report and clicks **Share via WhatsApp** (simulated preview) or shows their **Unique Health ID / Phone** to complete pharmacy/diagnostic transactions.

---

### B. Supporting Role Views (Lightweight & Pre-Seeded for Jury Walkthrough)

1. **Clinic Management & Analytics (Doctor & Receptionist Views):**
   * **Doctor Staff Control:** Add, edit, or delete other doctors and receptionists under the clinic.
   * **Receptionist Appointment Desk:** View bookings with clickable phone numbers to call and confirm/remind patients.
   * **Google Calendar Sync:** View future bookings in a clean calendar schedule view.
   * **Clinic Metrics & AI Growth Suggestions:** Cards for Daily/Weekly/Monthly *Booked*, *Checked-In*, *No-Shows*, *Total Prescriptions*, *Total Revenue*, *Revenue per Customer (highlighting recurring patients)*, *Area-wise Patient Heatmap/Breakdown*, and a **Gemini-powered "AI Growth Suggestions"** panel analyzing these clinic metrics.
2. **Company / Founder Admin Dashboard:**
   * Single-screen executive overview displaying: Total Clinics (*Active / Inactive*), Total Patients (*Active / Inactive*), Total Bookings, Total Check-ins, Total Prescriptions Generated, Doctors Booked, AI Health Reports Generated, Active Paid Subscriptions, and Diagnostic Centers (*Active / Inactive*).
3. **Diagnostics & Pharmacy Partner Portal:**
   * Simple lookup bar: Enter Patient **Phone Number** or **Unique Health ID** $\rightarrow$ triggers patient In-App Approve/Deny $\rightarrow$ displays prescribed scans, bloodwork, and medicines to fulfill.

---

## 5. Pre-Seeded Demo Data Requirements
Pre-populate Firestore on initial setup so every screen looks rich and immediately testable during the pitch:
* **3 Clinics** within 5 km (e.g., Indiranagar, Koramangala, HSR Layout) with **5 Doctors** across specializations (General Physician, Cardiologist, Pediatrician, Dermatologist, Orthopedic).
* **1 Primary Patient** (`Rahul Sharma`) with **2 Family Members** (e.g., Elderly Father `Suresh Sharma` with hypertension/diabetes history, and Mother `Meena Sharma`) pre-loaded with 6 months of sample prescriptions, bloodwork reports, and government health IDs (CGHS/Ayushman/ABHA/Aadhaar).
* **2 Diagnostic/Scan Centers & 2 Pharmacies** (Active/Inactive statuses for Admin view and Patient Preferences).
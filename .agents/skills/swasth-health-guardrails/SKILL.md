---
name: swasth-health-guardrails
description: Apply SwasthAI healthcare data, privacy, consent gates, and AI safety guardrails when developing or modifying the SwasthAI application.
---

# SwasthAI Healthcare & AI Safety Guardrails

This skill outlines mandatory security, privacy, and clinical safety standards for developing and operating **SwasthAI** (Google DeepMind & Google Cloud Startup Buildathon India 2026).

## 1. Data Privacy & Synthetic Patient Data
- **Synthetic Records Only:** Use strictly fictional patient profiles (e.g., `Rahul Sharma`, `Suresh Sharma`, `Meena Sharma`) with realistic yet synthetic medical histories. Never use real personal health information (PHI) or real government identifiers.
- **Masked Government IDs:** Always mask national health and identity numbers in UI and logs (e.g., Aadhaar `XXXX-XXXX-4819`, PAN `ABCDE****F`, ABHA ID `91-****-****-3210`, CGHS `CGHS-*****88`).
- **Zero API Key Leakage:** Never expose `GEMINI_API_KEY`, Firebase private keys, or service account secrets in client-side code, git history, or client bundles. All Gemini API calls and privileged database writes must route through backend API endpoints.

## 2. Strict Real-Time Consent Architecture
- **Zero Unauthorized Access:** No clinic, doctor, diagnostic lab, or pharmacy partner may access past medical records or AI Health Reports without explicit, real-time patient consent.
- **Consent Gate Flow:**
  1. Practitioner or partner initiates access by creating a `consent_requests` record (`status: "PENDING"`).
  2. Patient app intercepts this via real-time listener (`onSnapshot` / WebSocket / reactive store) and displays an **In-App Approve / Deny** modal showing the requester's name, clinic, and requested scope.
  3. Only upon transition to `status === "APPROVED"` does the backend unlock and stream the patient vault or consolidated AI Health Report.
  4. If `DENIED`, access is blocked with a clear privacy notice.

## 3. Clinical AI Safety & Human-in-the-Loop
- **Supportive Intelligence Only:** Gemini AI outputs are diagnostic assistance tools, structured synthesizers, and operational summaries. The system must **never** make autonomous medical diagnoses or unreviewed treatment decisions.
- **Mandatory Doctor Review:** In doctor voice prescriptions, Gemini extracts symptoms, diagnoses, medications, and tests into a structured draft. The doctor **must** review, edit if necessary, and explicitly click **Verify & Send** before any prescription is committed to records or delivered to a patient.
- **Clear AI Attribution:** Every AI-generated report, summary, test extraction, and clinic growth recommendation must carry an explicit UI badge: `AI-Generated Summary • For Clinical Review Only`.

## 4. Operational Fallback Transparency
- **Explicit Demo Badging:** When running in an environment without an active `GEMINI_API_KEY` or during offline jury presentations, fallback simulation outputs must clearly display a badge: `Sample / Demo Data (Offline Mode)`. Never disguise fallback data as a live API response.
- **Strict JSON Schemas:** All Gemini calls must enforce structured JSON schemas to prevent hallucinated data shapes, broken UI state, or clinical inaccuracies.
- **Input Validation:** Enforce strict file size (max 10MB) and type limits (`application/pdf`, `image/png`, `image/jpeg`) on all uploaded documents before dispatching to backend processing.

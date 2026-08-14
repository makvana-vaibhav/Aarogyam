// Ported from the original frontend/doctor/app.js (DoctorAPI + DoctorSession).
import { apiRequest, qs } from "./apiCore.js";
import { getToken, getUser, clearSession } from "./session.js";

function request(path, options) {
  return apiRequest(path, {
    ...options,
    getToken,
    onUnauthorized: () => {
      clearSession();
      window.location.href = "/login?expired=1";
    }
  });
}

export const DoctorAPI = {
  profile: () => request("/doctor/profile"),
  updateProfile: (payload) => request("/doctor/profile", { method: "PUT", body: payload }),
  changePassword: (payload) => request("/doctor/change-password", { method: "PUT", body: payload }),
  dashboard: () => request("/doctor/dashboard"),
  myPatients: (search) => request("/doctor/patients" + qs({ search })),
  searchPatients: (aarogyamId, searchName) => request("/doctor/patients/search" + qs({ aarogyamId, searchName })),
  getPatient: (id) => request("/doctor/patients/" + id),
  getPatientVisits: (id) => request("/doctor/patients/" + id + "/visits"),
  getPatientDiagnoses: (id, diagnosisTypeId) => request("/doctor/patients/" + id + "/diagnoses" + qs({ diagnosisTypeId })),
  getPatientReports: (id) => request("/doctor/patients/" + id + "/reports"),
  getPatientPrescriptions: (id) => request("/doctor/patients/" + id + "/prescriptions"),
  getPrescriptionDetails: (id) => request("/doctor/prescriptions/" + id),
  downloadPrescription: (id) => request("/doctor/prescriptions/" + id + "/download", { responseType: "blob" }),
  createVisit: (payload) => request("/doctor/visits", { method: "POST", body: payload }),
  createDiagnosis: (payload) => request("/doctor/diagnoses", { method: "POST", body: payload }),
  createPrescription: (payload) => request("/doctor/prescriptions", { method: "POST", body: payload }),
  uploadReport: (formData) => request("/doctor/reports", { method: "POST", body: formData }),
  downloadReport: (id) => request("/doctor/reports/" + id + "/download", { responseType: "blob" }),
  notifications: (unreadOnly) => request("/doctor/notifications" + qs({ unreadOnly })),
  markNotificationRead: (id) => request("/doctor/notifications/" + id + "/read", { method: "PUT" }),
  diagnosisTypes: () => request("/lookup/diagnosis-types"),
  countries: () => request("/lookup/countries"),
  states: (countryId) => request("/lookup/states" + qs({ countryId })),
  cities: (stateId) => request("/lookup/cities" + qs({ stateId })),
  hospitals: () => request("/lookup/hospitals"),
  specializations: (degreeId) => request("/lookup/specializations" + qs({ degreeId }))
};

export function requireDoctorAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = "/login?returnUrl=" + encodeURIComponent(currentPath);
    return null;
  }
  if (String(user.roleName || "").toLowerCase() !== "doctor") {
    window.location.href = "/dashboard";
    return null;
  }
  return user;
}

export function performDoctorLogout() {
  clearSession();
  window.location.href = "/login";
}

export const doctorLogout = performDoctorLogout;

export function extractAarogyamId(raw) {
  if (!raw) return "";
  const value = String(raw).trim();

  // 1. Match canonical Aarogyam ID pattern anywhere in string or URL (e.g. ARG-2026-000010, AAR-2026-8849, ARG-2026-1)
  const canonicalMatch = value.match(/(?:ARG|AAR|AAROGYAM)-\d{4}-\d+/i);
  if (canonicalMatch) {
    return canonicalMatch[0].toUpperCase();
  }

  // 2. Query param style: aarogyamId=..., id=..., patientId=..., or patientAarogyamId=...
  const queryMatch = value.match(/[?&](?:aarogyamId|id|patientId|patientAarogyamId)=([^&#]+)/i);
  if (queryMatch && queryMatch[1]) {
    let decoded = queryMatch[1];
    try {
      decoded = decodeURIComponent(decoded).trim();
    } catch (e) {
      decoded = decoded.trim();
    }
    const inner = decoded.match(/(?:ARG|AAR|AAROGYAM)-\d{4}-\d+/i);
    return inner ? inner[0].toUpperCase() : decoded.toUpperCase();
  }

  // 3. Pipe-separated format (e.g. AAROGYAM|ARG-2026-000010)
  if (value.includes("|")) {
    const parts = value.split("|");
    for (const part of parts) {
      const inner = part.trim().match(/(?:ARG|AAR|AAROGYAM)-\d{4}-\d+/i);
      if (inner) return inner[0].toUpperCase();
    }
  }

  // 4. JSON payload
  try {
    const parsed = JSON.parse(value);
    const candidate = parsed.aarogyamId || parsed.AarogyamId || parsed.id || parsed.patientId;
    if (candidate) {
      const inner = String(candidate).match(/(?:ARG|AAR|AAROGYAM)-\d{4}-\d+/i);
      return inner ? inner[0].toUpperCase() : String(candidate).trim().toUpperCase();
    }
  } catch (e) {}

  // 5. Clean up any trailing query or hash chars
  const fallback = value.split(/[?#&]/)[0].trim().toUpperCase();
  return fallback;
}

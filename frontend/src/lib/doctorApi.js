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
  specializations: () => request("/lookup/specializations")
};

export function requireDoctorAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = "/login";
    return null;
  }
  if (String(user.roleName || "").toLowerCase() !== "doctor") {
    window.location.href = "/dashboard";
    return null;
  }
  return user;
}

export function doctorLogout() {
  if (!window.confirm("Log out of Aarogyam?")) return;
  clearSession();
  window.location.href = "/login";
}

export function extractAarogyamId(raw) {
  if (!raw) return "";
  const value = String(raw).trim();
  if (value.indexOf("aarogyamId=") !== -1) {
    const match = value.match(/aarogyamId=([^&]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  if (value.indexOf("AAROGYAM|") === 0) {
    const parts = value.split("|");
    if (parts.length >= 2) return parts[1];
  }
  return value;
}

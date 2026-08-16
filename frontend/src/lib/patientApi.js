// Ported from the original frontend/patient/app.js (PatientAPI + PatientSession).
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

export const PatientAPI = {
  dashboard: () => request("/patient/dashboard"),
  profile: () => request("/patient/profile"),
  updateProfile: (payload) => request("/patient/profile", { method: "PUT", body: payload }),
  downloadProfilePdf: () => request("/patient/profile/pdf", { responseType: "blob" }),
  profilePicture: () => request("/patient/profile/picture", { responseType: "blob" }),
  updateProfilePicture: (formData) => request("/patient/profile/picture", { method: "PATCH", body: formData }),
  changePassword: (payload) => request("/patient/change-password", { method: "PUT", body: payload }),
  countries: () => request("/lookup/countries"),
  states: (countryId) => request("/lookup/states" + qs({ countryId })),
  cities: (stateId) => request("/lookup/cities" + qs({ stateId })),
  diagnosisTypes: () => request("/lookup/diagnosis-types"),
  visits: () => request("/patient/visits"),
  diagnoses: (diagnosisTypeId) => request("/patient/diagnoses" + qs({ diagnosisTypeId })),
  reports: () => request("/patient/reports"),
  uploadReport: (formData) => request("/patient/reports", { method: "POST", body: formData }),
  deleteReport: (id) => request("/patient/reports/" + id, { method: "DELETE" }),
  downloadReport: (id) => request("/patient/reports/" + id + "/download", { responseType: "blob" }),
  prescriptions: () => request("/patient/prescriptions"),
  prescriptionDetails: (id) => request("/patient/prescriptions/" + id),
  downloadPrescription: (id) => request("/patient/prescriptions/" + id + "/download", { responseType: "blob" }),
  notifications: (unreadOnly) => request("/patient/notifications" + qs({ unreadOnly })),
  markNotificationRead: (id) => request("/patient/notifications/" + id + "/read", { method: "PUT" }),
  healthCardQr: () => request("/patient/health-card/qr", { responseType: "blob" })
};

export function requirePatientAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = "/login";
    return null;
  }
  if (String(user.roleName || "").toLowerCase() !== "patient") {
    window.location.href = "/dashboard";
    return null;
  }
  return user;
}

export function performPatientLogout() {
  clearSession();
  window.location.href = "/login";
}

export const patientLogout = performPatientLogout;

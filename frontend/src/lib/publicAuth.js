// Ported from the original frontend/auth.js (AarogyamAuth).
import { apiRequest, qs } from "./apiCore.js";
import { getToken, clearSession, getUser, getDashboardHref } from "./session.js";

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

export const AarogyamAuth = {
  registerPatient: (payload) => request("/auth/register/patient", { method: "POST", body: payload }),
  registerDoctor: (payload) => request("/auth/register/doctor", { method: "POST", body: payload }),
  uploadDocument: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("/auth/upload-document", { method: "POST", body: fd });
  },
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  verifyOtp: (payload) => request("/auth/verify-otp", { method: "POST", body: payload }),
  resendOtp: (payload) => request("/auth/resend-otp", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  verifyForgotOtp: (payload) => request("/auth/verify-forgot-otp", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
  countries: () => request("/lookup/countries"),
  states: (countryId) => request("/lookup/states" + qs({ countryId })),
  cities: (stateId) => request("/lookup/cities" + qs({ stateId })),
  hospitals: () => request("/lookup/hospitals"),
  degrees: () => request("/lookup/degrees"),
  specializations: (degreeId) => request("/lookup/specializations" + qs({ degreeId }))
};

export { getDashboardHref, getUser, getToken };

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  clearSession();
  window.location.href = "/login";
}

export function requireAuth() {
  if (!getToken()) {
    window.location.href = "/login";
    return null;
  }
  return getUser();
}

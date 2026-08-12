// Shared session storage for the public site + patient portal + doctor portal.
// Ported from the original auth.js / patient/app.js / doctor/app.js (same localStorage keys,
// so patients/doctors have a single sign-on across the public site and their portal).

const TOKEN_KEY = "aarogyam_token";
const USER_KEY = "aarogyam_user";

export function saveSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {}
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function getDashboardHref(user) {
  const currentUser = user || getUser() || {};
  const role = String(currentUser.roleName || "").toLowerCase();
  if (role === "patient") return "/patient/overview";
  if (role === "doctor") return "/doctor/overview";
  return "/dashboard";
}

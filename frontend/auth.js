// Aarogyam auth — API client + session storage, shared by login/register/verify-otp/dashboard.

(function (global) {
  "use strict";

  var isLocalDev = window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // In production the frontend's own nginx container proxies /api/* to the API
  // container, so requests stay same-origin. In local dev (no nginx in front),
  // the API is reached directly on its dotnet-run port.
  var API_BASE_URL = isLocalDev ? "http://localhost:5027/api" : window.location.origin + "/api";

  var TOKEN_KEY = "aarogyam_token";
  var USER_KEY = "aarogyam_user";

  function saveSession(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  async function apiRequest(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    var response;
    try {
      response = await fetch(API_BASE_URL + path, {
        method: options.method || "GET",
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
    } catch (networkErr) {
      throw new Error("Could not reach the Aarogyam API at " + API_BASE_URL + ". Is the backend running?");
    }

    var data = null;
    try {
      data = await response.json();
    } catch (e) {
      // empty or non-JSON body — leave data as null
    }

    if (!response.ok) {
      var message = (data && data.message) ? data.message : "Request failed (" + response.status + ")";
      var err = new Error(message);
      err.data = data;
      err.status = response.status;
      throw err;
    }

    return data;
  }

  var AarogyamAuth = {
    registerPatient: function (payload) {
      return apiRequest("/auth/register/patient", { method: "POST", body: payload });
    },
    registerDoctor: function (payload) {
      return apiRequest("/auth/register/doctor", { method: "POST", body: payload });
    },
    login: function (payload) {
      return apiRequest("/auth/login", { method: "POST", body: payload });
    },
    verifyOtp: function (payload) {
      return apiRequest("/auth/verify-otp", { method: "POST", body: payload });
    },
    resendOtp: function (payload) {
      return apiRequest("/auth/resend-otp", { method: "POST", body: payload });
    },
    saveSession: saveSession,
    clearSession: clearSession,
    getToken: getToken,
    getUser: getUser,
    isLoggedIn: function () {
      return !!getToken();
    },
    logout: function () {
      clearSession();
      window.location.href = "login.html";
    },
    requireAuth: function () {
      if (!getToken()) {
        window.location.href = "login.html";
        return null;
      }
      return getUser();
    }
  };

  global.AarogyamAuth = AarogyamAuth;

  // Reflect logged-in state in the shared header nav: Login/Register -> Dashboard/Log out.
  document.addEventListener("DOMContentLoaded", function () {
    var actions = document.querySelector(".header-actions");
    if (!actions) return;

    var user = getUser();
    if (!user) return;

    var loginBtn = actions.querySelector("a.btn-ghost");
    var registerBtn = actions.querySelector("a.btn-solid");

    if (loginBtn) {
      loginBtn.textContent = "Dashboard";
      loginBtn.href = "dashboard.html";
    }

    if (registerBtn) {
      registerBtn.textContent = "Log out";
      registerBtn.href = "#";
      registerBtn.addEventListener("click", function (e) {
        e.preventDefault();
        AarogyamAuth.logout();
      });
    }
  });
})(window);

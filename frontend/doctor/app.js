(function (global) {
  "use strict";

  var isLocalDev = window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  var API_BASE_URL = isLocalDev ? "http://localhost:5027/api" : window.location.origin + "/api";
  var TOKEN_KEY = "aarogyam_token";
  var USER_KEY = "aarogyam_user";

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  async function apiRequest(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    var token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    var response;
    try {
      response = await fetch(API_BASE_URL + path, {
        method: options.method || "GET",
        headers: headers,
        body: options.body instanceof FormData
          ? options.body
          : options.body !== undefined && options.body !== null
            ? JSON.stringify(options.body)
            : undefined
      });
    } catch (networkErr) {
      throw new Error("Could not reach the Aarogyam API at " + API_BASE_URL + ". Is the backend running?");
    }

    if (response.status === 401) {
      clearSession();
      window.location.href = "../login.html?expired=1";
      throw new Error("Session expired. Please log in again.");
    }

    if (options.responseType === "blob") {
      if (!response.ok) {
        var blobErrData = null;
        try { blobErrData = await response.json(); } catch (e) {}
        var blobErr = new Error(extractErrorMessage(blobErrData, response.status));
        blobErr.status = response.status;
        blobErr.data = blobErrData;
        throw blobErr;
      }
      return {
        blob: await response.blob(),
        fileName: getFileName(response.headers.get("Content-Disposition"))
      };
    }

    var data = null;
    try { data = await response.json(); } catch (e) {}

    if (!response.ok) {
      var err = new Error(extractErrorMessage(data, response.status));
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // ASP.NET Core's automatic [Required]/[MaxLength] validation returns
  // { title, errors: { Field: ["..."] } } instead of our own { success, message }
  // shape - without this, every validation failure showed a bare "Request failed (400)".
  function extractErrorMessage(data, status) {
    if (data) {
      if (data.message) return data.message;
      if (data.Message) return data.Message;
      if (data.errors) {
        var fieldNames = Object.keys(data.errors);
        if (fieldNames.length) {
          var firstMessages = data.errors[fieldNames[0]];
          if (firstMessages && firstMessages.length) return firstMessages[0];
        }
      }
      if (data.title) return data.title;
    }
    return "Request failed (" + status + ")";
  }

  function getFileName(contentDisposition) {
    if (!contentDisposition) return null;
    var utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch && utfMatch[1]) return decodeURIComponent(utfMatch[1]);
    var plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return plainMatch && plainMatch[1] ? plainMatch[1] : null;
  }

  function qs(params) {
    if (!params) return "";
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === undefined || value === null || value === "") return;
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }

  var DoctorAPI = {
    profile: function () { return apiRequest("/doctor/profile"); },
    dashboard: function () { return apiRequest("/doctor/dashboard"); },
    myPatients: function (search) { return apiRequest("/doctor/patients" + qs({ search: search })); },
    searchPatients: function (aarogyamId, searchName) { return apiRequest("/doctor/patients/search" + qs({ aarogyamId: aarogyamId, searchName: searchName })); },
    getPatient: function (id) { return apiRequest("/doctor/patients/" + id); },
    getPatientVisits: function (id) { return apiRequest("/doctor/patients/" + id + "/visits"); },
    getPatientDiagnoses: function (id, diagnosisTypeId) { return apiRequest("/doctor/patients/" + id + "/diagnoses" + qs({ diagnosisTypeId: diagnosisTypeId })); },
    getPatientReports: function (id) { return apiRequest("/doctor/patients/" + id + "/reports"); },
    getPatientPrescriptions: function (id) { return apiRequest("/doctor/patients/" + id + "/prescriptions"); },
    createVisit: function (payload) { return apiRequest("/doctor/visits", { method: "POST", body: payload }); },
    createDiagnosis: function (payload) { return apiRequest("/doctor/diagnoses", { method: "POST", body: payload }); },
    createPrescription: function (payload) { return apiRequest("/doctor/prescriptions", { method: "POST", body: payload }); },
    uploadReport: function (formData) { return apiRequest("/doctor/reports", { method: "POST", body: formData }); },
    downloadReport: function (id) { return apiRequest("/doctor/reports/" + id + "/download", { responseType: "blob" }); },
    notifications: function (unreadOnly) { return apiRequest("/doctor/notifications" + qs({ unreadOnly: unreadOnly })); },
    markNotificationRead: function (id) { return apiRequest("/doctor/notifications/" + id + "/read", { method: "PUT" }); },
    diagnosisTypes: function () { return apiRequest("/lookup/diagnosis-types"); }
  };

  function requireDoctorAuth() {
    var token = getToken();
    var user = getUser();
    if (!token || !user) {
      window.location.href = "../login.html";
      return null;
    }
    if (String(user.roleName || "").toLowerCase() !== "doctor") {
      window.location.href = "../dashboard.html";
      return null;
    }
    return user;
  }

  function logout() {
    clearSession();
    window.location.href = "../login.html";
  }

  function initShell(user) {
    var emailEl = document.getElementById("doctorEmail");
    if (emailEl) emailEl.textContent = user.email || "Doctor";

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    var sidebarToggle = document.getElementById("sidebarToggle");
    var scrim = document.getElementById("sidebarScrim");
    function closeSidebar() { document.body.classList.remove("sidebar-open"); }
    if (sidebarToggle) sidebarToggle.addEventListener("click", function () { document.body.classList.toggle("sidebar-open"); });
    if (scrim) scrim.addEventListener("click", closeSidebar);
    document.querySelectorAll(".admin-sidebar a").forEach(function (link) {
      link.addEventListener("click", closeSidebar);
    });

    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("aarogyam-theme", next); } catch (e) {}
      });
    }

    var currentPage = window.location.pathname.split("/").pop() || "overview.html";
    document.querySelectorAll(".admin-nav a").forEach(function (link) {
      if ((link.getAttribute("href") || "").split("?")[0] === currentPage) {
        link.classList.add("active");
      }
    });
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function formatDateTime(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function formatRelativeTime(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    var diffMs = date.getTime() - Date.now();
    var hours = Math.round(diffMs / 3600000);
    var rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
    return rtf.format(Math.round(hours / 24), "day");
  }

  function initials(firstName, lastName) {
    return ((firstName || "").charAt(0) + (lastName || "").charAt(0)).toUpperCase() || "D";
  }

  function downloadBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  global.DoctorAPI = DoctorAPI;
  global.DoctorSession = {
    requireDoctorAuth: requireDoctorAuth,
    logout: logout,
    getUser: getUser
  };
  global.DoctorShell = { init: initShell };
  global.DoctorUtil = {
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatRelativeTime: formatRelativeTime,
    initials: initials,
    downloadBlob: downloadBlob
  };
})(window);

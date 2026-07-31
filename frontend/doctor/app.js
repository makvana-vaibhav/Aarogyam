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
    updateProfile: function (payload) { return apiRequest("/doctor/profile", { method: "PUT", body: payload }); },
    changePassword: function (payload) { return apiRequest("/doctor/change-password", { method: "PUT", body: payload }); },
    dashboard: function () { return apiRequest("/doctor/dashboard"); },
    myPatients: function (search) { return apiRequest("/doctor/patients" + qs({ search: search })); },
    searchPatients: function (aarogyamId, searchName) { return apiRequest("/doctor/patients/search" + qs({ aarogyamId: aarogyamId, searchName: searchName })); },
    getPatient: function (id) { return apiRequest("/doctor/patients/" + id); },
    getPatientVisits: function (id) { return apiRequest("/doctor/patients/" + id + "/visits"); },
    getPatientDiagnoses: function (id, diagnosisTypeId) { return apiRequest("/doctor/patients/" + id + "/diagnoses" + qs({ diagnosisTypeId: diagnosisTypeId })); },
    getPatientReports: function (id) { return apiRequest("/doctor/patients/" + id + "/reports"); },
    getPatientPrescriptions: function (id) { return apiRequest("/doctor/patients/" + id + "/prescriptions"); },
    getPrescriptionDetails: function (id) { return apiRequest("/doctor/prescriptions/" + id); },
    downloadPrescription: function (id) { return apiRequest("/doctor/prescriptions/" + id + "/download", { responseType: "blob" }); },
    createVisit: function (payload) { return apiRequest("/doctor/visits", { method: "POST", body: payload }); },
    createDiagnosis: function (payload) { return apiRequest("/doctor/diagnoses", { method: "POST", body: payload }); },
    createPrescription: function (payload) { return apiRequest("/doctor/prescriptions", { method: "POST", body: payload }); },
    uploadReport: function (formData) { return apiRequest("/doctor/reports", { method: "POST", body: formData }); },
    downloadReport: function (id) { return apiRequest("/doctor/reports/" + id + "/download", { responseType: "blob" }); },
    notifications: function (unreadOnly) { return apiRequest("/doctor/notifications" + qs({ unreadOnly: unreadOnly })); },
    markNotificationRead: function (id) { return apiRequest("/doctor/notifications/" + id + "/read", { method: "PUT" }); },
    diagnosisTypes: function () { return apiRequest("/lookup/diagnosis-types"); },
    countries: function () { return apiRequest("/lookup/countries"); },
    states: function (countryId) { return apiRequest("/lookup/states" + qs({ countryId: countryId })); },
    cities: function (stateId) { return apiRequest("/lookup/cities" + qs({ stateId: stateId })); },
    hospitals: function () { return apiRequest("/lookup/hospitals"); },
    specializations: function () { return apiRequest("/lookup/specializations"); }
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
    if (!window.confirm("Log out of Aarogyam?")) return;
    clearSession();
    window.location.href = "../login.html";
  }

  function renderNotifPopoverList(rows) {
    var mount = document.getElementById("notifPopoverList");
    if (!mount) return;
    var list = rows.slice(0, 6);
    if (!list.length) {
      mount.innerHTML = '<div class="empty-state">You are all caught up.</div>';
      return;
    }
    mount.innerHTML = list.map(function (item) {
      return '<article class="list-item unread">' +
        '<div class="list-item-main">' +
          '<div class="row-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="row-sub pre-wrap">' + escapeHtml(item.message) + '</div>' +
          '<div class="list-meta">' + escapeHtml(formatRelativeTime(item.createdAt)) + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-read-notification="' + item.notificationId + '">Mark read</button>' +
      '</article>';
    }).join("");
  }

  async function refreshNotifDot() {
    var dot = document.getElementById("notifDot");
    if (!dot) return;
    try {
      var unread = await DoctorAPI.notifications(true);
      dot.hidden = !unread.length;
    } catch (e) {
      dot.hidden = true;
    }
  }

  async function loadNotifPopover() {
    var mount = document.getElementById("notifPopoverList");
    if (!mount) return;
    mount.innerHTML = '<div class="table-loading">Loading…</div>';
    try {
      var rows = await DoctorAPI.notifications(true);
      renderNotifPopoverList(rows);
    } catch (err) {
      mount.innerHTML = '<div class="form-alert error">' + escapeHtml(err.message) + '</div>';
    }
  }

  function initShell(user) {
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    var mobileToggle = document.getElementById("mobileNavToggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        document.body.classList.toggle("pt-nav-open");
      });
    }

    function closeAllPopovers() {
      document.querySelectorAll(".pt-popover").forEach(function (p) { p.hidden = true; });
    }
    function setupPopover(btnId, popoverId, onOpen) {
      var btn = document.getElementById(btnId);
      var pop = document.getElementById(popoverId);
      if (!btn || !pop) return;
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        var willOpen = pop.hidden;
        closeAllPopovers();
        if (willOpen) {
          pop.hidden = false;
          if (onOpen) onOpen();
        }
      });
      pop.addEventListener("click", function (event) { event.stopPropagation(); });
    }
    document.addEventListener("click", closeAllPopovers);

    setupPopover("avatarBtn", "avatarPopover");
    setupPopover("notifBellBtn", "notifPopover", loadNotifPopover);

    var notifPopoverList = document.getElementById("notifPopoverList");
    if (notifPopoverList) {
      notifPopoverList.addEventListener("click", async function (event) {
        var id = event.target.getAttribute("data-read-notification");
        if (!id) return;
        try {
          await DoctorAPI.markNotificationRead(id);
          await loadNotifPopover();
          refreshNotifDot();
        } catch (e) {}
      });
    }

    refreshNotifDot();

    var currentPage = window.location.pathname.split("/").pop() || "overview.html";
    document.querySelectorAll(".pt-links a, .pt-mobile-links a").forEach(function (link) {
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

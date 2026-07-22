// Aarogyam Admin — API client, session storage, auth guard, shared shell wiring.
// Loaded on every admin page before the page's own inline script.

(function (global) {
  "use strict";

  var isLocalDev = window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Same pattern as the patient/doctor frontend: same-origin via nginx proxy in
  // production, direct to the dotnet-run port in local dev.
  var API_BASE_URL = isLocalDev ? "http://localhost:5027/api" : window.location.origin + "/api";

  var TOKEN_KEY = "aarogyam_admin_token";
  var USER_KEY = "aarogyam_admin_user";

  // ---------------------------------------------------------------- session

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
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ------------------------------------------------------------- API client

  async function apiRequest(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    var url = API_BASE_URL + path;
    var response;
    try {
      response = await fetch(url, {
        method: options.method || "GET",
        headers: headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
      });
    } catch (networkErr) {
      throw new Error("Could not reach the Aarogyam API at " + API_BASE_URL + ". Is the backend running?");
    }

    if (response.status === 401) {
      clearSession();
      if (!/login\.html$/.test(window.location.pathname)) {
        window.location.href = "login.html?expired=1";
      }
      throw new Error("Session expired. Please log in again.");
    }

    var data = null;
    try { data = await response.json(); } catch (e) { /* empty/non-JSON body */ }

    if (response.status === 403) {
      var err403 = new Error("You don't have permission to do that.");
      err403.status = 403;
      err403.data = data;
      throw err403;
    }

    if (!response.ok) {
      var message = (data && (data.message || data.Message)) || "Request failed (" + response.status + ")";
      var err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  function qs(params) {
    if (!params) return "";
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var val = params[key];
      if (val === undefined || val === null || val === "") return;
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }

  // Config shared with master-data.html — one entry per master entity.
  var MASTER_ENTITIES = [
    {
      key: "roles", route: "master/roles", label: "Roles", idField: "roleId",
      fields: [
        { name: "roleName", label: "Role name", type: "text", required: true, maxLength: 20 }
      ],
      columns: [
        { field: "roleId", label: "ID" },
        { field: "roleName", label: "Role name" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "countries", route: "master/countries", label: "Countries", idField: "countryId",
      fields: [
        { name: "countryName", label: "Country name", type: "text", required: true, maxLength: 100 },
        { name: "countryCode", label: "Country code", type: "text", required: true, maxLength: 10 },
        { name: "isActive", label: "Active", type: "checkbox" }
      ],
      columns: [
        { field: "countryId", label: "ID" },
        { field: "countryName", label: "Name" },
        { field: "countryCode", label: "Code" },
        { field: "isActive", label: "Active", type: "bool" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "states", route: "master/states", label: "States", idField: "stateId",
      filterBy: { param: "countryId", label: "Country", entity: "countries", idField: "countryId", nameField: "countryName" },
      fields: [
        { name: "countryId", label: "Country", type: "select", entity: "countries", idField: "countryId", nameField: "countryName", required: true },
        { name: "stateName", label: "State name", type: "text", required: true, maxLength: 100 }
      ],
      columns: [
        { field: "stateId", label: "ID" },
        { field: "stateName", label: "Name" },
        { field: "countryId", label: "Country", type: "lookup", lookup: "countries", lookupId: "countryId", lookupName: "countryName" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "cities", route: "master/cities", label: "Cities", idField: "cityId",
      filterBy: { param: "stateId", label: "State", entity: "states", idField: "stateId", nameField: "stateName" },
      fields: [
        { name: "stateId", label: "State", type: "select", entity: "states", idField: "stateId", nameField: "stateName", required: true },
        { name: "cityName", label: "City name", type: "text", required: true, maxLength: 100 }
      ],
      columns: [
        { field: "cityId", label: "ID" },
        { field: "cityName", label: "Name" },
        { field: "stateId", label: "State", type: "lookup", lookup: "states", lookupId: "stateId", lookupName: "stateName" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "hospitals", route: "master/hospitals", label: "Hospitals", idField: "hospitalId",
      fields: [
        { name: "hospitalName", label: "Hospital name", type: "text", required: true, maxLength: 150 },
        { name: "address", label: "Address", type: "text", required: true, maxLength: 200 },
        { name: "cityId", label: "City", type: "select", entity: "cities", idField: "cityId", nameField: "cityName", required: true },
        { name: "phoneNumber", label: "Phone number", type: "text", maxLength: 20 },
        { name: "email", label: "Email", type: "text", maxLength: 100 },
        { name: "isActive", label: "Active", type: "checkbox" }
      ],
      columns: [
        { field: "hospitalId", label: "ID" },
        { field: "hospitalName", label: "Name" },
        { field: "cityId", label: "City", type: "lookup", lookup: "cities", lookupId: "cityId", lookupName: "cityName" },
        { field: "isActive", label: "Active", type: "bool" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "degrees", route: "master/degrees", label: "Degrees", idField: "degreeId",
      fields: [
        { name: "degreeName", label: "Degree name", type: "text", required: true, maxLength: 100 },
        { name: "shortName", label: "Short name", type: "text", required: true, maxLength: 20 },
        { name: "description", label: "Description", type: "text", maxLength: 200 }
      ],
      columns: [
        { field: "degreeId", label: "ID" },
        { field: "degreeName", label: "Name" },
        { field: "shortName", label: "Short name" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "specializations", route: "master/specializations", label: "Specializations", idField: "specializationId",
      fields: [
        { name: "specializationName", label: "Specialization name", type: "text", required: true, maxLength: 100 },
        { name: "description", label: "Description", type: "text", maxLength: 200 }
      ],
      columns: [
        { field: "specializationId", label: "ID" },
        { field: "specializationName", label: "Name" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    },
    {
      key: "diagnosisTypes", route: "master/diagnosis-types", label: "Diagnosis types", idField: "diagnosisTypeId",
      fields: [
        { name: "diagnosisTypeName", label: "Diagnosis type name", type: "text", required: true, maxLength: 100 },
        { name: "description", label: "Description", type: "text", maxLength: 200 },
        { name: "isActive", label: "Active", type: "checkbox" }
      ],
      columns: [
        { field: "diagnosisTypeId", label: "ID" },
        { field: "diagnosisTypeName", label: "Name" },
        { field: "isActive", label: "Active", type: "bool" },
        { field: "createdAt", label: "Created", type: "date" }
      ]
    }
  ];

  function masterClient(entity) {
    return {
      list: function (query) { return apiRequest("/admin/" + entity.route + qs(query)); },
      get: function (id) { return apiRequest("/admin/" + entity.route + "/" + id); },
      create: function (payload) { return apiRequest("/admin/" + entity.route, { method: "POST", body: payload }); },
      update: function (id, payload) { return apiRequest("/admin/" + entity.route + "/" + id, { method: "PUT", body: payload }); },
      remove: function (id) { return apiRequest("/admin/" + entity.route + "/" + id, { method: "DELETE" }); }
    };
  }

  var AdminAPI = {
    // auth
    login: function (payload) { return apiRequest("/auth/login", { method: "POST", body: payload }); },

    // dashboard
    dashboardStats: function () { return apiRequest("/admin/dashboard/stats"); },

    // users
    listUsers: function () { return apiRequest("/admin/users"); },
    getUser: function (id) { return apiRequest("/admin/users/" + id); },
    activateUser: function (id) { return apiRequest("/admin/users/" + id + "/activate", { method: "PUT" }); },
    deactivateUser: function (id) { return apiRequest("/admin/users/" + id + "/deactivate", { method: "PUT" }); },

    // doctors
    listDoctors: function (approvalStatus) { return apiRequest("/admin/doctors" + qs({ approvalStatus: approvalStatus })); },
    getDoctor: function (id) { return apiRequest("/admin/doctors/" + id); },
    approveDoctor: function (id) { return apiRequest("/admin/doctors/" + id + "/approve", { method: "POST" }); },
    rejectDoctor: function (id, rejectionReason) {
      return apiRequest("/admin/doctors/" + id + "/reject", { method: "POST", body: { rejectionReason: rejectionReason } });
    },

    // patients
    listPatients: function (searchName) { return apiRequest("/admin/patients" + qs({ searchName: searchName })); },
    getPatient: function (id) { return apiRequest("/admin/patients/" + id); },

    // audit logs
    listAuditLogs: function (userId) { return apiRequest("/admin/audit-logs" + qs({ userId: userId })); },

    // master data
    masterEntities: MASTER_ENTITIES,
    master: function (key) {
      var entity = MASTER_ENTITIES.filter(function (e) { return e.key === key; })[0];
      if (!entity) throw new Error("Unknown master entity: " + key);
      return masterClient(entity);
    }
  };

  // --------------------------------------------------------------- auth guard

  function requireAdminAuth() {
    var token = getToken();
    var user = getUser();
    if (!token || !user || String(user.roleName).toLowerCase() !== "admin") {
      clearSession();
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  function logout() {
    clearSession();
    window.location.href = "login.html";
  }

  // --------------------------------------------------------------- shell UI

  function initShell(user) {
    var emailEl = document.getElementById("adminEmail");
    if (emailEl) emailEl.textContent = user.email || "Admin";

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    // sidebar (mobile) toggle
    var sidebarToggle = document.getElementById("sidebarToggle");
    var sidebar = document.querySelector(".admin-sidebar");
    var scrim = document.getElementById("sidebarScrim");
    function closeSidebar() {
      document.body.classList.remove("sidebar-open");
    }
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-open");
      });
    }
    if (scrim) scrim.addEventListener("click", closeSidebar);
    if (sidebar) {
      sidebar.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeSidebar); });
    }

    // theme toggle (shared token/pattern with the marketing + patient site)
    var THEME_KEY = "aarogyam-theme";
    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }

    // active nav link
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".admin-nav a").forEach(function (a) {
      var href = a.getAttribute("href").split("?")[0];
      if (href === current) a.classList.add("active");
    });

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  // -------------------------------------------------------------- utilities

  function formatDate(value) {
    if (!value) return "—";
    var d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function formatDateTime(value) {
    if (!value) return "—";
    var d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function statusBadgeClass(status) {
    var s = String(status || "").toLowerCase();
    if (s === "approved" || s === "active") return "ok";
    if (s === "pending") return "pending";
    if (s === "rejected" || s === "inactive") return "bad";
    return "pending";
  }

  global.AdminAPI = AdminAPI;
  global.AdminSession = {
    saveSession: saveSession,
    clearSession: clearSession,
    getToken: getToken,
    getUser: getUser,
    requireAdminAuth: requireAdminAuth,
    logout: logout
  };
  global.AdminShell = { init: initShell };
  global.AdminUtil = {
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    escapeHtml: escapeHtml,
    statusBadgeClass: statusBadgeClass
  };
})(window);

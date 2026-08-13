// Ported from the original frontend/admin/admin-core.js.
import { apiRequest, qs } from "./apiCore.js";

const TOKEN_KEY = "aarogyam_admin_token";
const USER_KEY = "aarogyam_admin_user";

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

function request(path, options) {
  return apiRequest(path, {
    ...options,
    getToken,
    onUnauthorized: () => {
      clearSession();
      if (!/\/admin\/login$/.test(window.location.pathname)) {
        window.location.href = "/admin/login?expired=1";
      }
    }
  });
}

// Config shared with the MasterData page — one entry per master entity.
export const MASTER_ENTITIES = [
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
    filterBy: { param: "degreeId", label: "Filter by Degree", entity: "degrees", idField: "degreeId", nameField: "shortName" },
    fields: [
      { name: "degreeId", label: "Degree", type: "select", entity: "degrees", idField: "degreeId", nameField: "shortName", required: true },
      { name: "specializationName", label: "Specialization name", type: "text", required: true, maxLength: 100 },
      { name: "description", label: "Description", type: "text", maxLength: 200 }
    ],
    columns: [
      { field: "specializationId", label: "ID" },
      { field: "degreeId", label: "Degree", type: "lookup", lookup: "degrees", lookupId: "degreeId", lookupName: "shortName" },
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
    list: (query) => request("/admin/" + entity.route + qs(query)),
    get: (id) => request("/admin/" + entity.route + "/" + id),
    create: (payload) => request("/admin/" + entity.route, { method: "POST", body: payload }),
    update: (id, payload) => request("/admin/" + entity.route + "/" + id, { method: "PUT", body: payload }),
    remove: (id) => request("/admin/" + entity.route + "/" + id, { method: "DELETE" })
  };
}

export const AdminAPI = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  dashboardStats: () => request("/admin/dashboard/stats"),
  listUsers: () => request("/admin/users"),
  getUser: (id) => request("/admin/users/" + id),
  activateUser: (id) => request("/admin/users/" + id + "/activate", { method: "PUT" }),
  deactivateUser: (id) => request("/admin/users/" + id + "/deactivate", { method: "PUT" }),
  deleteUser: (id) => request("/admin/users/" + id, { method: "DELETE" }),
  listDoctors: (approvalStatus) => request("/admin/doctors" + qs({ approvalStatus })),
  getDoctor: (id) => request("/admin/doctors/" + id),
  downloadLicenseDocument: (id) => request("/admin/doctors/" + id + "/documents/license", { responseType: "blob" }),
  downloadDegreeDocument: (id) => request("/admin/doctors/" + id + "/documents/degree", { responseType: "blob" }),
  approveDoctor: (id) => request("/admin/doctors/" + id + "/approve", { method: "POST" }),
  rejectDoctor: (id, rejectionReason) => request("/admin/doctors/" + id + "/reject", { method: "POST", body: { rejectionReason } }),
  listPatients: (searchName) => request("/admin/patients" + qs({ searchName })),
  getPatient: (id) => request("/admin/patients/" + id),
  listAuditLogs: (userId) => request("/admin/audit-logs" + qs({ userId })),
  masterEntities: MASTER_ENTITIES,
  master: (key) => {
    const entity = MASTER_ENTITIES.find((e) => e.key === key);
    if (!entity) throw new Error("Unknown master entity: " + key);
    return masterClient(entity);
  }
};

export function requireAdminAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user || String(user.roleName).toLowerCase() !== "admin") {
    clearSession();
    window.location.href = "/admin/login";
    return null;
  }
  return user;
}

export function adminLogout() {
  if (!window.confirm("Log out of Aarogyam Admin?")) return;
  clearSession();
  window.location.href = "/admin/login";
}

export function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "active") return "ok";
  if (s === "pending") return "pending";
  if (s === "rejected" || s === "inactive") return "bad";
  return "pending";
}

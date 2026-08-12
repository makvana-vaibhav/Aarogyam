// Shared fetch wrapper used by publicAuth.js / patientApi.js / doctorApi.js / adminApi.js.
// Ported from the frontend's original auth.js / patient/app.js / doctor/app.js apiRequest().

const isLocalDev =
  window.location.protocol === "file:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// In production nginx proxies /api/* to the API container, so requests stay same-origin.
// In local dev (no nginx in front) the API is reached directly on its dotnet-run port.
export const API_BASE_URL = isLocalDev ? "http://localhost:5027/api" : window.location.origin + "/api";

export function qs(params) {
  if (!params) return "";
  const parts = [];
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null || value === "") return;
    parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
  });
  return parts.length ? "?" + parts.join("&") : "";
}

function sanitizeDbError(raw) {
  if (!raw) return raw;
  const str = String(raw);

  if (/UNIQUE KEY constraint|duplicate key/i.test(str)) {
    if (/phone|phonenumber|UQ_.*phone/i.test(str)) {
      return "This mobile number is already registered. Please log in or use another number.";
    }
    if (/email|UQ_.*email/i.test(str)) {
      return "This email address is already registered. Please log in or use another email.";
    }
    if (/license|licensenumber/i.test(str)) {
      return "This medical license number is already registered in the system.";
    }
    if (/aarogyamid/i.test(str)) {
      return "An account with this Aarogyam ID already exists.";
    }
    return "An account with these details already exists. Please log in or verify your details.";
  }

  if (/FOREIGN KEY constraint/i.test(str)) {
    return "Invalid selection or referenced item no longer exists. Please refresh and try again.";
  }

  if (/SqlException|Timeout expired|A connection was successfully established/i.test(str)) {
    return "Database service temporarily unavailable. Please try again in a few moments.";
  }

  return raw;
}

// ASP.NET Core's automatic [Required]/[MaxLength] validation (via [ApiController]) returns
// { title, errors: { Field: ["..."] } } instead of our own { success, message } shape -
// without this, every validation failure would show a bare "Request failed (400)".
function extractErrorMessage(data, status) {
  let msg = "Request failed (" + status + ")";
  if (data) {
    if (data.message) msg = data.message;
    else if (data.Message) msg = data.Message;
    else if (data.errors) {
      const fieldNames = Object.keys(data.errors);
      if (fieldNames.length) {
        const firstMessages = data.errors[fieldNames[0]];
        if (firstMessages && firstMessages.length) msg = firstMessages[0];
      }
    } else if (data.title) msg = data.title;
  }
  return sanitizeDbError(msg);
}

function getFileName(contentDisposition) {
  if (!contentDisposition) return null;
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch && utfMatch[1]) return decodeURIComponent(utfMatch[1]);
  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch && plainMatch[1] ? plainMatch[1] : null;
}

// options: { method, headers, body, responseType: "blob", getToken, onUnauthorized }
export async function apiRequest(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = options.getToken ? options.getToken() : null;
  if (token) headers.Authorization = "Bearer " + token;
  if (!(options.body instanceof FormData) && !options.raw && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method: options.method || "GET",
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : options.body !== undefined && options.body !== null && !options.raw
          ? JSON.stringify(options.body)
          : options.body
    });
  } catch (networkErr) {
    throw new Error("Could not reach the Aarogyam API at " + API_BASE_URL + ". Is the backend running?");
  }

  if (response.status === 401) {
    if (options.onUnauthorized) options.onUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  if (options.responseType === "blob") {
    if (!response.ok) {
      let blobErrData = null;
      try {
        blobErrData = await response.json();
      } catch (e) {}
      const blobErr = new Error(extractErrorMessage(blobErrData, response.status));
      blobErr.status = response.status;
      blobErr.data = blobErrData;
      throw blobErr;
    }
    return {
      blob: await response.blob(),
      fileName: getFileName(response.headers.get("Content-Disposition"))
    };
  }

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // empty or non-JSON body — leave data as null
  }

  if (response.status === 403) {
    const err403 = new Error("You don't have permission to do that.");
    err403.status = 403;
    err403.data = data;
    throw err403;
  }

  if (!response.ok) {
    const err = new Error(extractErrorMessage(data, response.status));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

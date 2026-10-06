/**
 * Centralized API Client untuk Sistem Eksisting RS Edelweiss (Dev Flow).
 * Mendukung Basic Auth, query params, FormData, dan error handling terstandar.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev-flow.edelweiss.id';
const USERNAME = import.meta.env.VITE_API_USERNAME || 'menu-gizi';
const PASSWORD = import.meta.env.VITE_API_PASSWORD || 'KamiParaPejuang123!';

/**
 * Menghasilkan token header Basic Authentication.
 */
function getBasicAuthHeader() {
  const credentials = `${USERNAME}:${PASSWORD}`;
  // Menggunakan btoa untuk encoding base64 di browser
  const encoded = typeof btoa !== 'undefined'
    ? btoa(credentials)
    : Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Wrapper HTTP fetch umum untuk API Edelweiss.
 * 
 * @param {string} endpoint - Path endpoint (misal: '/webhook/get-patient')
 * @param {object} [options={}] - Opsi Fetch API
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Authorization')) {
    headers.set('Authorization', getBasicAuthHeader());
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let responseData;
  if (contentType.includes('application/json')) {
    responseData = await response.json().catch(() => null);
  } else {
    responseData = await response.text().catch(() => '');
  }

  if (!response.ok) {
    const errorMsg = (responseData && typeof responseData === 'object' && responseData.message)
      || (responseData && typeof responseData === 'object' && responseData.error)
      || `Request failed with status ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = responseData;
    throw err;
  }

  return responseData;
}

/**
 * Melakukan GET request ke API Edelweiss.
 * 
 * @param {string} endpoint 
 * @param {Record<string, string|number>} [params]
 */
export async function apiGet(endpoint, params = {}) {
  let queryString = '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.append(key, String(val));
    }
  });

  const paramStr = searchParams.toString();
  if (paramStr) {
    queryString = endpoint.includes('?') ? `&${paramStr}` : `?${paramStr}`;
  }

  return apiFetch(`${endpoint}${queryString}`, {
    method: 'GET',
  });
}

/**
 * Melakukan POST request dengan format Multipart/form-data.
 * Catatan: Fetch secara otomatis mengatur boundary untuk FormData jika header Content-Type TIDAK diisi manual.
 * 
 * @param {string} endpoint 
 * @param {FormData} formData 
 */
export async function apiPostFormData(endpoint, formData) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Melakukan PUT request dengan URL query parameters.
 * 
 * @param {string} endpoint 
 * @param {Record<string, string|number>} [params]
 */
export async function apiPut(endpoint, params = {}) {
  let queryString = '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.append(key, String(val));
    }
  });

  const paramStr = searchParams.toString();
  if (paramStr) {
    queryString = endpoint.includes('?') ? `&${paramStr}` : `?${paramStr}`;
  }

  return apiFetch(`${endpoint}${queryString}`, {
    method: 'PUT',
  });
}

export default {
  fetch: apiFetch,
  get: apiGet,
  postFormData: apiPostFormData,
  put: apiPut,
};

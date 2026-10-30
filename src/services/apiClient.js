/**
 * Centralized API Client untuk Sistem Eksisting RS Edelweiss (Dev Flow).
 * Mendukung Basic Auth, query params, FormData, dan error handling terstandar.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const USERNAME = import.meta.env.VITE_API_USERNAME || '';
const PASSWORD = import.meta.env.VITE_API_PASSWORD || '';

/**
 * Menghasilkan token header Basic Authentication.
 * Mendukung karakter UTF-8 secara aman untuk kredensial username dan password.
 * 
 * @returns {string} String header authorization (contoh: 'Basic dXNlcjpwYXNz')
 */
function getBasicAuthHeader() {
  if (!USERNAME || !PASSWORD) return null;
  const credentials = `${USERNAME}:${PASSWORD}`;
  try {
    const encoded = typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(credentials)))
      : Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  } catch {
    return `Basic ${typeof btoa !== 'undefined' ? btoa(credentials) : Buffer.from(credentials).toString('base64')}`;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Wrapper HTTP fetch umum untuk komunikasi ke API RS Edelweiss.
 * Mendukung proteksi batas waktu (timeout) dan percobaan ulang (retry) otomatis jika jaringan bermasalah.
 * 
 * @param {string} endpoint - Path endpoint API (contoh: '/webhook/get-patient')
 * @param {object} [options={}] - Opsi Fetch API tambahan
 * @param {string} [options.method='GET'] - Metode HTTP (GET, POST, PUT, DELETE)
 * @param {HeadersInit} [options.headers] - Custom header tambahan
 * @param {number} [options.timeoutMs=15000] - Batas waktu maksimal request dalam milidetik
 * @param {number} [options.retries] - Jumlah percobaan ulang jika terjadi network timeout/error
 * @returns {Promise<any>} Data hasil respons dari server (JSON atau text)
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  const authHeader = getBasicAuthHeader();
  if (authHeader && !headers.has('Authorization')) {
    headers.set('Authorization', authHeader);
  }
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  if (!headers.has('Pragma')) {
    headers.set('Pragma', 'no-cache');
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.retries ?? (options.method === 'GET' || !options.method ? 2 : 0);

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error(`Permintaan ke server melebihi batas waktu (${Math.round(timeoutMs / 1000)} detik).`));
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        cache: options.cache || 'no-store',
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

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

        // Retry on 502, 503, 504 server gateway errors
        if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
          lastError = err;
          await new Promise(r => setTimeout(r, (attempt + 1) * 800));
          continue;
        }

        throw err;
      }

      return responseData;
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('batas waktu');
      const isNetworkError = err.name === 'TypeError' || err.message?.includes('fetch') || isTimeout;

      lastError = isTimeout
        ? new Error('Koneksi ke server rumah sakit melebihi batas waktu (timeout). Silakan periksa koneksi Anda dan coba lagi.')
        : err;

      if (isNetworkError && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 800));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

/**
 * Melakukan permintaan HTTP GET ke endpoint API RS Edelweiss.
 * 
 * @param {string} endpoint - Path endpoint API
 * @param {Record<string, string|number>} [params={}] - Objek parameter query URL
 * @returns {Promise<any>} Data hasil respons dari server
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
 * Melakukan permintaan HTTP POST dengan format Multipart/form-data.
 * Fetch API secara otomatis mengatur boundary untuk FormData tanpa perlu header Content-Type manual.
 * 
 * @param {string} endpoint - Path endpoint API
 * @param {FormData} formData - Objek data form yang akan dikirim
 * @returns {Promise<any>} Data hasil respons dari server
 */
export async function apiPostFormData(endpoint, formData) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Melakukan permintaan HTTP PUT dengan query parameters ke endpoint API RS Edelweiss.
 * 
 * @param {string} endpoint - Path endpoint API
 * @param {Record<string, string|number>} [params={}] - Objek parameter query URL
 * @returns {Promise<any>} Data hasil respons dari server
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

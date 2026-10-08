/**
 * Centralized API Client untuk Sistem Eksisting RS Edelweiss (Dev Flow).
 * Mendukung Basic Auth, query params, FormData, dan error handling terstandar.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev-flow.edelweiss.id';
const USERNAME = import.meta.env.VITE_API_USERNAME || 'menu-gizi';
const PASSWORD = import.meta.env.VITE_API_PASSWORD || 'KamiParaPejuang123!';

/**
 * Menghasilkan token header Basic Authentication.
 * Mendukung karakter UTF-8 secara aman.
 */
function getBasicAuthHeader() {
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
 * Wrapper HTTP fetch umum untuk API Edelweiss.
 * Mendukung timeout dan retry otomatis untuk kegagalan sementara.
 * 
 * @param {string} endpoint - Path endpoint (misal: '/webhook/get-patient')
 * @param {object} [options={}] - Opsi Fetch API
 * @param {number} [options.timeoutMs=15000] - Batas waktu request dalam ms
 * @param {number} [options.retries] - Jumlah percobaan ulang jika terjadi network timeout/error
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Authorization')) {
    headers.set('Authorization', getBasicAuthHeader());
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

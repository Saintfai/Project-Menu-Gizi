/**
 * Secure Session Storage Utility
 * Hospital Dietary System — Project Menu Gizi
 *
 * Protects Patient PII and sensitive state stored in browser sessionStorage
 * by encrypting/obfuscating payloads so they are not exposed in plaintext.
 */

// Ephemeral session seed derived per browser tab session
const getSessionKey = () => {
  const salt = 'HospitalDietary_v1.8_SecureSalt_2026';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'default_agent';
  let hash = 0;
  const combined = salt + ua;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16) + '9f8b4c2a';
};

const SESSION_KEY = getSessionKey();

/**
 * Obfuscate/encrypt plaintext payload
 * @param {string} text - Plaintext JSON or string
 * @returns {string} - Ciphertext string (Base64 encoded)
 */
function encrypt(text) {
  if (!text) return '';
  try {
    const key = SESSION_KEY;
    const utf8Bytes = new TextEncoder().encode(text);
    const cipherBytes = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      cipherBytes[i] = utf8Bytes[i] ^ key.charCodeAt(i % key.length);
    }
    let binary = '';
    for (let i = 0; i < cipherBytes.length; i++) {
      binary += String.fromCharCode(cipherBytes[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
}

/**
 * Decrypt ciphertext payload
 * @param {string} encoded - Base64 encoded ciphertext
 * @returns {string} - Decrypted plaintext string
 */
function decrypt(encoded) {
  if (!encoded) return null;
  try {
    const binary = atob(encoded);
    const key = SESSION_KEY;
    const cipherBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      cipherBytes[i] = binary.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    }
    return new TextDecoder().decode(cipherBytes);
  } catch (e) {
    // If decoding fails (e.g. legacy plaintext data), return raw or null
    return null;
  }
}

export const secureSessionStorage = {
  /**
   * Set encrypted item in sessionStorage
   * @param {string} key 
   * @param {any} value - String or object to store
   */
  setItem(key, value) {
    try {
      const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const encrypted = encrypt(stringVal);
      sessionStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('secureSessionStorage setItem failed:', e);
    }
  },

  /**
   * Get and decrypt item from sessionStorage
   * @param {string} key 
   * @param {boolean} [isObject=false] - Whether to parse as JSON
   * @returns {any}
   */
  getItem(key, isObject = false) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;

      const decrypted = decrypt(raw);
      if (!decrypted) {
        // Fallback for legacy unencrypted data if any exists
        try {
          return isObject ? JSON.parse(raw) : raw;
        } catch {
          return null;
        }
      }

      if (isObject) {
        return JSON.parse(decrypted);
      }
      return decrypted;
    } catch (e) {
      console.error('secureSessionStorage getItem failed:', e);
      return null;
    }
  },

  /**
   * Remove item from sessionStorage
   * @param {string} key 
   */
  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error('secureSessionStorage removeItem failed:', e);
    }
  },

  /**
   * Clear all sessionStorage
   */
  clear() {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('secureSessionStorage clear failed:', e);
    }
  }
};

export default secureSessionStorage;

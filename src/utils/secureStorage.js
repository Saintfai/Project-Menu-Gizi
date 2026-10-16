


/**
 * Utilitas Penyimpanan Sesi Terenkripsi (Secure Session Storage)
 * Mengamankan data sensitif pasien (No. RM, nama, kamar, riwayat alergi) pada browser sessionStorage
 * menggunakan enkripsi XOR berbasis salt aplikasi dan signature peramban (User-Agent).
 */

// Menghasilkan kunci sesi unik berbasis salt statis dan user-agent perangkat
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
 * Enkripsi string teks biasa menjadi Base64 ciphertext menggunakan XOR cipher
 * 
 * @param {string} text - Teks asli yang akan dienkripsi
 * @returns {string} Ciphertext terenkripsi dalam format Base64
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
 * Dekripsi payload Base64 ciphertext kembali ke string teks asli
 * 
 * @param {string} encoded - Ciphertext terenkripsi Base64
 * @returns {string|null} Teks hasil dekripsi atau null jika gagal
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
  } catch {
    // Jika decoding gagal (misal data legacy tidak terenkripsi), fallback return null
    return null;
  }
}

export const secureSessionStorage = {
  /**
   * Menyimpan data terenkripsi ke dalam sessionStorage browser
   * 
   * @param {string} key - Kunci penyimpanan
   * @param {any} value - Nilai (string atau objek) yang akan dienkripsi dan disimpan
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
   * Mengambil dan mendekripsi data dari sessionStorage browser
   * 
   * @param {string} key - Kunci penyimpanan
   * @param {boolean} [isObject=false] - True jika nilai diharapkan di-parse ke objek JSON
   * @returns {any} Nilai hasil dekripsi atau null jika tidak ditemukan / gagal
   */
  getItem(key, isObject = false) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;

      const decrypted = decrypt(raw);
      if (!decrypted) {
        // Fallback untuk data legacy yang tersimpan tanpa enkripsi
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
   * Menghapus item tertentu dari sessionStorage berdasarkan key
   * 
   * @param {string} key - Kunci penyimpanan yang akan dihapus
   */
  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error('secureSessionStorage removeItem failed:', e);
    }
  },

  /**
   * Menghapus seluruh data sesi dari sessionStorage
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

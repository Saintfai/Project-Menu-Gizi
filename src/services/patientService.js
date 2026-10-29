/**
 * Service Layanan Integrasi Data Pasien & Kamar Rawat Inap
 * Berinteraksi dengan endpoint API RS Edelweiss untuk validasi identitas pasien (No. RM / Nama + Tgl Lahir),
 * pengambilan data rawat inap aktif, dan sinkronisasi riwayat alergi pasien.
 */

import { apiGet } from './apiClient';
import { normalizeRM } from '../utils/formatters';

/**
 * Format tanggal lahir ke format yang diharapkan oleh API RS Edelweiss (DD-MM-YYYY).
 * Menerima string format YYYY-MM-DD (dari input type="date"), Date object, atau format DD-MM-YYYY.
 * 
 * @param {string|Date} dob - Nilai tanggal lahir yang akan diformat
 * @returns {string} Tanggal lahir dengan format DD-MM-YYYY (contoh: "15-08-1990")
 */
export function formatDobForApi(dob) {
  if (!dob) return '';
  const trimmed = String(dob).trim();
  // Jika sudah format DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  // Jika format YYYY-MM-DD (standar input type="date")
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}-${m}-${y}`;
  }
  // Jika Date object atau format string tanggal yang valid lainnya
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return trimmed;
}

/**
 * Menambahkan 1 hari kalender secara murni (UTC) pada string tanggal format DD-MM-YYYY.
 * Digunakan untuk membantu verifikasi selisih pergeseran tanggal lahir dari response API.
 *
 * @param {string} ddMmYyyy - Tanggal dalam format DD-MM-YYYY
 * @returns {string|null} Tanggal H+1 dalam format DD-MM-YYYY atau null jika format tidak sesuai
 */
function addOneCalendarDay(ddMmYyyy) {
  if (!ddMmYyyy || typeof ddMmYyyy !== 'string') return null;
  const match = ddMmYyyy.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const nextUtc = new Date(Date.UTC(year, month - 1, day + 1));
  if (isNaN(nextUtc.getTime())) return null;
  const d = String(nextUtc.getUTCDate()).padStart(2, '0');
  const m = String(nextUtc.getUTCMonth() + 1).padStart(2, '0');
  const y = nextUtc.getUTCFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Rekonsiliasi tanggal lahir pasien jika terjadi pergeseran -1 hari akibat konversi zona waktu historis dari API.
 * Memverifikasi kandidat tanggal langsung ke endpoint database RS agar tetap akurat sesuai data asli pasien.
 *
 * @param {object} raw - Data mentah pasien dari /webhook/get-patient
 * @returns {Promise<object>} Data pasien dengan tanggal_lahir terverifikasi
 */
async function reconcileHistoricalDob(raw) {
  if (!raw || !raw.tanggal_lahir || !raw.nama_pasien || !raw.no_rm) return raw;
  const dobStr = formatDobForApi(raw.tanggal_lahir);
  const match = dobStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return raw;

  const birthYear = Number(match[3]);
  if (isNaN(birthYear) || birthYear >= 1964) {
    return { ...raw, _dobReconciled: true };
  }

  const candidateDob = addOneCalendarDay(dobStr);
  if (!candidateDob) return raw;

  try {
    let verifyRes = await apiGet('/webhook/get-patient-date-birth', {
      nama: String(raw.nama_pasien).trim(),
      tanggal_lahir: candidateDob,
    });
    if (typeof verifyRes === 'string' && verifyRes.trim().startsWith('[')) {
      try {
        verifyRes = JSON.parse(verifyRes);
      } catch {
        // Abaikan jika bukan JSON valid
      }
    }
    const verifyList = Array.isArray(verifyRes)
      ? verifyRes
      : (verifyRes && typeof verifyRes === 'object' ? [verifyRes] : []);
    const targetRm = normalizeRM(raw.no_rm);
    const isVerifiedMatch = verifyList.some(
      (item) => item && item.no_rm && normalizeRM(item.no_rm) === targetRm
    );
    if (isVerifiedMatch) {
      return { ...raw, tanggal_lahir: candidateDob, _dobReconciled: true };
    }
    return { ...raw, _dobReconciled: true };
  } catch {
    // Jika verifikasi gagal/offline, pertahankan data asli tanpa memblokir proses login
  }
  return raw;
}

/**
 * Standarisasi objek data pasien dari API RS ke format internal aplikasi.
 * Menangani aturan kelas titipan (jika ada titipan, kuota porsi mengikuti kelas titipan).
 * 
 * @param {object} raw - Data mentah pasien dari response API RS
 * @returns {object|null} Objek pasien yang sudah dinormalisasi atau null jika data kosong
 */
export function normalizePatient(raw) {
  if (!raw) return null;

  const originalClass = raw.kelas && String(raw.kelas).trim() !== ''
    ? String(raw.kelas).trim()
    : 'Kelas';

  const titipan = raw.titipan && String(raw.titipan).trim() !== ''
    ? String(raw.titipan).trim()
    : null;

  // Kuota porsi mengikuti titipan jika ada (atau kelas kamar fisik jika tidak ada titipan)
  const effectiveClass = titipan || originalClass;

  const allergyText = raw.alergi && String(raw.alergi).trim() !== ''
    ? String(raw.alergi).trim()
    : 'Tidak Ada';

  const noReg = raw.no_regis || raw.no_reg || raw.noreg || raw.no_registrasi || raw.noReg || null;

  return {
    id: raw.no_rm,
    rmNumber: String(raw.no_rm || ''),
    noReg: noReg ? String(noReg).trim() : null,
    noreg: noReg ? String(noReg).trim() : null,
    no_reg: noReg ? String(noReg).trim() : null,
    no_regis: noReg ? String(noReg).trim() : null,
    name: raw.nama_pasien || '-',
    dob: raw.tanggal_lahir || null,
    phone: raw.number_telpon || '-',
    address: raw.alamat || '-',
    allergies: allergyText,
    originalClass: originalClass,
    titipan: titipan,
    roomClass: originalClass,
    effectiveClass: effectiveClass,
    roomName: raw.kamar || '-',
    bentukMakanan: raw.bentuk_makan || null,
    dobReconciled: !!raw._dobReconciled,
    isVerified: true,
  };
}

/**
 * Memeriksa apakah pasien berhak mengakses pemesanan mandiri (hanya pasien VIP / Suite).
 * Pasien non-VIP (Kelas 1, 2, 3) pesanannya diatur otomatis oleh operasional dapur gizi.
 * 
 * @param {object} raw - Data mentah pasien dari API RS
 * @returns {boolean} True jika pasien berstatus VIP / Suite
 */
export function isVipPatient(raw) {
  if (!raw) return false;
  const effectiveClass = raw.titipan && String(raw.titipan).trim() !== ''
    ? String(raw.titipan).trim()
    : String(raw.kelas || '').trim();

  const c = effectiveClass.toUpperCase();
  const k = String(raw.kelas || '').toUpperCase();
  return c.includes('VIP') || c.includes('SUITE') || k.includes('VIP') || k.includes('SUITE');
}

/**
 * Mencari data pasien berdasarkan Nomor Rekam Medis (No. RM).
 * Mendukung format asli rumah sakit (contoh: "00-05-10", "14-81-94", "00.05.10", "RM-00-05-10")
 * maupun format angka biasa (contoh: "510", "12345", "000510", "RM-12345").
 * Endpoint: /webhook/get-patient?pid={noRm}
 * 
 * @param {string|number} rmNumber - Nomor RM pasien
 * @param {object} [options={ vipOnly: true }] - Pengaturan filter pencarian
 * @param {boolean} [options.vipOnly=true] - Jika true, hanya loloskan pasien berstatus VIP / Suite
 * @returns {Promise<{ type: 'single'|'multiple', patient?: object, patients?: Array<object> }>} Objek hasil pencarian pasien
 */
export async function getPatientByRm(rmNumber, options = { vipOnly: true }) {
  const cleanId = normalizeRM(rmNumber);
  if (!cleanId || !/^\d+$/.test(cleanId)) {
    throw new Error('Nomor RM tidak valid.');
  }

  // 1. Coba cari dengan cleanId (contoh: "000510" atau "510")
  let result = await apiGet('/webhook/get-patient', { pid: cleanId });
  let list = Array.isArray(result) ? result : (result && typeof result === 'object' ? [result] : []);

  // 2. Jika tidak ditemukan dan cleanId memiliki leading zeros (contoh: "000510"),
  // coba cari kembali dengan parseInt ("510") untuk memastikan kecocokan dengan database RS
  const intStr = String(parseInt(cleanId, 10));
  if (
    (!list.length || (list[0]?.message && list[0]?.message.toLowerCase().includes('tidak ditemukan'))) &&
    intStr !== cleanId &&
    !isNaN(intStr)
  ) {
    try {
      const retryResult = await apiGet('/webhook/get-patient', { pid: intStr });
      const retryList = Array.isArray(retryResult) ? retryResult : (retryResult && typeof retryResult === 'object' ? [retryResult] : []);
      if (retryList.length && (!retryList[0]?.message || !retryList[0]?.message.toLowerCase().includes('tidak ditemukan'))) {
        result = retryResult;
        list = retryList;
      }
    } catch {
      // Abaikan error retry jika terjadi
    }
  }

  // 3. Sebaliknya jika cleanId pendek (misal: "510") dan tidak ditemukan, coba padStart 6 digit ("000510")
  if (
    (!list.length || (list[0]?.message && list[0]?.message.toLowerCase().includes('tidak ditemukan'))) &&
    cleanId.length < 6
  ) {
    try {
      const paddedStr = cleanId.padStart(6, '0');
      const retryResult = await apiGet('/webhook/get-patient', { pid: paddedStr });
      const retryList = Array.isArray(retryResult) ? retryResult : (retryResult && typeof retryResult === 'object' ? [retryResult] : []);
      if (retryList.length && (!retryList[0]?.message || !retryList[0]?.message.toLowerCase().includes('tidak ditemukan'))) {
        result = retryResult;
        list = retryList;
      }
    } catch {
      // Abaikan error retry jika terjadi
    }
  }

  if (list.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Filter hanya data yang memiliki no_rm atau nama_pasien valid
  let validPatients = list.filter(
    (item) => item && (item.no_rm || item.nama_pasien) && (!item.message || !item.message.toLowerCase().includes('tidak ditemukan'))
  );

  if (validPatients.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Filter khusus pasien VIP / Suite untuk pemesanan mandiri
  if (options?.vipOnly) {
    validPatients = validPatients.filter(isVipPatient);
  }

  if (validPatients.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Verifikasi konsistensi tanggal lahir pasien agar tidak bergeser akibat konversi zona waktu historis
  validPatients = await Promise.all(validPatients.map(reconcileHistoricalDob));

  if (validPatients.length === 1) {
    return {
      type: 'single',
      patient: normalizePatient(validPatients[0]),
    };
  }

  return {
    type: 'multiple',
    patients: validPatients.map(normalizePatient),
  };
}

/**
 * Mencari data pasien berdasarkan Nama Pasien dan Tanggal Lahir.
 * Endpoint: /webhook/get-patient-date-birth?nama={nama}&tanggal_lahir={DD-MM-YYYY}
 * 
 * @param {string} name - Nama lengkap pasien
 * @param {string|Date} dob - Tanggal lahir pasien (format DD-MM-YYYY, YYYY-MM-DD, atau objek Date)
 * @param {object} [options={ vipOnly: true }] - Pengaturan filter pencarian
 * @param {boolean} [options.vipOnly=true] - Jika true, hanya loloskan pasien berstatus VIP / Suite
 * @returns {Promise<{ type: 'single'|'multiple', patient?: object, patients?: Array<object> }>} Objek hasil pencarian pasien
 */
export async function getPatientByNameAndDob(name, dob, options = { vipOnly: true }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) {
    throw new Error('Nama pasien wajib diisi.');
  }

  const formattedDob = formatDobForApi(dob);
  if (!formattedDob) {
    throw new Error('Tanggal lahir pasien wajib diisi.');
  }

  const result = await apiGet('/webhook/get-patient-date-birth', {
    nama: cleanName,
    tanggal_lahir: formattedDob,
  });

  const list = Array.isArray(result) ? result : (result && typeof result === 'object' ? [result] : []);

  if (list.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Filter hanya data yang memiliki no_rm atau nama_pasien valid
  let validPatients = list.filter(
    (item) => item && (item.no_rm || item.nama_pasien) && (!item.message || !item.message.toLowerCase().includes('tidak ditemukan'))
  );

  if (validPatients.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Filter khusus pasien VIP / Suite untuk pemesanan mandiri
  if (options?.vipOnly) {
    validPatients = validPatients.filter(isVipPatient);
  }

  if (validPatients.length === 0) {
    throw new Error('Data pasien tidak ditemukan.');
  }

  // Gunakan formattedDob yang telah terverifikasi cocok di database agar tanggal lahir tetap konsisten
  validPatients = validPatients.map((item) => ({
    ...item,
    tanggal_lahir: formattedDob,
    _dobReconciled: true,
  }));

  if (validPatients.length === 1) {
    return {
      type: 'single',
      patient: normalizePatient(validPatients[0]),
    };
  }

  return {
    type: 'multiple',
    patients: validPatients.map(normalizePatient),
  };
}

// Cache data alergi pasien (in-memory + sessionStorage) agar tidak membebani network
const SESSION_CACHE_KEY = 'hospital_patient_allergies_cache';
const patientInfoCache = new Map();

// Muat cache dari sessionStorage jika ada
function loadSessionCache() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            patientInfoCache.set(k, v);
          });
        }
      }
    }
  } catch {
    // Abaikan jika storage dinonaktifkan atau error
  }
}

function saveSessionCache() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const obj = {};
      patientInfoCache.forEach((v, k) => {
        obj[k] = v;
      });
      window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(obj));
    }
  } catch {
    // Abaikan jika storage penuh atau error
  }
}

// Inisialisasi cache saat modul pertama kali dimuat
loadSessionCache();

/**
 * Membersihkan cache data pasien (digunakan saat admin melakukan refresh manual)
 */
export function clearPatientCache() {
  patientInfoCache.clear();
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // Abaikan
  }
}

/**
 * Mengambil riwayat alergi untuk sekumpulan ID pasien (No. RM / patient_id) secara paralel.
 * Menggunakan cache in-memory dan Promise.allSettled agar toleran terhadap kegagalan jaringan.
 * 
 * @param {Array<string|number>} patientIds - Kumpulan Nomor RM / ID Pasien
 * @returns {Promise<Map<string, { allergies: string, patient: object|null }>>} Map ID pasien ke data alergi
 */
export async function getPatientsAllergiesMap(patientIds = []) {
  const uniqueIds = [...new Set(
    patientIds
      .filter(id => id !== undefined && id !== null && String(id).trim() !== '')
      .map(id => normalizeRM(id))
      .filter(Boolean)
  )];

  const resultMap = new Map();
  const idsToFetch = [];

  uniqueIds.forEach(id => {
    if (patientInfoCache.has(id)) {
      resultMap.set(id, patientInfoCache.get(id));
    } else {
      idsToFetch.push(id);
    }
  });

  if (idsToFetch.length === 0) {
    return resultMap;
  }

  await Promise.allSettled(
    idsToFetch.map(async (cleanId) => {
      try {
        const res = await getPatientByRm(cleanId, { vipOnly: false });
        const patient = res?.patient || (res?.patients && res.patients[0]) || null;
        const entry = {
          allergies: patient?.allergies || 'Tidak Ada',
          patient,
        };
        patientInfoCache.set(cleanId, entry);
        resultMap.set(cleanId, entry);
      } catch {
        // Jika tidak ditemukan atau timeout, fallback ke default agar tabel tetap tampil
        const fallback = {
          allergies: 'Tidak Ada',
          patient: null,
        };
        patientInfoCache.set(cleanId, fallback);
        resultMap.set(cleanId, fallback);
      }
    })
  );

  saveSessionCache();

  return resultMap;
}

/**
 * Memperkaya daftar order dengan data alergi pasien dari API /webhook/get-patient (2nd GET).
 * 
 * @param {Array<object>} orders - Daftar pesanan yang akan dilengkapi data alerginya
 * @returns {Promise<Array<object>>} Daftar pesanan yang telah dilengkapi info alergi dan bentuk makanan
 */
export async function enrichOrdersWithPatientAllergies(orders = []) {
  if (!Array.isArray(orders) || orders.length === 0) return orders;

  const patientIds = orders.map(o => o.patientId || o.patient_id).filter(Boolean);
  if (patientIds.length === 0) return orders;

  const allergiesMap = await getPatientsAllergiesMap(patientIds);

  return orders.map(order => {
    const rawPid = order.patientId || order.patient_id || '';
    const cleanId = normalizeRM(rawPid);
    const info = allergiesMap.get(cleanId);

    if (info) {
      const allergyText = info.allergies || 'Tidak Ada';
      const patientBentukMakanan = info.patient?.bentukMakanan || null;
      const patientNoReg = info.patient?.noReg || order.noReg || order.noreg || null;
      return {
        ...order,
        allergies: allergyText,
        allergyNote: allergyText,
        patientBentukMakanan,
        noReg: patientNoReg,
        noreg: patientNoReg,
        patient: {
          ...(order.patient || {}),
          name: info.patient?.name || order.patientName || 'Pasien',
          rmNumber: info.patient?.rmNumber || order.rmNumber || cleanId,
          noReg: patientNoReg,
          noreg: patientNoReg,
          allergies: allergyText,
          bentukMakanan: patientBentukMakanan,
        },
      };
    }

    return order;
  });
}

/**
 * Mengambil ringkasan sensus total pasien rawat inap aktif dari server RS Edelweiss
 * Endpoint: /webhook/total-pasien-aktif
 * 
 * @returns {Promise<{ totalPasien: number, pasienKelas: number, pasienVip: number }>}
 */
export async function getTotalActivePatients() {
  try {
    const data = await apiGet('/webhook/total-pasien-aktif');
    if (!data || typeof data !== 'object') {
      return { totalPasien: 0, pasienKelas: 0, pasienVip: 0 };
    }
    return {
      totalPasien: Number(data.total_pasien) || 0,
      pasienKelas: Number(data.pasien_kelas) || 0,
      pasienVip: Number(data.pasien_vip) || 0,
    };
  } catch (err) {
    console.warn('[patientService] Gagal mengambil total pasien aktif:', err.message);
    return { totalPasien: 0, pasienKelas: 0, pasienVip: 0 };
  }
}

export default {
  getPatientByRm,
  getPatientByNameAndDob,
  getPatientsAllergiesMap,
  enrichOrdersWithPatientAllergies,
  getTotalActivePatients,
  normalizePatient,
  isVipPatient,
  formatDobForApi,
  clearPatientCache,
};

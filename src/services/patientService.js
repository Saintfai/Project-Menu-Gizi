import { apiGet } from './apiClient';

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
 * Standarisasi objek data pasien dari API RS ke format internal aplikasi.
 * Menangani aturan kelas titipan (jika ada titipan, kuota porsi mengikuti kelas titipan).
 * 
 * @param {object} raw - Data mentah pasien dari response API RS
 * @returns {object|null} Objek pasien yang sudah dinormalisasi atau null jika data kosong
 */
export function normalizePatient(raw) {
  if (!raw) return null;

  // Gunakan kelas titipan jika tersedia, jika tidak gunakan kelas asli
  const effectiveClass = raw.titipan && String(raw.titipan).trim() !== ''
    ? String(raw.titipan).trim()
    : String(raw.kelas || 'Kelas').trim();

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
    originalClass: raw.kelas || '-',
    titipan: raw.titipan || null,
    roomClass: effectiveClass,
    roomName: raw.kamar || '-',
    bentukMakanan: raw.bentuk_makan || null,
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
  return c.includes('VIP') || c.includes('SUITE');
}

/**
 * Mencari data pasien berdasarkan Nomor Rekam Medis (No. RM).
 * Endpoint: /webhook/get-patient?pid={noRm}
 * 
 * @param {string|number} rmNumber - Nomor RM pasien (contoh: "12345" atau "RM-12345")
 * @param {object} [options={ vipOnly: true }] - Pengaturan filter pencarian
 * @param {boolean} [options.vipOnly=true] - Jika true, hanya loloskan pasien berstatus VIP / Suite
 * @returns {Promise<{ type: 'single'|'multiple', patient?: object, patients?: Array<object> }>} Objek hasil pencarian pasien
 */
export async function getPatientByRm(rmNumber, options = { vipOnly: true }) {
  const cleanId = String(rmNumber).replace(/^RM-?/i, '').trim();
  if (!cleanId) {
    throw new Error('Nomor RM tidak valid.');
  }

  const result = await apiGet('/webhook/get-patient', { pid: cleanId });

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

// In-memory cache untuk data alergi pasien agar tidak membebani network
const patientInfoCache = new Map();

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
      .map(id => String(id).replace(/^RM-?/i, '').trim())
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
    const cleanId = String(rawPid).replace(/^RM-?/i, '').trim();
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

export default {
  getPatientByRm,
  getPatientByNameAndDob,
  getPatientsAllergiesMap,
  enrichOrdersWithPatientAllergies,
  normalizePatient,
  isVipPatient,
  formatDobForApi,
};

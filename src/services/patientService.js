import { apiGet } from './apiClient';

/**
 * Format tanggal lahir ke format yang diharapkan oleh API Edelweiss (DD-MM-YYYY).
 * Menerima format YYYY-MM-DD (dari HTML5 date picker), Date object, atau DD-MM-YYYY.
 * 
 * @param {string|Date} dob 
 * @returns {string}
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
 * Normalisasi objek pasien dari API Edelweiss ke format data internal aplikasi.
 * 
 * @param {object} raw 
 * @returns {object|null}
 */
export function normalizePatient(raw) {
  if (!raw) return null;

  // Aturan Titipan:
  // Jika ada titipan, gunakan kelas titipan untuk kuota porsi. Jika tidak, gunakan kelas asli.
  const effectiveClass = raw.titipan && String(raw.titipan).trim() !== ''
    ? String(raw.titipan).trim()
    : String(raw.kelas || 'Kelas').trim();

  const allergyText = raw.alergi && String(raw.alergi).trim() !== ''
    ? String(raw.alergi).trim()
    : 'Tidak Ada';

  return {
    id: raw.no_rm,
    rmNumber: String(raw.no_rm || ''),
    name: raw.nama_pasien || '-',
    dob: raw.tanggal_lahir || null,
    phone: raw.number_telpon || '-',
    address: raw.alamat || '-',
    allergies: allergyText,
    originalClass: raw.kelas || '-',
    titipan: raw.titipan || null,
    roomClass: effectiveClass,
    roomName: raw.kamar || '-',
    isVerified: true,
  };
}

/**
 * Mengambil data pasien berdasarkan Nomor RM.
 * Endpoint: /webhook/get-patient?pid={noRm}
 * 
 * @param {string|number} rmNumber 
 * @returns {Promise<{ type: 'single'|'multiple', patient?: object, patients?: Array<object> }>}
 */
export async function getPatientByRm(rmNumber) {
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
  const validPatients = list.filter(
    (item) => item && (item.no_rm || item.nama_pasien) && (!item.message || !item.message.toLowerCase().includes('tidak ditemukan'))
  );

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
 * Mengambil data pasien berdasarkan Nama dan Tanggal Lahir.
 * Endpoint: /webhook/get-patient-date-birth?nama={nama}&tanggal_lahir={DD-MM-YYYY}
 * 
 * @param {string} name 
 * @param {string|Date} dob 
 * @returns {Promise<{ type: 'single'|'multiple', patient?: object, patients?: Array<object> }>}
 */
export async function getPatientByNameAndDob(name, dob) {
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
  const validPatients = list.filter(
    (item) => item && (item.no_rm || item.nama_pasien) && (!item.message || !item.message.toLowerCase().includes('tidak ditemukan'))
  );

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

export default {
  getPatientByRm,
  getPatientByNameAndDob,
  normalizePatient,
  formatDobForApi,
};

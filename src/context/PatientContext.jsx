import { createContext, useContext, useState, useEffect } from 'react';
import { secureSessionStorage } from '../utils/secureStorage';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const savedPatient = secureSessionStorage.getItem('active_patient_session', true);
    if (savedPatient) {
      setPatient(savedPatient);
    }
    setLoading(false);
  }, []);

  
  // Login / verifikasi data pasien via Sistem Eksisting RS Edelweiss
  const loginPatient = async (identifier, dob) => {
    // Bersihkan input No. RM dari teks non-digit jika diperlukan (contoh 'RM-26768' -> '26768')
    const cleanId = String(identifier).replace(/^RM-?/i, '').trim();

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'https://dev-flow.edelweiss.id'}/webhook/get-patient?pid=${encodeURIComponent(cleanId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_USERNAME || 'menu-gizi'}:${import.meta.env.VITE_API_PASSWORD || 'KamiParaPejuang123!'}`)}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Terjadi gangguan saat menghubungi sistem rumah sakit.');
    }

    const result = await response.json().catch(() => null);

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Data pasien tidak ditemukan.');
    }

    const firstItem = result[0];
    if (firstItem.message && firstItem.message.toLowerCase().includes('tidak ditemukan')) {
      throw new Error('Data pasien tidak ditemukan.');
    }

    if (!firstItem.no_rm && !firstItem.nama_pasien) {
      throw new Error('Format data pasien tidak valid.');
    }

    // Aturan Titipan:
    // Jika ada titipan, gunakan kelas titipan untuk kuota porsi. Jika tidak, gunakan kelas asli.
    const effectiveClass = firstItem.titipan ? String(firstItem.titipan).trim() : String(firstItem.kelas || 'Kelas').trim();
    const allergyText = firstItem.alergi && String(firstItem.alergi).trim() !== '' 
      ? String(firstItem.alergi).trim() 
      : 'Tidak Ada';

    const patientData = {
      id: firstItem.no_rm,
      rmNumber: String(firstItem.no_rm),
      name: firstItem.nama_pasien,
      phone: firstItem.number_telpon || '-',
      address: firstItem.alamat || '-',
      allergies: allergyText,
      originalClass: firstItem.kelas || '-',
      titipan: firstItem.titipan || null,
      roomClass: effectiveClass,
      roomName: firstItem.kamar || '-',
      dob: null,
      isVerified: true,
    };

    setPatient(patientData);
    secureSessionStorage.setItem('active_patient_session', patientData);
    return { type: 'single', patient: patientData };
  };

  const selectPatient = (selectedPatient) => {
    const patientData = {
      ...selectedPatient,
      isVerified: selectedPatient.isVerified ?? true,
    };
    setPatient(patientData);
    secureSessionStorage.setItem('active_patient_session', patientData);
    return patientData;
  };

  const updatePatientInfo = (updatedFields) => {
    setPatient((prev) => {
      const next = { ...prev, ...updatedFields };
      secureSessionStorage.setItem('active_patient_session', next);
      return next;
    });
  };

  const logoutPatient = () => {
    setPatient(null);
    secureSessionStorage.removeItem('active_patient_session');
    secureSessionStorage.removeItem('patient_cart');
    secureSessionStorage.removeItem('patient_cart_note');
  };

  return (
    <PatientContext.Provider
      value={{
        patient,
        isVerified: !!patient?.isVerified,
        loading,
        loginPatient,
        selectPatient,
        updatePatientInfo,
        logoutPatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}

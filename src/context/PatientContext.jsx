import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved active patient in sessionStorage
    const savedPatient = sessionStorage.getItem('active_patient_session');
    if (savedPatient) {
      try {
        setPatient(JSON.parse(savedPatient));
      } catch (e) {
        console.error('Error parsing patient session:', e);
        sessionStorage.removeItem('active_patient_session');
      }
    }
    setLoading(false);
  }, []);

  // Async login function hitting Supabase
  const loginPatient = async (identifier, dob) => {
    try {
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('dob', dob);

      if (error) {
        console.error('Supabase Login error:', error);
        throw new Error('Terjadi kesalahan sistem saat mencari data.');
      }

      if (!data || data.length === 0) {
        throw new Error('Data pasien tidak ditemukan atau tanggal lahir salah.');
      }

      // 1. Normalisasi input user: Hapus SEMUA spasi dan ubah ke huruf kecil
      const normalizedInput = identifier.replace(/\s+/g, '').toLowerCase();

      // 2. Cari pasien yang cocok (No RM atau Nama) secara fleksibel
      const matchedPatient = data.find((p) => {
        const normRM = (p.rmNumber || '').replace(/\s+/g, '').toLowerCase();
        const normName = (p.name || '').replace(/\s+/g, '').toLowerCase();
        
        // Bisa cocok dengan RM persis, Nama persis, atau Nama yang mengandung input (jika user hanya ketik nama depan)
        return normRM === normalizedInput || normName === normalizedInput || normName.includes(normalizedInput);
      });

      if (!matchedPatient) {
        throw new Error('Data pasien tidak ditemukan atau tanggal lahir salah.');
      }

      // Saves patient basic verification info
      const patientData = {
        ...matchedPatient,
        isVerified: matchedPatient.isVerified ?? true,
      };
      
      setPatient(patientData);
      sessionStorage.setItem('active_patient_session', JSON.stringify(patientData));
      
      return patientData;
    } catch (err) {
      throw err;
    }
  };

  const updatePatientInfo = (updatedFields) => {
    setPatient((prev) => {
      const next = { ...prev, ...updatedFields };
      sessionStorage.setItem('active_patient_session', JSON.stringify(next));
      return next;
    });
  };

  const logoutPatient = () => {
    setPatient(null);
    sessionStorage.removeItem('active_patient_session');
    sessionStorage.removeItem('patient_cart');
  };

  return (
    <PatientContext.Provider
      value={{
        patient,
        isVerified: !!patient?.isVerified,
        loading,
        loginPatient,
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

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
      const normalizedInput = identifier.replace(/\s+/g, '').toLowerCase();
      const isRM = /\d/.test(normalizedInput);

      let query = supabase.from('Patient').select('*');
      
      if (isRM) {
        const numericInput = normalizedInput.replace(/[^0-9]/g, '');
        const formattedRM = `RM-${numericInput}`;
        query = query.eq('rmNumber', formattedRM);
      } else {
        query = query.eq('dob', dob);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Login error:', error);
        throw new Error('Terjadi kesalahan sistem saat mencari data.');
      }

      if (!data || data.length === 0) {
        throw new Error('Data pasien tidak ditemukan.');
      }

      // 2. Cari pasien yang cocok (No RM atau Nama) secara fleksibel
      const matchedPatients = data.filter((p) => {
        if (isRM) {
          const pNumeric = (p.rmNumber || '').replace(/[^0-9]/g, '');
          const inputNumeric = normalizedInput.replace(/[^0-9]/g, '');
          return pNumeric === inputNumeric;
        } else {
          const normName = (p.name || '').replace(/\s+/g, '').toLowerCase();
          return normName === normalizedInput || normName.includes(normalizedInput);
        }
      });

      if (matchedPatients.length === 0) {
        throw new Error('Data pasien tidak ditemukan atau tanggal lahir salah.');
      }

      if (matchedPatients.length === 1) {
        const patientData = {
          ...matchedPatients[0],
          isVerified: matchedPatients[0].isVerified ?? true,
        };
        
        setPatient(patientData);
        sessionStorage.setItem('active_patient_session', JSON.stringify(patientData));
        return { type: 'single', patient: patientData };
      } else {
        return { type: 'multiple', patients: matchedPatients };
      }
    } catch (err) {
      throw err;
    }
  };

  const selectPatient = (selectedPatient) => {
    const patientData = {
      ...selectedPatient,
      isVerified: selectedPatient.isVerified ?? true,
    };
    setPatient(patientData);
    sessionStorage.setItem('active_patient_session', JSON.stringify(patientData));
    return patientData;
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
    sessionStorage.removeItem('patient_cart_note');
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

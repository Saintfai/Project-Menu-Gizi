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
      const cleanId = identifier.trim();
      
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .or(`rmNumber.eq.${cleanId},name.eq.${cleanId}`)
        .eq('dob', dob)
        .maybeSingle();

      if (error) {
        console.error('Supabase Login error:', error);
        throw new Error('Terjadi kesalahan sistem saat mencari data.');
      }

      if (!data) {
        throw new Error('Data pasien tidak ditemukan atau tanggal lahir salah.');
      }

      // Saves patient basic verification info
      const patientData = {
        ...data,
        isVerified: data.isVerified ?? true,
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

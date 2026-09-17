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

  
  const loginPatient = async (identifier, dob) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patient-lookup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ identifier, dob }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan sistem saat mencari data.');
      }

      if (result.type === 'single' && result.patient) {
        const patientData = {
          ...result.patient,
          isVerified: result.patient.isVerified ?? true,
        };
        setPatient(patientData);
        secureSessionStorage.setItem('active_patient_session', patientData);
        return { type: 'single', patient: patientData };
      } else if (result.type === 'multiple' && result.patients) {
        return { type: 'multiple', patients: result.patients };
      } else {
        throw new Error('Format respon pasien tidak dikenali.');
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

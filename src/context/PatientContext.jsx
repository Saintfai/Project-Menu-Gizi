import { createContext, useContext, useState, useEffect } from 'react';
import { secureSessionStorage } from '../utils/secureStorage';
import { getPatientByRm, getPatientByNameAndDob } from '../services/patientService';

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
    let result;
    if (dob) {
      // Login via Nama Pasien & Tanggal Lahir
      result = await getPatientByNameAndDob(identifier, dob);
    } else {
      // Login via Nomor RM
      result = await getPatientByRm(identifier);
    }

    if (result.type === 'single') {
      setPatient(result.patient);
      secureSessionStorage.setItem('active_patient_session', result.patient);
    }

    return result;
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

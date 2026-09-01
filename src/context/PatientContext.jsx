import { createContext, useContext, useState, useEffect } from 'react';

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

  const loginPatient = (patientData) => {
    // Saves patient basic verification info
    const data = {
      ...patientData,
      isVerified: patientData.isVerified ?? true,
    };
    setPatient(data);
    sessionStorage.setItem('active_patient_session', JSON.stringify(data));
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

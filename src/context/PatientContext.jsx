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

      // Auto-rehydrate noReg jika sesi yang tersimpan sebelumnya belum memiliki noReg
      const hasReg = savedPatient.noReg || savedPatient.noreg || savedPatient.no_reg || savedPatient.no_regis;
      const rmId = savedPatient.rmNumber || savedPatient.id;
      if (!hasReg && rmId) {
        getPatientByRm(rmId)
          .then((res) => {
            if (res?.patient) {
              setPatient((prev) => {
                const merged = { ...prev, ...res.patient };
                secureSessionStorage.setItem('active_patient_session', merged);
                return merged;
              });
            }
          })
          .catch((err) => {
            console.warn('[PatientContext] Auto re-hydrate noReg warning:', err.message);
          });
      }
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

  // Simpan data pasien yang dipilih (jika pencarian menghasilkan lebih dari 1 pasien)
  const selectPatient = (selectedPatient) => {
    const patientData = {
      ...selectedPatient,
      isVerified: selectedPatient.isVerified ?? true,
    };
    setPatient(patientData);
    secureSessionStorage.setItem('active_patient_session', patientData);
    return patientData;
  };

  // Perbarui informasi data pasien di context dan session storage
  const updatePatientInfo = (updatedFields) => {
    setPatient((prev) => {
      const next = { ...prev, ...updatedFields };
      secureSessionStorage.setItem('active_patient_session', next);
      return next;
    });
  };

  // Hapus sesi aktif pasien dan data keranjang saat keluar
  const logoutPatient = () => {
    setPatient(null);
    secureSessionStorage.removeItem('active_patient_session');
    secureSessionStorage.removeItem('patient_cart');
    secureSessionStorage.removeItem('patient_cart_note');
    secureSessionStorage.removeItem('patient_cart_quantities');
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

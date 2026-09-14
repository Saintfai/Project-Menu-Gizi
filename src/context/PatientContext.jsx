/**
 * NAMA FILE: PatientContext.jsx
 * FUNGSI UTAMA: React Context Provider untuk manajemen state global aplikasi.
 * 
 * DETAIL:
 * - Menyediakan state dan fungsi yang dapat diakses oleh komponen turunan tanpa prop-drilling.
 * - Mengelola siklus hidup data (otentikasi, keranjang belanja, atau data pasien).
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
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
      const normalizedInput = identifier.replace(/\s+/g, '').toLowerCase();
      const isRM = /\d/.test(normalizedInput);

      // ─── SECURITY FIX: Select only needed columns (no select('*')) ───
      let query = supabase.from('Patient').select(
        'id, rmNumber, name, dob, phone, address, roomName, roomClass, allergies'
      );
      
      if (isRM) {
        const numericInput = normalizedInput.replace(/[^0-9]/g, '');
        const formattedRM = `RM-${numericInput}`;
        query = query.eq('rmNumber', formattedRM);
      } else {
        
        if (!dob) {
          throw new Error('Tanggal lahir wajib diisi untuk pencarian berdasarkan nama.');
        }
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

      
      const matchedPatients = data.filter((p) => {
        if (isRM) {
          const pNumeric = (p.rmNumber || '').replace(/[^0-9]/g, '');
          const inputNumeric = normalizedInput.replace(/[^0-9]/g, '');
          return pNumeric === inputNumeric;
        } else {
          const normName = (p.name || '').replace(/\s+/g, '').toLowerCase();
          return normName === normalizedInput;
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
        secureSessionStorage.setItem('active_patient_session', patientData);
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

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { secureSessionStorage } from '../utils/secureStorage';
import { usePatient } from './PatientContext';

const CartContext = createContext(null);

const EMPTY_CART = {
  mainMeals: { breakfast: [], lunch: [], dinner: [] },
  extraMeals: [],
};

export function CartProvider({ children }) {
  const { patient } = usePatient();
  const currentPatientKey = patient?.id || patient?.rmNumber ? String(patient.id || patient.rmNumber) : null;
  const prevPatientKeyRef = useRef(currentPatientKey);

  const [cart, setCart] = useState(() => {
    const saved = secureSessionStorage.getItem('patient_cart', true);
    const savedOwner = secureSessionStorage.getItem('patient_cart_owner');
    if (saved && savedOwner && currentPatientKey && savedOwner === currentPatientKey) {
      return saved;
    }
    return EMPTY_CART;
  });

  // Jika pasien berganti (misal logout RM 01 lalu login RM 02), reset keranjang seketika
  useEffect(() => {
    if (prevPatientKeyRef.current !== currentPatientKey) {
      prevPatientKeyRef.current = currentPatientKey;
      setCart(EMPTY_CART);
      secureSessionStorage.removeItem('patient_cart');
      secureSessionStorage.removeItem('patient_cart_owner');
      secureSessionStorage.removeItem('patient_cart_note');
      secureSessionStorage.removeItem('patient_cart_quantities');
    }
  }, [currentPatientKey]);

  // Sinkronkan ke session storage dengan penanda identitas pemilik keranjang
  useEffect(() => {
    if (currentPatientKey) {
      secureSessionStorage.setItem('patient_cart', cart);
      secureSessionStorage.setItem('patient_cart_owner', currentPatientKey);
    } else {
      secureSessionStorage.removeItem('patient_cart');
      secureSessionStorage.removeItem('patient_cart_owner');
    }
  }, [cart, currentPatientKey]);

  const setMainMeal = (mealTime, items) => {
    setCart((prev) => ({
      ...prev,
      mainMeals: {
        ...prev.mainMeals,
        [mealTime]: items,
      },
    }));
  };

  const addExtraMeal = (item) => {
    setCart((prev) => {
      const existingIndex = prev.extraMeals.findIndex((m) => m.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev.extraMeals];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + (item.qty || 1),
          note: item.note || updated[existingIndex].note,
        };
        return { ...prev, extraMeals: updated };
      }
      return {
        ...prev,
        extraMeals: [...prev.extraMeals, { ...item, qty: item.qty || 1 }],
      };
    });
  };

  const updateExtraMeal = (id, fields) => {
    setCart((prev) => ({
      ...prev,
      extraMeals: prev.extraMeals.map((m) => (m.id === id ? { ...m, ...fields } : m)),
    }));
  };

  const removeExtraMeal = (id) => {
    setCart((prev) => ({
      ...prev,
      extraMeals: prev.extraMeals.filter((m) => m.id !== id),
    }));
  };

  const clearCart = () => {
    setCart(EMPTY_CART);
    secureSessionStorage.removeItem('patient_cart');
    secureSessionStorage.removeItem('patient_cart_owner');
    secureSessionStorage.removeItem('patient_cart_note');
    secureSessionStorage.removeItem('patient_cart_quantities');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setMainMeal,
        addExtraMeal,
        updateExtraMeal,
        removeExtraMeal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

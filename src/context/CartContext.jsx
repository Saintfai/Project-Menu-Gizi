import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Cart items structure:
  // mainMeals: { breakfast: [], lunch: [], dinner: [] }
  // extraMeals: [ { id, name, price, qty, serveTime, note } ]
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem('patient_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    return {
      mainMeals: { breakfast: [], lunch: [], dinner: [] },
      extraMeals: [],
    };
  });

  useEffect(() => {
    sessionStorage.setItem('patient_cart', JSON.stringify(cart));
  }, [cart]);

  const setMainMeal = (mealTime, items) => {
    // mealTime: 'breakfast' | 'lunch' | 'dinner'
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
    setCart({
      mainMeals: { breakfast: [], lunch: [], dinner: [] },
      extraMeals: [],
    });
    sessionStorage.removeItem('patient_cart');
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

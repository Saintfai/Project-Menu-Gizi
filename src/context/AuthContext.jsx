import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const verifySession = async () => {
      const savedAdmin = localStorage.getItem('hospital_admin_session');
      if (!savedAdmin) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(savedAdmin);

        
        if (!parsed.token) {
          localStorage.removeItem('hospital_admin_session');
          setLoading(false);
          return;
        }

        // Periksa apakah sesi masih valid dan belum kedaluwarsa
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem('hospital_admin_session');
          setAdmin(null);
        } else {
          setAdmin(parsed);
        }
      } catch (e) {
        console.error('Session verification failed:', e);
        localStorage.removeItem('hospital_admin_session');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData) => {
    setAdmin(userData);
    localStorage.setItem('hospital_admin_session', JSON.stringify(userData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('hospital_admin_session');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  LogIn, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import Input from '../../components/ui/forms/Input';
import { useAuth } from '../../context/AuthContext';
import logoEdhos from '../../assets/logoedhos.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ─── SECURITY FIX: Validate password server-side via Edge Function ───
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
        return;
      }

      const { token } = await res.json();
      login({
        id: 'adm-001',
        name: 'Staf Dapur Gizi',
        role: 'admin_gizi',
        token,
      });
      navigate('/menu/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative overflow-hidden bg-neutral-50 flex flex-col font-sans text-neutral-800">
      
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-200/75 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-rose-200/75 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[360px] bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white"
        >
          <div className="flex flex-col items-center mb-6">
            <img 
              src={logoEdhos} 
              alt="Logo RS Edelweiss" 
              className="h-12 w-auto object-contain mb-3" 
            />
            <h2 className="text-xl font-bold text-neutral-800 text-center tracking-tight mb-1">
              Portal Dapur Gizi
            </h2>
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
              Masukkan kata sandi untuk mengakses dashboard rekap dan manajemen gizi.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-danger-50 border border-danger-100 p-3 text-xs text-danger-600"
            >
              <AlertCircle size={15} className="shrink-0 text-danger-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="Masukkan kata sandi..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} strokeWidth={1.5} />}
              autoFocus
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white h-11 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-primary-900/15 text-sm border-none outline-none disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2.2} />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Restriction Note */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-start gap-2.5">
            <Info size={15} className="text-neutral-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              Akses terbatas untuk Petugas Dapur dan Dietisien RS Edelweiss.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center flex flex-col gap-1">
          <p className="text-xs font-medium text-neutral-600">© 2026 RS Edelweiss. All Rights Reserved.</p>
          <p className="text-xs text-neutral-500">Dashboard Manajemen &amp; Produksi Gizi</p>
        </div>
      </div>

    </div>
    </PageTransition>
  );
}

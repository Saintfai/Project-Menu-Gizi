import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import logoEdhos from '../../assets/logoedhos.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication check
    setTimeout(() => {
      if (
        (username === 'admin' || username === 'dapur' || username === 'gizi') &&
        password === 'admin123'
      ) {
        login({
          id: 'adm-001',
          name: username === 'dapur' ? 'Staf Kitchen Dapur' : 'Dietisien / Ahli Gizi',
          role: username === 'dapur' ? 'kitchen' : 'admin_gizi',
          username: username,
        });
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('Username atau password tidak sesuai. Coba: admin / admin123');
      }
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col font-sans text-gray-800">
      
      {/* Background Ambient Gradients */}
      <div className="fixed top-0 right-0 w-[350px] h-[350px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[350px] h-[350px] bg-emerald-100/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[360px] bg-white/90 backdrop-blur-xl rounded-[24px] p-6 shadow-2xl border border-white"
        >
          {/* Card Header */}
          <div className="flex flex-col items-center mb-5">
            <img 
              src={logoEdhos} 
              alt="Logo RS Edelweiss" 
              className="h-12 w-auto object-contain mb-3" 
            />
            <h2 className="text-xl font-bold text-slate-800 text-center tracking-tight mb-1">
              Portal Dapur Gizi
            </h2>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Masuk untuk memantau rekap pesanan dan mengelola siklus menu makanan.
            </p>
          </div>

          {/* Error Feedback */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-600"
            >
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input: Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                Username / ID Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: admin / dapur"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#00529B] hover:bg-[#004280] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 text-xs border-none outline-none disabled:opacity-60"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn size={15} strokeWidth={2.2} />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info inside Card */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-start gap-2">
            <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Akses terbatas untuk Petugas Dapur dan Dietisien RS.
            </p>
          </div>
        </motion.div>

        {/* Page Footer */}
        <div className="mt-8 text-center flex flex-col gap-1 opacity-70">
          <p className="text-[10px] text-slate-500">© 2026 RS Edelweiss. All Rights Reserved.</p>
          <p className="text-[10px] text-slate-400">Dashboard Manajemen & Produksi Gizi</p>
        </div>
      </div>

    </div>
  );
}

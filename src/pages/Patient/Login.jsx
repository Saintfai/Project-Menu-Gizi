import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IdCard, 
  UserSearch, 
  Calendar, 
  Search, 
  Info 
} from 'lucide-react';
import { motion } from 'framer-motion';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';

export default function PatientLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [dob, setDob] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate login success and redirect to onboarding for verification
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col font-sans text-gray-800 pt-[60px]">
      
      {/* Background Gradients - Adjusted visibility */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Using Existing HeaderMobile Component - Fixed at top */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] text-gray-500 font-normal">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 z-10 relative pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[320px] bg-white/90 backdrop-blur-xl rounded-[24px] p-5 shadow-2xl border border-white"
        >
          {/* Card Header */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 text-blue-800 shadow-inner">
              <IdCard size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 text-center tracking-tight mb-1.5">
              Masukkan Identitas
            </h2>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Silakan masukkan data pasien untuk mengakses menu gizi yang disesuaikan.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Input: No RM / Nama */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                No RM / Nama Pasien
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserSearch size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: RM123456 / John Doe"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input: Tanggal Lahir */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                Tanggal Lahir
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-1 bg-[#00529B] hover:bg-[#004280] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 text-xs border-none outline-none"
            >
              <Search size={14} strokeWidth={2.5} />
              <span>Cari Pasien</span>
            </button>
          </form>

          {/* Footer Info inside Card */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-start gap-2">
            <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Data pasien digunakan untuk menyesuaikan menu gizi.
            </p>
          </div>
        </motion.div>

        {/* Page Footer */}
        <div className="mt-8 text-center flex flex-col gap-1 opacity-70">
          <p className="text-[10px] text-slate-500">© 2026 RS Edelweiss. All Rights Reserved.</p>
          <p className="text-[10px] text-slate-400">Sistem Pemesanan Menu Gizi Pasien Rawat Inap</p>
        </div>
      </div>

    </div>
  );
}

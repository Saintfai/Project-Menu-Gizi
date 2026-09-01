import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IdCard, 
  UserSearch, 
  Calendar, 
  Search, 
  Info,
  Loader2,
  UserX,
  Phone,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';

// --- Data Arrays ---
const days = Array.from({ length: 31 }, (_, i) => {
  const val = (i + 1).toString().padStart(2, '0');
  return { value: val, label: val };
});

const months = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Ags' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Okt' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Des' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => {
  const val = (currentYear - i).toString();
  return { value: val, label: val };
});

// --- Custom Select Component ---
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-2.5 pr-5 py-2.5 bg-slate-100/80 border-none outline-none ring-0 ${
          !value ? 'text-slate-400' : 'text-slate-700'
        } rounded-xl text-[12.5px] transition-all text-left flex items-center justify-between`}
      >
        <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown size={14} strokeWidth={2} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            // max-h-[175px] ~ allows roughly 5 items (approx 34px each) to be visible at once
            className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl max-h-[175px] overflow-y-auto"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-blue-50 transition-colors ${
                  value === opt.value ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600'
                }`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PatientLogin() {
  const navigate = useNavigate();
  const { loginPatient } = usePatient();
  const [identifier, setIdentifier] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!dobDay || !dobMonth || !dobYear) {
      setErrorMsg('Silakan lengkapi pilihan Tanggal Lahir.');
      return;
    }

    setIsLoading(true);
    setShowNotFound(false);
    
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;
    
    try {
      await loginPatient(identifier.trim(), dob);
      navigate('/onboarding');
    } catch (err) {
      setShowNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setShowNotFound(false);
    setErrorMsg('');
    setIdentifier('');
    setDobDay('');
    setDobMonth('');
    setDobYear('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col font-sans text-gray-800 pt-[60px]">
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Fixed Header */}
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
        
        <AnimatePresence mode="wait">
          {showNotFound ? (
            /* ==================== NOT FOUND STATE ==================== */
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-[320px] flex flex-col items-center text-center relative z-20 bg-white/90 backdrop-blur-xl rounded-[24px] p-5 shadow-2xl border border-white"
            >
              {/* Icon Illustration */}
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center">
                  <UserX size={48} className="text-red-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                  <span className="text-red-500 text-sm font-bold">✕</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                Data Pasien Tidak Ditemukan
              </h2>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed mb-8 px-2">
                Maaf, data dengan No. RM atau Nama yang Anda masukkan tidak terdaftar di sistem kami. Silakan periksa kembali input Anda atau hubungi perawat.
              </p>

              {/* Coba Lagi Button */}
              <button
                onClick={handleRetry}
                className="w-full bg-[#00529B] hover:bg-[#004280] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 text-sm border-none outline-none mb-3"
              >
                <RotateCcw size={16} strokeWidth={2} />
                <span>Coba Lagi</span>
              </button>

              {/* Hubungi Perawat Button */}
              <button
                onClick={() => {/* Could link to a contact or call action */}}
                className="w-full bg-white hover:bg-slate-50 text-[#00529B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-[#00529B] text-sm outline-none"
              >
                <Phone size={16} strokeWidth={2} />
                <span>Hubungi Perawat</span>
              </button>
            </motion.div>
          ) : (
            /* ==================== LOGIN FORM STATE ==================== */
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[320px] bg-white/90 backdrop-blur-xl rounded-[24px] p-5 shadow-2xl border border-white relative z-20"
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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100/80 border-none outline-none ring-0 rounded-xl text-[13px] transition-all placeholder:text-slate-400"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Input: Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    Tanggal Lahir
                  </label>
                  <div className="grid grid-cols-[1.1fr_1.1fr_1fr] gap-1.5">
                    <CustomSelect 
                      options={days} 
                      value={dobDay} 
                      onChange={setDobDay} 
                      placeholder="Tanggal" 
                    />
                    <CustomSelect 
                      options={months} 
                      value={dobMonth} 
                      onChange={setDobMonth} 
                      placeholder="Bulan" 
                    />
                    <CustomSelect 
                      options={years} 
                      value={dobYear} 
                      onChange={setDobYear} 
                      placeholder="Tahun" 
                    />
                  </div>
                </div>

                {/* Error Message if Date Incomplete */}
                {errorMsg && (
                  <div className="text-red-500 text-[11px] font-medium text-center bg-red-50 py-1.5 rounded-lg border border-red-100">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 bg-[#00529B] hover:bg-[#004280] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 text-xs border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} strokeWidth={2.5} />
                      <span>Cari Pasien</span>
                    </>
                  )}
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
          )}
        </AnimatePresence>

        {/* Page Footer */}
        <div className="mt-8 text-center flex flex-col gap-1 opacity-70 relative z-0">
          <p className="text-[10px] text-slate-500">© 2026 RS Edelweiss. All Rights Reserved.</p>
          <p className="text-[10px] text-slate-400">Sistem Pemesanan Menu Gizi Pasien Rawat Inap</p>
        </div>
      </div>

    </div>
  );
}

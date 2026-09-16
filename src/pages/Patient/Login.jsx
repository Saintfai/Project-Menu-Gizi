/**
 * NAMA FILE: Login.jsx
 * FUNGSI UTAMA: Halaman antarmuka interaktif untuk Pasien Rawat Inap.
 * 
 * DETAIL:
 * - Memungkinkan pasien untuk memverifikasi identitas, melihat menu, dan memesan makanan.
 * - Didesain dengan pendekatan yang ramah pengguna dan aksesibel.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ChevronRight,
  Hash,
  User,
  MapPin,
  Building,
  AlertTriangle,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientFooter from '../../components/ui/layout/PatientFooter';


import { usePatient } from '../../context/PatientContext';

export default function PatientLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginPatient, selectPatient } = usePatient();

  
  const [activeTab, setActiveTab] = useState('rm');

  
  const [rmNumber, setRmNumber] = useState(location.state?.identifier || '');

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [multiplePatients, setMultiplePatients] = useState(location.state?.multiplePatients || []);
  const [showMultiple, setShowMultiple] = useState(location.state?.showMultiple || false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return dateString;
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const maskAddress = (address) => {
    if (!address || address.trim() === '' || address === '-') return '-';
    const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const first = parts[0]
        .replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d\/-]+/gi, '')
        .replace(/\b\d+[\w\d\/-]*/g, '')
        .trim();
      const last = parts[parts.length - 1];
      return `${first || parts[0]}, ****, ${last}`;
    } else if (parts.length === 2) {
      let first = parts[0];
      if (/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d\/-]+/i.test(first) || /\d+/.test(first)) {
        first = first.replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d\/-]+/gi, '****');
        first = first.replace(/\b\d+[\w\d\/-]*/g, '****');
      } else {
        const words = first.split(' ');
        if (words.length > 2) {
          first = `${words.slice(0, 2).join(' ')} ****`;
        } else {
          first = `${first} ****`;
        }
      }
      return `${first}, ${parts[1]}`;
    } else {
      let masked = address
        .replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d\/-]+/gi, '****')
        .replace(/\b\d+[\w\d\/-]*/g, '****');
      if (masked === address && address.length > 10) {
        const words = address.split(' ');
        if (words.length >= 3) {
          return `${words[0]} **** ${words[words.length - 1]}`;
        }
        return `${address.slice(0, 4)} **** ${address.slice(-4)}`;
      }
      return masked;
    }
  };

  const maskPhone = (phone) => {
    if (!phone || phone.trim() === '' || phone === '-') return '-';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    const visibleStart = digits.slice(0, 4);
    const visibleEnd = digits.slice(-4);
    const maskedLength = Math.max(digits.length - 8, 0);
    const masked = '*'.repeat(maskedLength || 4);
    return `${visibleStart}${masked}${visibleEnd}`;
  };

  const formatRoomClass = (cls) => {
    if (!cls) return '';
    return cls.replace(/_/g, ' ');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setShowNotFound(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let identifier = '';
    let dobValue = null;

    if (activeTab === 'rm') {
      if (!rmNumber.trim()) {
        setErrorMsg('Masukkan Nomor RM pasien.');
        return;
      }
      identifier = rmNumber.trim();
    } else {
      if (!name.trim()) {
        setErrorMsg('Masukkan nama pasien.');
        return;
      }
      if (!dob) {
        setErrorMsg('Pilih tanggal lahir pasien.');
        return;
      }
      identifier = name.trim();
      dobValue = dob;
    }

    setIsLoading(true);
    setShowNotFound(false);

    try {
      const result = await loginPatient(identifier, dobValue);
      if (result && result.type === 'multiple') {
        setMultiplePatients(result.patients);
        setShowMultiple(true);
      } else {
        navigate('/onboarding');
      }
    } catch {
      setShowNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setShowNotFound(false);
    setShowMultiple(false);
    setMultiplePatients([]);
    setErrorMsg('');
    setRmNumber('');
    setName('');
    setDob('');
  };

  const handleContactNurse = () => {
    toast('Silakan hubungi perawat terdekat untuk bantuan.', { icon: '📞' });
  };

  return (
    <PageTransition>
    <div className={`min-h-screen relative overflow-hidden bg-neutral-50 flex flex-col font-sans text-neutral-800 ${showMultiple ? 'pt-[60px]' : ''}`}>

      {/* Header for Multiple Selection */}
      {showMultiple && (
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-neutral-100">
          <HeaderMobile 
            title={
              <div className="flex flex-col">
                <span>Menu Gizi</span>
                <span className="text-[10px] text-neutral-500 font-normal">Kesehatan Anda, Prioritas Kami</span>
              </div>
            }
          />
        </div>
      )}

      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-secondary-100/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 z-10 relative pb-12">

        <AnimatePresence mode="wait">
          {showMultiple ? (
            /* ==================== MULTIPLE MATCHES STATE ==================== */
              <motion.div
              key="multiple-patients"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[400px] mx-auto flex flex-col relative z-20"
            >
              <div className="flex flex-col items-center text-center mb-7 mt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-900/20 mb-3">
                  <Users size={26} className="text-white" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-extrabold text-neutral-800 tracking-tight mb-1.5">
                  Pilih Data Pasien
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
                  Ditemukan {multiplePatients.length} data yang cocok
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-5">
                {multiplePatients.map((p) => {
                  const hasAllergies = p.allergies && p.allergies.toLowerCase() !== 'tidak ada';
                  const isSelected = selectedPatientId === p.id;
                  
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full rounded-[20px] p-5 cursor-pointer transition-all duration-200 border-l-[4px] ${
                        isSelected 
                          ? 'bg-primary-50/70 border-l-primary-600 border border-primary-200 shadow-md' 
                          : 'bg-white border-l-transparent border border-neutral-100 shadow-sm hover:bg-neutral-50/60 hover:shadow-md'
                      }`}
                    >
                      {/* 2-column grid layout */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {/* No. RM */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <User size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">No. RM</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px]">{p.rmNumber}</p>
                        </div>

                        {/* Nama Pasien */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <User size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Nama</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px]">{p.name}</p>
                        </div>

                        {/* Tanggal Lahir */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Tgl Lahir</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px]">{formatDate(p.dob)}</p>
                        </div>

                        {/* Telepon */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Phone size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Telepon</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px]">{maskPhone(p.phone)}</p>
                        </div>

                        {/* Alamat - full width */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Alamat</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px] truncate" title={maskAddress(p.address)}>{maskAddress(p.address)}</p>
                        </div>

                        {/* Ruangan - full width */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Building size={12} strokeWidth={2} className={isSelected ? 'text-primary-600' : 'text-neutral-400'} />
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Ruangan</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 pl-[18px]">{p.roomName} - {formatRoomClass(p.roomClass)}</p>
                        </div>
                      </div>

                      {/* Allergy Warning */}
                      {hasAllergies && (
                        <div className={`mt-3 rounded-lg p-2.5 flex items-center gap-2 border ${isSelected ? 'bg-danger-50 border-danger-200' : 'bg-danger-50/50 border-danger-100'}`}>
                          <AlertTriangle size={13} className="text-danger-500 flex-shrink-0" strokeWidth={2.5} />
                          <span className="text-[10px] font-bold text-danger-600">Alergi: {p.allergies}</span>
                        </div>
                      )}

                      {/* Info Note */}
                      <div className={`mt-2.5 rounded-lg p-2.5 flex items-center gap-2 ${isSelected ? 'bg-primary-50/80' : 'bg-neutral-50/80'}`}>
                        <Info size={13} className={`flex-shrink-0 ${isSelected ? 'text-primary-600' : 'text-neutral-400'}`} strokeWidth={2.5} />
                        <p className={`text-[10px] font-medium ${isSelected ? 'text-primary-700' : 'text-neutral-500'}`}>
                          Menu disesuaikan dengan kebutuhan gizi pasien
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  disabled={!selectedPatientId}
                  onClick={() => {
                     const p = multiplePatients.find(x => x.id === selectedPatientId);
                     if(p) {
                       selectPatient(p);
                       navigate('/menu');
                     }
                  }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/20 active:scale-[0.98] transition-all border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Pilih Pasien Ini
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full bg-transparent hover:bg-neutral-100 text-neutral-600 py-2.5 rounded-xl font-semibold text-xs transition-all border border-neutral-200 outline-none cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </motion.div>
              >
                Pilih Pasien Ini
              </button>
            </motion.div>

          ) : showNotFound ? (
            
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[320px] mx-auto flex flex-col items-center text-center relative z-20 bg-white rounded-2xl p-5 shadow-2xl border border-white"
            >
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-danger-50 rounded-full flex items-center justify-center">
                  <UserX size={48} className="text-danger-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                  <span className="text-danger-500 text-sm font-bold">✕</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-neutral-800 mb-3">
                Data Pasien Tidak Ditemukan
              </h2>

              <p className="text-xs text-neutral-500 leading-relaxed mb-8 px-2">
                Maaf, data dengan No. RM atau Nama yang Anda masukkan tidak terdaftar di sistem kami. Silakan periksa kembali input Anda atau hubungi perawat.
              </p>

              <button
                onClick={handleRetry}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-900/20 text-sm border-none outline-none cursor-pointer mb-3"
              >
                <RotateCcw size={16} strokeWidth={2} />
                <span>Coba Lagi</span>
              </button>

              <button
                onClick={handleContactNurse}
                className="w-full bg-white hover:bg-neutral-50 text-primary-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-primary-600 text-sm outline-none cursor-pointer"
              >
                <Phone size={16} strokeWidth={2} />
                <span>Hubungi Perawat</span>
              </button>
            </motion.div>

          ) : (
            
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[320px] mx-auto flex flex-col bg-white rounded-2xl p-5 shadow-2xl border border-white relative z-20"
            >
              {}
              <div className="flex flex-col items-center mb-5">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3 text-primary-800 shadow-inner">
                  <IdCard size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-neutral-800 text-center tracking-tight mb-1.5">
                  Masukkan Identitas
                </h2>
                <p className="text-xs text-neutral-500 text-center leading-relaxed">
                  Pilih cara verifikasi sesuai data yang Anda ketahui.
                </p>
              </div>

              {}
              <div className="flex bg-neutral-100 rounded-xl p-1 mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => handleTabChange('rm')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 outline-none border-none cursor-pointer ${
                    activeTab === 'rm'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-600 bg-transparent'
                  }`}
                >
                  <Hash size={12} strokeWidth={2.5} />
                  Nomor RM
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('name')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 outline-none border-none cursor-pointer ${
                    activeTab === 'name'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-600 bg-transparent'
                  }`}
                >
                  <User size={12} strokeWidth={2.5} />
                  Nama &amp; Tgl Lahir
                </button>
              </div>

              {}
              <form onSubmit={handleSearch} className="space-y-3">

                <AnimatePresence mode="wait">
                  {activeTab === 'rm' ? (
                    <motion.div
                      key="tab-rm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 ml-1">
                        Nomor Rekam Medis
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <Hash size={15} strokeWidth={2} />
                        </div>
                        <input
                          type="text"
                          placeholder="Contoh: RM-12345"
                          className="w-full pl-9 pr-3 py-2.5 bg-neutral-100/80 border-none outline-none ring-0 rounded-xl text-sm transition-all placeholder:text-neutral-400"
                          value={rmNumber}
                          onChange={(e) => setRmNumber(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </motion.div>

                  ) : (
                    <motion.div
                      key="tab-name"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      {}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5 ml-1">
                          Nama Pasien
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <UserSearch size={15} strokeWidth={1.5} />
                          </div>
                          <input
                            type="text"
                            placeholder="Contoh: Andi Pratama"
                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-100/80 border-none outline-none ring-0 rounded-xl text-sm transition-all placeholder:text-neutral-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      {}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 ml-1">
                          <Calendar size={13} className="text-neutral-400" />
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2.5 bg-neutral-100/80 border-none outline-none ring-0 rounded-xl text-sm text-neutral-700 transition-all"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-[10px] text-neutral-400 mt-1 ml-1">
                          Jika nama sama, sistem akan meminta konfirmasi.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {}
                {errorMsg && (
                  <div className="text-danger-500 text-xs font-medium text-center bg-danger-50 py-1.5 rounded-lg border border-danger-100">
                    {errorMsg}
                  </div>
                )}

                {}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-900/20 text-xs border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

              {}
              <div className="mt-auto pt-3.5 border-t border-neutral-100 flex items-start gap-2 mt-4">
                <Info size={14} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Data pasien digunakan untuk menyesuaikan menu gizi.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <PatientFooter className="mt-8 relative z-0" />
      </div>

    </div>
    </PageTransition>
  );
}

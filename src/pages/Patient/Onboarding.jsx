/**
 * NAMA FILE: Onboarding.jsx
 * FUNGSI UTAMA: Halaman antarmuka interaktif untuk Pasien Rawat Inap.
 * 
 * DETAIL:
 * - Memungkinkan pasien untuk memverifikasi identitas, melihat menu, dan memesan makanan.
 * - Didesain dengan pendekatan yang ramah pengguna dan aksesibel.
 */
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin,
  Phone,
  Building, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientFooter from '../../components/ui/layout/PatientFooter';
import { usePatient } from '../../context/PatientContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient } = usePatient();

  
  useEffect(() => {
    if (!patient) {
      navigate('/login', { replace: true });
    }
  }, [patient, navigate]);

  if (!patient) return null;

  
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
      // Keep primary area/street and final city/regency, masking detailed middle segments
      const first = parts[0]
        .replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d\/-]+/gi, '')
        .replace(/\b\d+[\w\d\/-]*/g, '')
        .trim();
      const last = parts[parts.length - 1];
      return `${first || parts[0]}, ****, ${last}`;
    } else if (parts.length === 2) {
      // For 2 segments like "Jl. Raya Cibiru No. 123, Bandung"
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
      // Single continuous string
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

  // Mask phone number for privacy (e.g., 081234567890 → 0812****7890)
  const maskPhone = (phone) => {
    if (!phone || phone.trim() === '' || phone === '-') return '-';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    // Show first 4 and last 4 digits, mask the middle
    const visibleStart = digits.slice(0, 4);
    const visibleEnd = digits.slice(-4);
    const maskedLength = Math.max(digits.length - 8, 0);
    const masked = '*'.repeat(maskedLength || 4);
    return `${visibleStart}${masked}${visibleEnd}`;
  };

  // Construct allergy string
  let warningText = '';
  const hasAllergies = patient.allergies && patient.allergies.toLowerCase() !== 'tidak ada';

  if (hasAllergies) {
    warningText = patient.allergies;
  } else {
    warningText = 'Tidak ada catatan riwayat alergi.';
  }

  
  const formatRoomClass = (cls) => {
    if (!cls) return '';
    return cls.replace(/_/g, ' ');
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative bg-neutral-50 flex flex-col font-sans text-neutral-800 pt-[60px]">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-secondary-100/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
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

      <div className="flex flex-col px-6 py-6 z-10 relative pb-8 w-full max-w-[400px] mx-auto">
        
        {/* Title Section */}
        <div className="flex items-start gap-3 mb-6 mt-2">
          <button 
            onClick={() => {
              if (location.state?.showMultiple) {
                navigate('/login', { state: location.state });
              } else {
                navigate('/login');
              }
            }}
            className="mt-0.5 text-neutral-700 hover:text-primary-700 transition-colors border-none outline-none ring-0 bg-transparent p-0 cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 tracking-tight mb-1">
              Data Pasien Ditemukan
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed pr-2">
              Silakan verifikasi data pasien sebelum melanjutkan ke pemilihan menu nutrisi.
            </p>
          </div>
        </div>

        {}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full bg-white rounded-2xl p-5 shadow-xl shadow-neutral-200/50 border border-white mb-8"
        >
          {}
          <div className="space-y-4 mb-6">
            
            {}
            <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <User size={16} strokeWidth={2} />
                <span className="text-xs font-medium">No. RM</span>
              </div>
              <span className="text-xs font-bold text-neutral-800">{patient.rmNumber}</span>
            </div>

            {}
            <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <User size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Nama Pasien</span>
              </div>
              <span className="text-xs font-bold text-neutral-800">{patient.name}</span>
            </div>

            {}
            <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <Calendar size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Tanggal Lahir</span>
              </div>
              <span className="text-xs font-bold text-neutral-800">{formatDate(patient.dob)}</span>
            </div>

            {}
            <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
              <div className="flex items-center gap-2.5 text-neutral-500 flex-shrink-0">
                <MapPin size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Alamat</span>
              </div>
              <span className="text-xs font-bold text-neutral-800 text-right pl-3 truncate max-w-[200px]" title={maskAddress(patient.address)}>
                {maskAddress(patient.address)}
              </span>
            </div>

            {}
            <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <Phone size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Telepon</span>
              </div>
              <span className="text-xs font-bold text-neutral-800">{maskPhone(patient.phone)}</span>
            </div>

            {}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <Building size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Ruangan</span>
              </div>
              <span className="text-xs font-bold text-neutral-800 text-right">{patient.roomName} - {formatRoomClass(patient.roomClass)}</span>
            </div>
            
          </div>

          {}
          {hasAllergies && (
            <div className="bg-danger-50/80 border border-danger-100 rounded-xl p-4 mb-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-danger-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <h3 className="text-xs font-bold text-danger-700 mb-1">Catatan Riwayat Alergi</h3>
                  <p className="text-xs text-danger-600/90 leading-relaxed font-medium">
                    {warningText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="bg-primary-50/80 border border-primary-100 rounded-xl p-3 flex items-start gap-2.5">
            <Info size={16} className="text-primary-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-xs text-primary-700/90 font-medium leading-relaxed">
              Menu disesuaikan dengan kebutuhan gizi pasien
            </p>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-full"
        >
          <button
            onClick={() => navigate('/menu')}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/20 border-none outline-none transition-transform duration-150 active:scale-[0.96] active:bg-primary-700 sm:hover:bg-primary-700 cursor-pointer"
          >
            Lanjut ke Pilih Menu
          </button>
        </motion.div>
        
        {}
        <PatientFooter />

      </div>
    </div>
    </PageTransition>
  );
}

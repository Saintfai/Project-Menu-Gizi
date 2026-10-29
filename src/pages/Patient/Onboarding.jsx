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
  Info,
  Layers
} from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientFooter from '../../components/ui/layout/PatientFooter';
import { usePatient } from '../../context/PatientContext';
import { formatDate, maskAddress, maskPhone, formatRoomClass } from '../../utils/formatters';
import { hasRealAllergy } from '../../utils/orderTransformer';

// Halaman verifikasi data identitas pasien sebelum memilih menu
export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, logoutPatient } = usePatient();

  // Kembali ke login jika belum ada data pasien di context
  useEffect(() => {
    if (!patient) {
      navigate('/login', { replace: true });
    }
  }, [patient, navigate]);

  if (!patient) return null;

  // Cek riwayat alergi makanan untuk menampilkan peringatan visual jika ada
  const hasAllergies = hasRealAllergy(patient.allergies);
  const warningText = hasAllergies ? patient.allergies : 'Tidak ada catatan riwayat alergi.';

  return (
    <PageTransition>
      <div className="min-h-screen relative bg-transparent flex flex-col font-sans text-neutral-800 pt-[60px]">
        {/* Header tetap di bagian atas */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-xs border-b border-neutral-100">
          <HeaderMobile 
            title={
              <div className="flex flex-col gap-1">
                <span className="font-bold text-neutral-900 leading-tight">Menu Gizi</span>
                <span className="text-[11px] text-neutral-500 font-normal leading-tight">Kesehatan Anda, Prioritas Kami</span>
              </div>
            }
          />
        </div>

        {/* Kontainer isi halaman verifikasi */}
        <div className="flex flex-col px-4 sm:px-6 py-6 z-10 relative pb-8 w-full max-w-[400px] mx-auto">
          
          {/* Judul dan navigasi kembali */}
          <div className="flex items-start gap-2 mb-6 mt-1">
            {/* Kembali ke login */}
            <button 
              type="button"
              onClick={() => {
                logoutPatient();
                if (location.state?.showMultiple) {
                   navigate('/login', { state: location.state });
                } else {
                  navigate('/login');
                }
              }}
              className="text-neutral-700 hover:text-primary-700 p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors border-none outline-none ring-0 bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0"
              aria-label="Kembali ke halaman pencarian pasien"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-neutral-900 tracking-tight mb-1">
                Data Pasien Ditemukan
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed pr-2">
                Silakan verifikasi data pasien sebelum melanjutkan ke pemilihan menu nutrisi.
              </p>
            </div>
          </div>

          {/* Kartu rincian data pasien */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100 mb-7"
          >
            <div className="space-y-4 mb-6">
              
              {/* No. RM */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <User size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">No. RM</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">{patient.rmNumber}</span>
              </div>

              {/* No. Registrasi */}
              {patient.noReg && (
                <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                  <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                    <User size={16} strokeWidth={2} />
                    <span className="text-xs font-semibold">No. Registrasi</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">{patient.noReg}</span>
                </div>
              )}

              {/* Nama Pasien */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <User size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Nama Pasien</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words leading-relaxed flex-1">
                  {patient.name}
                </span>
              </div>

              {/* Tanggal Lahir */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <Calendar size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Tanggal Lahir</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">{formatDate(patient.dob)}</span>
              </div>

              {/* Alamat */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <MapPin size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Alamat</span>
                </div>
                <span 
                  className="text-xs font-bold text-neutral-900 text-left break-words flex-1" 
                  title={maskAddress(patient.address)}
                >
                  {maskAddress(patient.address)}
                </span>
              </div>

              {/* Telepon */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <Phone size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Telepon</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">{maskPhone(patient.phone)}</span>
              </div>

              {/* Kamar */}
              <div className="flex items-center border-b border-neutral-100 pb-3 gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <Building size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Kamar</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">
                  {patient.roomName}
                </span>
              </div>

              {/* Kelas */}
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5 text-neutral-500 w-[120px] sm:w-[130px] shrink-0 whitespace-nowrap">
                  <Layers size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Kelas</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-left break-words flex-1">
                  {formatRoomClass(patient.originalClass || patient.roomClass)}
                  {patient.titipan && (
                    <span className="block text-[11px] font-semibold text-primary-600 mt-0.5">
                      (Titipan di {patient.titipan})
                    </span>
                  )}
                </span>
              </div>
              
            </div>

            {/* Catatan Alergi */}
            {hasAllergies && (
              <div className="bg-danger-50/80 border border-danger-200/80 rounded-xl p-3.5 mb-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-danger-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <h3 className="text-xs font-bold text-danger-700 mb-0.5">Catatan Riwayat Alergi</h3>
                    <p className="text-xs text-danger-600 leading-relaxed font-medium">
                      {warningText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Kebutuhan Gizi */}
            <div className="bg-primary-50/80 border border-primary-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
              <Info size={16} className="text-primary-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-xs text-primary-800 font-medium leading-relaxed">
                Menu disesuaikan dengan kebutuhan gizi pasien
              </p>
            </div>
          </motion.div>

          {/* Lanjut ke portal pemilihan menu */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="w-full"
          >
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white h-12 rounded-xl font-bold text-sm shadow-md shadow-primary-900/15 border-none outline-none transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              Lanjut ke Pilih Menu
            </button>
          </motion.div>
          
          {/* Footer informasi pasien */}
          <PatientFooter />

        </div>
      </div>
    </PageTransition>
  );
}

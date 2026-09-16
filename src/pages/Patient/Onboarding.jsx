/**
 * NAMA FILE: Onboarding.jsx
 * FUNGSI UTAMA: Halaman konfirmasi dan verifikasi identitas pasien sebelum masuk ke menu gizi.
 * 
 * DETAIL:
 * - Menampilkan data pasien yang ditarik dari sistem RS (Nama, RM, Kamar, Alamat, Alergi).
 * - Menjaga privasi data melalui masking terpusat dari formatters.
 * - Desain responsif mobile dengan tombol dan navigasi sentuh optimal (touch target >= 44px).
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
import { formatDate, maskAddress, maskPhone, formatRoomClass } from '../../utils/formatters';

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

  const hasAllergies = Boolean(patient.allergies && patient.allergies.toLowerCase() !== 'tidak ada');
  const warningText = hasAllergies ? patient.allergies : 'Tidak ada catatan riwayat alergi.';

  return (
    <PageTransition>
      <div className="min-h-screen relative bg-neutral-50 flex flex-col font-sans text-neutral-800 pt-[60px]">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-xs border-b border-neutral-100">
          <HeaderMobile 
            title={
              <div className="flex flex-col">
                <span className="font-bold text-neutral-900">Menu Gizi</span>
                <span className="text-xs text-neutral-500 font-normal">Kesehatan Anda, Prioritas Kami</span>
              </div>
            }
          />
        </div>

        {/* Content Container */}
        <div className="flex flex-col px-4 sm:px-6 py-6 z-10 relative pb-8 w-full max-w-[400px] mx-auto">
          
          {/* Title & Back Navigation */}
          <div className="flex items-start gap-2 mb-6 mt-1">
            <button 
              type="button"
              onClick={() => {
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

          {/* Patient Card */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100 mb-7"
          >
            <div className="space-y-4 mb-6">
              
              {/* No. RM */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <User size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">No. RM</span>
                </div>
                <span className="text-xs font-bold text-neutral-900">{patient.rmNumber}</span>
              </div>

              {/* Nama Pasien */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <User size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Nama Pasien</span>
                </div>
                <span className="text-xs font-bold text-neutral-900">{patient.name}</span>
              </div>

              {/* Tanggal Lahir */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <Calendar size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Tanggal Lahir</span>
                </div>
                <span className="text-xs font-bold text-neutral-900">{formatDate(patient.dob)}</span>
              </div>

              {/* Alamat */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5 text-neutral-500 flex-shrink-0">
                  <MapPin size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Alamat</span>
                </div>
                <span 
                  className="text-xs font-bold text-neutral-900 text-right pl-3 truncate max-w-[200px]" 
                  title={maskAddress(patient.address)}
                >
                  {maskAddress(patient.address)}
                </span>
              </div>

              {/* Telepon */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <Phone size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Telepon</span>
                </div>
                <span className="text-xs font-bold text-neutral-900">{maskPhone(patient.phone)}</span>
              </div>

              {/* Ruangan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-neutral-500">
                  <Building size={16} strokeWidth={2} />
                  <span className="text-xs font-semibold">Ruangan</span>
                </div>
                <span className="text-xs font-bold text-neutral-900 text-right">
                  {patient.roomName} - {formatRoomClass(patient.roomClass)}
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

          {/* CTA Button */}
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
          
          {/* Footer */}
          <PatientFooter />

        </div>
      </div>
    </PageTransition>
  );
}

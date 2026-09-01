import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Building, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { patient } = usePatient();

  // If no patient is logged in, redirect to login
  useEffect(() => {
    if (!patient) {
      navigate('/login', { replace: true });
    }
  }, [patient, navigate]);

  if (!patient) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Handle YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return dateString;
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // Construct allergy/condition string
  let warningText = '';
  const hasAllergies = patient.allergies && patient.allergies.toLowerCase() !== 'tidak ada';
  const hasConditions = patient.medicalConditions && patient.medicalConditions.toLowerCase() !== 'tidak ada';

  if (hasAllergies || hasConditions) {
    const parts = [];
    if (hasAllergies) parts.push(patient.allergies);
    if (hasConditions) parts.push(patient.medicalConditions);
    warningText = parts.join('. ');
  } else {
    warningText = 'Tidak ada catatan alergi atau pantangan medis.';
  }

  // Format Room Class mapping
  const formatRoomClass = (cls) => {
    if (!cls) return '';
    return cls.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-gray-800 pt-[60px]">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
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

      <div className="flex-1 flex flex-col px-6 py-6 z-10 relative pb-8 w-full max-w-[400px] mx-auto">
        
        {/* Title Section */}
        <div className="flex items-start gap-3 mb-6 mt-2">
          <button 
            onClick={() => navigate('/login')}
            className="mt-0.5 text-slate-700 hover:text-blue-700 transition-colors border-none outline-none ring-0 bg-transparent p-0"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight mb-1">
              Data Pasien Ditemukan
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed pr-2">
              Silakan verifikasi data pasien sebelum melanjutkan ke pemilihan menu nutrisi.
            </p>
          </div>
        </div>

        {/* Data Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full bg-white/90 backdrop-blur-xl rounded-[20px] p-5 shadow-xl shadow-slate-200/50 border border-white mb-8"
        >
          {/* Patient Details */}
          <div className="space-y-4 mb-6">
            
            {/* Row: RM */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2.5 text-slate-500">
                <User size={16} strokeWidth={2} />
                <span className="text-xs font-medium">No. RM</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{patient.rmNumber}</span>
            </div>

            {/* Row: Nama */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2.5 text-slate-500">
                <User size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Nama Pasien</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{patient.name}</span>
            </div>

            {/* Row: DOB */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2.5 text-slate-500">
                <Calendar size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Tanggal Lahir</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{formatDate(patient.dob)}</span>
            </div>

            {/* Row: Ruangan */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-500">
                <Building size={16} strokeWidth={2} />
                <span className="text-xs font-medium">Ruangan</span>
              </div>
              <span className="text-xs font-bold text-slate-800 text-right">{patient.roomName} - {formatRoomClass(patient.roomClass)}</span>
            </div>
            
          </div>

          {/* Alert: Alergi & Pantangan */}
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <h3 className="text-xs font-bold text-red-700 mb-1">Catatan Alergi & Pantangan</h3>
                <p className="text-[11px] text-red-600/90 leading-relaxed font-medium">
                  {warningText}
                </p>
              </div>
            </div>
          </div>

          {/* Alert: Info */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-[11px] text-blue-700/90 font-medium leading-relaxed">
              Menu disesuaikan dengan kebutuhan gizi pasien
            </p>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          onClick={() => navigate('/menu')}
          className="w-full bg-[#00529B] hover:bg-[#004280] text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 border-none outline-none mt-auto"
        >
          Lanjut ke Pilih Menu
        </motion.button>
        
        {/* Page Footer */}
        <div className="mt-8 pt-4 text-center flex flex-col gap-1 opacity-70">
          <p className="text-[10px] text-slate-500">© 2026 RS Edelweiss. All Rights Reserved.</p>
          <p className="text-[10px] text-slate-400">Sistem Pemesanan Menu Gizi Pasien Rawat Inap</p>
        </div>

      </div>
    </div>
  );
}

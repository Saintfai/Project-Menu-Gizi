import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, logoutPatient } = usePatient();
  
  const { summary } = location.state || {};

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-neutral-700 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-neutral-500 mb-6">Data pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-[#004e8c] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#003d6f] transition-colors"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-neutral-900 pt-[60px] pb-8">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[300px] h-[300px] bg-blue-100/50 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-100/50 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400 -mt-0.5">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
          onLogout={() => {
            logoutPatient();
            navigate('/login');
          }}
        />
      </div>

      <div className="w-full max-w-sm mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30">
          <Check size={36} strokeWidth={3} className="text-white" />
        </div>
        
        <h2 className="text-[22px] font-bold text-[#004e8c] mb-2">Terima Kasih!</h2>
        <p className="text-[14px] text-slate-600 text-center mb-8 max-w-[280px] leading-relaxed">
          Pesanan Anda telah berhasil dikonfirmasi dan sedang diproses.
        </p>

        {/* Receipt Card */}
        <div className="w-full bg-white rounded-2xl border border-neutral-200 p-5 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] text-slate-600">Nomor Rekam Medis</span>
            <span className="text-base font-bold text-[#004e8c]">{patient?.rmNumber}</span>
          </div>
          
          <hr className="border-t border-neutral-100 my-4" />
          
          <div className="flex justify-between items-center mb-5">
            <span className="text-[13px] text-slate-600">Kamar</span>
            <span className="text-sm font-bold text-[#1a202c]">{patient?.roomName}</span>
          </div>

          <div className="bg-[#eef4f9] rounded-xl p-4">
            <h4 className="text-[13px] font-bold text-[#1a202c] mb-3">Detail Pesanan:</h4>
            <div className="space-y-2">
              {summary.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[13px]">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="text-slate-600 font-semibold">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="w-full bg-[#004e8c] text-white font-semibold py-3.5 rounded-xl hover:bg-[#003d6f] active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

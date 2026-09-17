import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientFooter from '../../components/ui/layout/PatientFooter';
import { usePatient } from '../../context/PatientContext';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, logoutPatient } = usePatient();
  
  const { summary } = location.state || {};

  if (!summary) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-neutral-700 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-neutral-500 mb-6">Data pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition-colors cursor-pointer border-none outline-none"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-neutral-50 flex flex-col font-sans text-neutral-900 pt-[60px] pb-8">
      <div className="fixed top-0 left-0 w-[300px] h-[300px] bg-primary-100/50 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-secondary-100/50 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-neutral-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400 -mt-0.5">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
        />
      </div>

      <div className="w-full max-w-sm mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-success-500/30">
          <Check size={36} strokeWidth={3} className="text-white" />
        </div>
        
        <h2 className="text-xl font-bold text-primary-700 mb-2">Terima Kasih!</h2>
        <p className="text-sm text-neutral-600 text-center mb-8 max-w-[280px] leading-relaxed">
          Pesanan Anda telah berhasil dikonfirmasi dan sedang diproses.
        </p>

        <div className="w-full bg-white rounded-2xl border border-neutral-200 p-5 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-neutral-600">Nomor Rekam Medis</span>
            <span className="text-base font-bold text-primary-700">{patient?.rmNumber}</span>
          </div>
          
          <hr className="border-t border-neutral-100 my-4" />
          
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm text-neutral-600">Kamar</span>
            <span className="text-sm font-bold text-neutral-900">{patient?.roomName}</span>
          </div>

          <div className="bg-primary-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-neutral-900 mb-3">Detail Pesanan:</h4>
            <div className="space-y-2">
              {summary.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{item.name}</span>
                  <span className="text-neutral-600 font-semibold">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
        >
          Kembali ke Beranda
        </button>

        <PatientFooter className="mt-6" />
      </div>
    </div>
  );
}

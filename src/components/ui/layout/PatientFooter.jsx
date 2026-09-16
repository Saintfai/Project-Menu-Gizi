/**
 * NAMA FILE: PatientFooter.jsx
 * FUNGSI UTAMA: Komponen UI Footer untuk halaman pasien.
 * 
 * DETAIL:
 * - Menampilkan copyright dan info sistem secara konsisten di semua halaman pasien.
 */
import React from 'react';

export const PatientFooter = ({ className = '' }) => {
  return (
    <div className={`mt-5 pt-4 text-center flex flex-col gap-1 opacity-70 ${className}`}>
      <p className="text-[10px] text-neutral-500">© 2026 RS Edelweiss. All Rights Reserved.</p>
      <p className="text-[10px] text-neutral-400">Sistem Pemesanan Menu Gizi Pasien Rawat Inap</p>
    </div>
  );
};

export default PatientFooter;

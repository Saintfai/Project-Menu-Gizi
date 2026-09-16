/**
 * NAMA FILE: PatientFooter.jsx
 * FUNGSI UTAMA: Komponen UI Footer untuk halaman pasien.
 * 
 * DETAIL:
 * - Menampilkan copyright dan info sistem secara konsisten di semua halaman pasien.
 * - Memenuhi standar aksesibilitas WCAG AA (kontras jelas, ukuran teks minimum text-xs / 12px).
 */
import React from 'react';
import PropTypes from 'prop-types';

export const PatientFooter = ({ className = '' }) => {
  return (
    <footer className={`mt-6 pt-4 text-center flex flex-col gap-1 select-none ${className}`}>
      <p className="text-xs font-medium text-neutral-600">
        © 2026 RS Edelweiss. All Rights Reserved.
      </p>
      <p className="text-xs text-neutral-500">
        Sistem Pemesanan Menu Gizi Pasien Rawat Inap
      </p>
    </footer>
  );
};

PatientFooter.propTypes = {
  className: PropTypes.string,
};

export default PatientFooter;

/**
 * NAMA FILE: AdminNavbar.jsx
 * FUNGSI UTAMA: Komponen Header & Navigasi untuk Portal Admin Dapur Gizi.
 * 
 * DETAIL:
 * - Menampilkan logo institusi dan navigasi tab (Dashboard, Siklus, Statistik).
 * - Menampilkan waktu dan tanggal realtime WIB.
 * - Klik pada logo Menu Gizi berfungsi untuk logout kembali ke halaman login admin.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import logoEdhos from '../../../assets/logoedhos.png';
import { useAuth } from '../../../context/AuthContext';

export const AdminNavbar = ({ title = 'Menu Gizi', className = '' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogoClick = () => {
    logout();
    navigate('/menu/admin/login', { replace: true });
  };

  const formattedDate = currentDateTime
    .toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  const formattedTime = `${String(currentDateTime.getHours()).padStart(2, '0')}:${String(
    currentDateTime.getMinutes()
  ).padStart(2, '0')} WIB`;

  return (
    <header
      className={`no-print print:hidden relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-neutral-200/80 shadow-xs z-30 ${className}`}
    >
      {/* Logo & Title (Klik untuk logout) */}
      <div className="flex-1 flex items-center justify-start min-w-0">
        <div
          onClick={handleLogoClick}
          className="flex items-center cursor-pointer select-none group"
          title="Klik untuk logout"
        >
          <div className="flex-shrink-0 flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
            <img src={logoEdhos} alt="Logo Menu Gizi" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-primary-700 underline underline-offset-4 decoration-primary-700 leading-none truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Navigasi Menu Admin */}
      <nav
        className="flex items-center justify-center gap-6 sm:gap-8 mx-2"
        aria-label="Menu Admin"
      >
        <NavLink
          to="/menu/admin/dashboard"
          className={({ isActive }) =>
            `text-sm sm:text-base transition-colors duration-150 py-1 ${
              isActive
                ? 'font-bold text-primary-700 border-b-2 border-primary-700'
                : 'font-medium text-neutral-600 hover:text-neutral-900'
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/menu/admin/siklus"
          className={({ isActive }) =>
            `text-sm sm:text-base transition-colors duration-150 py-1 ${
              isActive
                ? 'font-bold text-primary-700 border-b-2 border-primary-700'
                : 'font-medium text-neutral-600 hover:text-neutral-900'
            }`
          }
        >
          Siklus
        </NavLink>

        <NavLink
          to="/menu/admin/statistik"
          className={({ isActive }) =>
            `text-sm sm:text-base transition-colors duration-150 py-1 ${
              isActive
                ? 'font-bold text-primary-700 border-b-2 border-primary-700'
                : 'font-medium text-neutral-600 hover:text-neutral-900'
            }`
          }
        >
          Statistik
        </NavLink>
      </nav>

      {/* Tanggal & Waktu Realtime */}
      <div className="flex-1 flex items-center justify-end">
        <div className="text-right">
          <div className="text-xs font-semibold text-neutral-600 tracking-tight">
            {formattedDate}
          </div>
          <div className="text-xs sm:text-sm font-bold text-primary-700 leading-tight">
            {formattedTime}
          </div>
        </div>
      </div>
    </header>
  );
};

AdminNavbar.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
};

export default AdminNavbar;

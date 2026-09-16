/**
 * NAMA FILE: AdminNavbar.jsx
 * FUNGSI UTAMA: Komponen Header & Navigasi untuk Portal Admin Dapur Gizi.
 * 
 * DETAIL:
 * - Menampilkan logo institusi dan navigasi tab (Dashboard, Siklus, Statistik).
 * - Menampilkan waktu dan tanggal realtime WIB.
 * - Menyediakan tombol Logout aman dengan modal konfirmasi.
 * - Responsif terhadap layar mobile hingga desktop.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, AlertCircle } from 'lucide-react';
import logoEdhos from '../../../assets/logoedhos.png';
import { useAuth } from '../../../context/AuthContext';

export const AdminNavbar = ({ title = 'Menu Gizi', className = '' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogoClick = () => {
    navigate('/menu/admin/dashboard');
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
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
    <>
      <header
        className={`no-print print:hidden relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-neutral-200/80 shadow-xs z-30 ${className}`}
      >
        {/* Logo & Title */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <div
            onClick={handleLogoClick}
            className="flex items-center cursor-pointer select-none group"
            title="Ke Dashboard"
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
          className="flex items-center justify-center gap-4 sm:gap-8 mx-2"
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

        {/* Tanggal, Waktu Realtime & Tombol Logout */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          <div className="hidden sm:block text-right pr-3.5 border-r border-neutral-200">
            <div className="text-xs font-semibold text-neutral-600 tracking-tight">
              {formattedDate}
            </div>
            <div className="text-xs sm:text-sm font-bold text-primary-700 leading-tight">
              {formattedTime}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-danger-600 hover:text-danger-700 hover:bg-danger-50 active:bg-danger-100 rounded-lg border border-danger-200/80 transition-all cursor-pointer outline-none"
            title="Keluar dari sesi admin"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-neutral-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi Admin Gizi dan keluar ke halaman login?
            </p>
            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-danger-600 hover:bg-danger-700 active:bg-danger-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AdminNavbar.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
};

export default AdminNavbar;

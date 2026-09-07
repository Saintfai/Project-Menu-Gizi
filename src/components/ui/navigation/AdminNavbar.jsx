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
    navigate('/admin/login', { replace: true });
  };

  // Format Date: e.g. "JUMAT, 31 JULI 2026"
  const formattedDate = currentDateTime
    .toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  // Format Time: e.g. "10:15 WIB"
  const formattedTime = `${String(currentDateTime.getHours()).padStart(2, '0')}:${String(
    currentDateTime.getMinutes()
  ).padStart(2, '0')} WIB`;

  return (
    <header
      className={`relative flex items-center justify-between px-4 sm:px-8 py-3 bg-neutral-0 border-b border-neutral-100 shadow-sm ${className}`}
    >
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center">
        <div
          onClick={handleLogoClick}
          className="flex items-center cursor-pointer select-none group"
          title="Klik untuk logout"
        >
          <div className="flex-shrink-0 flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
            <img src={logoEdhos} alt="Logo Menu Gizi" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-primary-700 underline underline-offset-4 decoration-primary-700 leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <nav
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 sm:gap-8"
        aria-label="Menu Admin"
      >
        <NavLink
          to="/admin/dashboard"
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
          to="/admin/siklus"
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
      </nav>

      {/* Right: Realtime Date & Time Info */}
      <div className="flex items-center">
        <div className="text-right pr-4 border-r border-neutral-300">
          <div className="text-[11px] sm:text-xs font-semibold text-neutral-700 tracking-tight">
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

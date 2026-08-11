import React from 'react';
import PropTypes from 'prop-types';
import Button from '../buttons/Button';
import { Input } from '../forms/Input';

export const OnboardingCard = ({ className = '', onSearchClick }) => {
  return (
    <div className={`relative overflow-hidden bg-neutral-0/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-neutral-100 p-6 sm:p-8 max-w-sm w-full mx-auto ${className}`}>
      
      {/* Decorative top glow simulating glassmorphism light source */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-info-100 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Top Icon Badge */}
        <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM18 18H6V16.5C6 14.5 10 13.5 12 13.5C14 13.5 18 14.5 18 16.5V18Z" />
          </svg>
        </div>

        {/* Titles */}
        <h2 className="text-xl font-bold text-neutral-900 mb-2 text-center">Masukkan Identitas<br/>Anda</h2>
        <p className="text-sm text-neutral-500 text-center mb-6 leading-relaxed">
          Silakan masukkan data pasien untuk mengakses menu gizi yang disesuaikan.
        </p>

        {/* Form Fields */}
        <div className="w-full space-y-4 mb-6">
          <Input 
            label="No RM / Nama Pasien" 
            placeholder="Contoh: RM123456 / John Doe" 
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <Input 
            label="Tanggal Lahir" 
            placeholder="mm/dd/yyyy" 
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Action Button */}
        <Button variant="primary" fullWidth onClick={onSearchClick} className="mb-6 flex justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Cari Pasien
        </Button>

        {/* Footer Text */}
        <div className="flex items-start text-neutral-400 text-xs border-t border-neutral-100 pt-4 w-full justify-center text-center">
          <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="max-w-[200px]">Data pasien digunakan untuk menyesuaikan menu gizi.</span>
        </div>

      </div>
    </div>
  );
};

OnboardingCard.propTypes = {
  className: PropTypes.string,
  onSearchClick: PropTypes.func,
};

export default OnboardingCard;

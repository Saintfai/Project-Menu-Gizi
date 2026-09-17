import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * PatientLayout
 * Layout dasar untuk antarmuka alur pasien (Onboarding, MenuPortal, Cart, OrderSuccess).
 * Mengatur latar belakang ambient terpusat dan container halaman adaptif mobile.
 */
export default function PatientLayout() {
  return (
    <div className="min-h-screen relative bg-neutral-50 flex flex-col font-sans text-neutral-800 antialiased selection:bg-primary-100 selection:text-primary-800">
      {/* Centralized Ambient Background Accents */}
      <div 
        aria-hidden="true"
        className="fixed top-0 right-0 w-[320px] h-[320px] bg-primary-100/70 rounded-full filter blur-[80px] opacity-75 transform translate-x-1/4 -translate-y-1/4 pointer-events-none z-0" 
      />
      <div 
        aria-hidden="true"
        className="fixed bottom-0 left-0 w-[320px] h-[320px] bg-secondary-100/70 rounded-full filter blur-[80px] opacity-75 transform -translate-x-1/4 translate-y-1/4 pointer-events-none z-0" 
      />

      {/* Main Page Content */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        <Outlet />
      </div>
    </div>
  );
}

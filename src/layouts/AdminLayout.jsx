/**
 * NAMA FILE: AdminLayout.jsx
 * FUNGSI UTAMA: Komponen Layout Utama yang membungkus kumpulan rute/halaman terkait.
 * 
 * DETAIL:
 * - Menyediakan struktur umum (seperti navigasi dan footer) untuk halaman-halaman yang bernaung di bawahnya.
 * - Menggunakan <Outlet /> untuk merender komponen halaman spesifik.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/ui/navigation/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col font-sans text-neutral-800">
      {}
      <AdminNavbar />

      {}
      <main className="flex-1 w-full px-4 sm:px-8 py-6 print:p-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}


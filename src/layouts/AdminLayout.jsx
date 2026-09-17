import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/ui/navigation/AdminNavbar';

/**
 * AdminLayout
 * Layout pembungkus modul Admin Dapur Gizi.
 * Menyediakan navigasi atas tetap (AdminNavbar) dan area konten dinamis via Outlet.
 */
export default function AdminLayout() {
  return (
    <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col font-sans text-neutral-800">
      <AdminNavbar />

      <main className="flex-1 w-full px-4 sm:px-8 py-6 print:p-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}


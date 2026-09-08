import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/ui/navigation/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-neutral-800">
      {/* Admin Top Navigation Bar with Edelweiss Logo Logout and Cycle Info */}
      <AdminNavbar />

      {/* Main Page Area - Full Width & Responsive */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}


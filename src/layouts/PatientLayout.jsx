/**
 * NAMA FILE: PatientLayout.jsx
 * FUNGSI UTAMA: Komponen Layout Utama yang membungkus kumpulan rute/halaman terkait.
 * 
 * DETAIL:
 * - Menyediakan struktur umum (seperti navigasi dan footer) untuk halaman-halaman yang bernaung di bawahnya.
 * - Menggunakan <Outlet /> untuk merender komponen halaman spesifik.
 */
import { Outlet } from 'react-router-dom';

export default function PatientLayout() {
  return (
    <div>
      {}
      <Outlet />
    </div>
  );
}

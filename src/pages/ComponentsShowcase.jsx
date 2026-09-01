import React, { useState } from 'react';
import Button from '../components/ui/buttons/Button';
import Alert from '../components/ui/feedback/Alert';
import SearchBar from '../components/ui/forms/SearchBar';
import PatientIdentityCard from '../components/ui/cards/PatientIdentityCard';
import StickyFooter from '../components/ui/layout/StickyFooter';
import HeaderMobile from '../components/ui/layout/HeaderMobile';
import OnboardingCard from '../components/ui/cards/OnboardingCard';
import OrderSummaryBar from '../components/ui/layout/OrderSummaryBar';
import Accordion from '../components/ui/data-display/Accordion';
import MenuCard from '../components/ui/cards/MenuCard';
import Stepper from '../components/ui/navigation/Stepper';
import RekapCard from '../components/ui/cards/RekapCard';
import OrdersTable from '../components/ui/tables/OrdersTable';
import Tabs from '../components/ui/navigation/Tabs';
import DateTimeDisplay from '../components/ui/data-display/DateTimeDisplay';
import NoteDetailModal from '../components/ui/modals/NoteDetailModal';
import NoteDetailContent from '../components/ui/modals/NoteDetailContent';
import ConfirmDeliveryContent from '../components/ui/modals/ConfirmDeliveryContent';
import EditPackageContent from '../components/ui/modals/EditPackageContent';
import DeletePackageContent from '../components/ui/modals/DeletePackageContent';

const mockOrdersData = [
  {
    id: 1,
    pasienRM: 'RM-1234567',
    hasAllergy: true,
    allergyNote: 'Alergi Seafood (Udang, Cumi)',
    kamar: '102 - VIP A',
    makanPagi: ['Paket A', 'Paket B'],
    menuPagiText: 'Nasi Tim Ayam & Jus Jeruk',
    notePagi: 'Tanpa pedas, nasi lembek.',
    makanSiang: ['Paket B'],
    menuSiangText: 'Bubur Ayam & Buah Segar',
    noteSiang: 'Buah potong kecil-kecil.',
    makanMalam: ['Paket B 2x'],
    menuMalamText: 'Sup Ayam & Sayur',
    noteMalam: 'Kuah dipisah.',
    menuTambahan: 'Buah Potong',
    menuTambahanText: 'Buah Potong',
    noteTambahan: '-',
    statusTambahan: 'Sudah Dikirim',
    tanggalWaktuPesanan: '30-07-2026 | 10:10',
    tanggalWaktuPengantaran: '31-07-2026',
    hasCatatan: true
  },
  {
    id: 2,
    pasienRM: 'RM-1234567',
    hasAllergy: false,
    kamar: '112- VIP B',
    makanPagi: ['Paket B 2x'],
    makanSiang: ['Paket A'],
    makanMalam: ['Paket A 2x'],
    menuTambahan: '-',
    tanggalWaktuPesanan: '',
    tanggalWaktuPengantaran: '31-07-2026',
    hasCatatan: false
  },
  {
    id: 3,
    pasienRM: 'Siti Aminah',
    hasAllergy: true,
    allergyNote: 'Diabetes (Rendah Gula)',
    kamar: '95- VIP A',
    makanPagi: ['Paket C'],
    menuPagiText: 'Bubur Oat',
    notePagi: 'Tanpa gula.',
    makanSiang: ['Paket A'],
    menuSiangText: 'Nasi Tim & Ikan Bakar',
    noteSiang: 'Porsi kecil.',
    makanMalam: ['Paket B 2x'],
    menuMalamText: 'Sup Sayur Bening',
    noteMalam: '-',
    menuTambahan: 'Jus Alpukat',
    menuTambahanText: 'Jus Alpukat',
    noteTambahan: 'Tanpa susu dan gula',
    statusTambahan: '-',
    tanggalWaktuPesanan: '30-07-2026 | 10:10',
    tanggalWaktuPengantaran: '31-07-2026',
    hasCatatan: true
  }
];

const ComponentsShowcase = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 bg-neutral-50 min-h-screen">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-bold text-neutral-900">UI Components Showcase</h1>
        <p className="text-neutral-500 mt-2">Pratinjau semua komponen UI Hospital Dietary System</p>
      </div>

      {/* Specific Domain Components (Figma Layouts) */}
      <section className="space-y-8 pt-8 border-t border-neutral-200 pb-24">
        <h2 className="text-2xl font-bold text-neutral-900">Spesifik Figma Layouts</h2>
        
        {/* Header Mobile */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Header Mobile</h3>
          <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100 max-w-sm">
            <HeaderMobile />
          </div>
        </div>

        {/* Patient Identity Card */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Patient Identity Card</h3>
          <div className="max-w-md">
            <PatientIdentityCard 
              name="Budi Santoso"
              rmNumber="1223"
              room="402"
              isVip={true}
            />
          </div>
        </div>

        {/* Onboarding Glassmorphism Card */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Glassmorphism Container / Main Card</h3>
          <div className="p-8 bg-neutral-100 rounded-lg">
            <OnboardingCard />
          </div>
        </div>

        {/* Alerts / Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Notification & Notice Box</h3>
          <Alert 
            variant="danger" 
            title="Catatan Alergi & Pantangan"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          >
            Alergi Seafood (Udang, Cumi), Intoleransia Laktosa. Diet Rendah Garam.
          </Alert>

          <Alert 
            variant="info" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            Biaya ekstra akan ditambahkan ke Tagihan Kamar / Billing RS saat Anda melakukan <em>Check-out</em>.
          </Alert>

          <Alert 
            variant="danger" 
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          >
            Batas order menu utama pukul 15.00 WIB untuk penyajian esok hari.
          </Alert>
        </div>

        {/* Order Summary Placeholder */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Order Summary Placeholder</h3>
          <div className="max-w-md">
            <OrderSummaryBar itemCount={4} />
          </div>
        </div>

        {/* Meal Time Accordions & Menu Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Collapsible Sections & Menu Cards</h3>
          
          <div className="max-w-md space-y-4">
            <Accordion 
              title="Makan Pagi" 
              defaultExpanded={true}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            >
              <div className="grid grid-cols-2 gap-3 mt-2">
                <MenuCard 
                  type="paket"
                  subtitle="Paket A"
                  title="Bubur Ayam & Buah Segar"
                  quantity={2}
                  maxQuantity={2}
                  image="https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400&auto=format&fit=crop"
                />
                <MenuCard 
                  type="paket"
                  subtitle="Paket B"
                  title="Omelet Sayur & Jus Jeruk"
                  quantity={0}
                  maxQuantity={2}
                  image="https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400&auto=format&fit=crop"
                />
              </div>
            </Accordion>

            <Accordion 
              title="Makan Siang" 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            
            <Accordion 
              title="Makan Malam" 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Extra Card */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Menu Extra Card & Soft Button</h3>
          <div className="w-40 mb-4">
            <MenuCard 
              type="extra"
              title="Extra Nasi Putih"
              price="Rp 5.000"
              image="https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400&auto=format&fit=crop"
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Standalone Button (Soft Variant)</h4>
            <Button variant="soft" className="px-8">
              + Tambah
            </Button>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Quantity Stepper</h3>
          <div className="flex items-center justify-between max-w-[240px] bg-neutral-50 border border-neutral-100 rounded-lg p-2">
            <span className="text-sm font-medium text-neutral-700 ml-2">Jumlah Pesanan</span>
            <Stepper value={1} onChange={() => {}} className="w-[100px] border-none bg-transparent" />
          </div>
        </div>

        {/* Date & Time Selections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Date & Time Selection</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Waktu Pengantaran</label>
            <div className="flex items-center gap-2">
              <Button variant="primary" pill size="sm" className="px-5">Secepatnya</Button>
              <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-full px-4 py-1.5 text-sm pointer-events-none">
                02:30 PM
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Pilihan Tanggal</label>
            <div className="flex items-center gap-2">
              <Button variant="primary" pill size="sm" className="px-6 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                Hari Ini
              </Button>
              <Button variant="outline" pill size="sm" className="px-6">Besok</Button>
            </div>
          </div>
        </div>

        {/* Rekap Cards (Bento Style) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Section - Rekap Cards (Bento Style)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <RekapCard
              title="Makan Pagi"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              total={75}
              details={[
                { label: 'Paket A', value: 45 },
                { label: 'Paket B', value: 30 }
              ]}
            />
            
            <RekapCard
              title="Makan Siang"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              total={78}
              details={[
                { label: 'Paket A', value: 48 },
                { label: 'Paket B', value: 30 }
              ]}
            />

            <RekapCard
              title="Makan Malam"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              total={65}
              details={[
                { label: 'Paket A', value: 35 },
                { label: 'Paket B', value: 30 }
              ]}
            />

            <RekapCard
              title="Ekstra"
              totalLabel="Total Item"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              total={18}
              details={[
                { 
                  label: '6 Jenis Menu', 
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) 
                }
              ]}
            />
          </div>
        </div>

        {/* Section - Orders Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Section - Orders Table</h3>
          <div className="overflow-x-auto shadow-sm rounded-lg border border-neutral-200">
            <OrdersTable data={mockOrdersData} />
          </div>
        </div>

        {/* VerticalBorder (User Menu) Nav (Admin) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Date/Time Display & Admin Nav</h3>
          <div className="flex items-center gap-12 bg-neutral-0 p-4 rounded-xl border border-neutral-100 shadow-sm max-w-md">
            <DateTimeDisplay date="JUMAT, 21 JULI 2026" time="10:15 WIB" />
            <Tabs 
              tabs={['Dashboard', 'Siklus']} 
              activeTab="Dashboard" 
              onTabChange={() => {}} 
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-800">Search Bar</h3>
          <div className="max-w-sm">
            <SearchBar />
          </div>
        </div>

        {/* Modals & Popups */}
        <div className="space-y-8">
          <div className="border-b border-neutral-200 pb-2">
            <h3 className="text-xl font-bold text-neutral-800">Modals & Pop-ups</h3>
            <p className="text-sm text-neutral-500">Berbagai layout isi pop-up yang digunakan dalam aplikasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700">1. Konfirmasi Pengiriman</h4>
              <div className="shadow-xl rounded-xl max-w-sm">
                <ConfirmDeliveryContent />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700">2. Konfirmasi Hapus</h4>
              <div className="shadow-xl rounded-xl max-w-sm">
                <DeletePackageContent />
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-semibold text-neutral-700">3. Edit Paket Menu</h4>
              <div className="max-w-lg shadow-xl rounded-xl">
                <EditPackageContent />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="font-semibold text-neutral-700">4. Detail Catatan Pesanan</h4>
              <div className="bg-neutral-0 rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full">
                <div className="px-5 py-4 border-b border-neutral-200 rounded-t-xl bg-neutral-0">
                  <h3 className="text-xl font-semibold text-neutral-900">Detail Catatan Pesanan</h3>
                </div>
                <div className="p-5 bg-neutral-0 rounded-b-xl">
                  <NoteDetailContent data={mockOrdersData[0]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Demo */}
        <div className="space-y-2 relative h-40 bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
          <h3 className="text-lg font-semibold text-neutral-800 p-4">Sticky Footer Action Bar (Demo)</h3>
          {/* Note: StickyFooter usually anchors to screen bottom, we override position for showcase preview */}
          <div className="absolute bottom-0 left-0 right-0">
            <StickyFooter className="!static !shadow-none" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsShowcase;

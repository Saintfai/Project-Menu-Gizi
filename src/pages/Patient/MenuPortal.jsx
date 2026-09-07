import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, ShoppingCart } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientIdentityCard from '../../components/ui/cards/PatientIdentityCard';
import Alert from '../../components/ui/feedback/Alert';
import Accordion from '../../components/ui/data-display/Accordion';
import MenuCard from '../../components/ui/cards/MenuCard';
import SearchBar from '../../components/ui/forms/SearchBar';
import { usePatient } from '../../context/PatientContext';
import { supabase } from '../../utils/supabase';

export default function MenuPortal() {
  const { patient } = usePatient();
  
  // Local state for fetching menus
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local state for steppers
  const [quantities, setQuantities] = useState({});

  // Mock patient if context is empty for UI testing
  const displayPatient = patient || {
    name: 'Budi Santoso',
    rmNumber: 'RM-1223',
    roomName: 'Kamar 402',
    roomClass: 'VIP_A'
  };

  const isVip = displayPatient.roomClass?.includes('VIP');
  // VIP gets 2 portions for Pagi, Siang, Malam. Others get 2 Pagi, 1 Siang, 1 Malam.
  const maxQtyPagi = 2;
  const maxQtySiang = isVip ? 2 : 1;
  const maxQtyMalam = isVip ? 2 : 1;

  useEffect(() => {
    async function fetchMenus() {
      try {
        setLoading(true);
        // Calculate T+1 Cycle
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const day = tomorrow.getDate();
        let cycleId = day % 10;
        if (cycleId === 0) cycleId = 10;
        if (day === 31) cycleId = 11;

        const { data, error: fetchError } = await supabase
          .from('MenuItem')
          .select('*')
          .eq('cycleId', cycleId);

        if (fetchError) throw fetchError;
        setMenuItems(data || []);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  const handleQuantityChange = (id, val) => {
    setQuantities(prev => ({ ...prev, [id]: val }));
  };

  // Grouping the menus
  const isEkstra = (item) => item.paketName?.toLowerCase().includes('ekstra') || item.name?.toLowerCase().includes('ekstra');
  
  const menuPagi = menuItems.filter(item => item.mealTime?.toUpperCase() === 'PAGI' && !isEkstra(item));
  const menuSiang = menuItems.filter(item => item.mealTime?.toUpperCase() === 'SIANG' && !isEkstra(item));
  const menuMalam = menuItems.filter(item => item.mealTime?.toUpperCase() === 'SORE' && !isEkstra(item));
  const menuEkstra = menuItems.filter(item => isEkstra(item));

  // Helper to render Menu Utama cards in a 2-column mobile grid
  const renderMenuGrid = (items, maxQty) => {
    if (loading) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Memuat menu...</div>;
    if (error) return <div className="p-3 text-sm text-danger-500 italic bg-red-50 rounded-lg border border-red-100 mt-2">Gagal memuat menu.</div>;
    if (items.length === 0) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Data menu belum tersedia.</div>;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 mt-3">
        {items.map(item => (
          <MenuCard 
            key={item.id}
            type="paket"
            subtitle={item.paketName || 'Paket'}
            title={item.name}
            description={item.description}
            quantity={quantities[item.id] || 0}
            maxQuantity={maxQty}
            onQuantityChange={(val) => handleQuantityChange(item.id, val)}
            image={item.image || item.imageUrl}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-neutral-900 pt-[60px]">
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] text-gray-500 font-normal">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
        />
      </div>

      {/* Main Content Container - 100% Responsive Width */}
      <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-12 py-6 z-10 relative pb-8 w-full space-y-6 md:space-y-8">
        
        {/* Patient Profile Card */}
        <PatientIdentityCard 
          name={displayPatient.name}
          rmNumber={displayPatient.rmNumber?.replace('RM-', '') || '1223'}
          room={displayPatient.roomName?.replace('Kamar ', '') || '402'}
          isVip={isVip}
        />

        {/* Warning Banner */}
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

        {/* Menu Utama Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed size={20} className="text-primary-500" />
            <h2 className="text-lg md:text-xl font-bold text-neutral-900">Menu Utama</h2>
          </div>

          <Accordion 
            title="Makan Pagi" 
            defaultExpanded={true}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          >
            {renderMenuGrid(menuPagi, maxQtyPagi)}
          </Accordion>

          <Accordion 
            title="Makan Siang" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          >
            {renderMenuGrid(menuSiang, maxQtySiang)}
          </Accordion>

          <Accordion 
            title="Makan Malam" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          >
            {renderMenuGrid(menuMalam, maxQtyMalam)}
          </Accordion>
        </div>

        {/* Ekstra Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary-500" />
            <h2 className="text-lg md:text-xl font-bold text-neutral-900">Ekstra</h2>
          </div>

          <SearchBar />

          {loading ? (
            <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100">Memuat menu ekstra...</div>
          ) : menuEkstra.length === 0 ? (
            <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100">Data menu ekstra belum tersedia.</div>
          ) : (
            <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 overflow-x-auto pb-4 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {menuEkstra.map(item => (
                <div key={item.id} className="min-w-[240px] w-[75vw] sm:w-auto sm:min-w-0 snap-start">
                  <MenuCard 
                    key={item.id}
                    type="paket"
                    subtitle={item.paketName || 'Ekstra'}
                    title={item.name}
                    description={item.description}
                    quantity={quantities[item.id] || 0}
                    maxQuantity={10}
                    onQuantityChange={(val) => handleQuantityChange(item.id, val)}
                    image={item.image || item.imageUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


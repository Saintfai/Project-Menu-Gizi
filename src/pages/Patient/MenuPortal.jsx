import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ShoppingCart, ShoppingBag } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientIdentityCard from '../../components/ui/cards/PatientIdentityCard';
import Alert from '../../components/ui/feedback/Alert';
import Accordion from '../../components/ui/data-display/Accordion';
import MenuCard from '../../components/ui/cards/MenuCard';
import SearchBar from '../../components/ui/forms/SearchBar';
import IncludeModal from '../../components/ui/modals/IncludeModal';
import { usePatient } from '../../context/PatientContext';
import { supabase } from '../../utils/supabase';
import PageTransition from '../../components/PageTransition';

export default function MenuPortal() {
  const { patient, logoutPatient } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state for fetching menus
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeModalOpen, setIncludeModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Local state for steppers
  // quantities format: { [itemId]: ['PASIEN', 'PENDAMPING', ...] }
  const [quantities, setQuantities] = useState(() => {
    // Restore quantities when coming back from Cart
    return location.state?.restoredQuantities || {};
  });
  const [searchQuery, setSearchQuery] = useState('');


  // Mock patient if context is empty for UI testing
  const displayPatient = patient || {
    name: 'Budi Santoso',
    rmNumber: 'RM-1223',
    roomName: 'LAVENDER 1 - 1.1',
    roomClass: 'VIP A'
  };

  const roomClassLower = displayPatient.roomClass?.toLowerCase() || '';
  // VIP A, Junior Suite, and Suite get 2 portions for all meals
  const isVip = roomClassLower.includes('vip a') || roomClassLower.includes('suite');
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

  const handleQuantityChange = (item, val, sessionMaxQty) => {
    const currentQtyArr = quantities[item.id] || [];
    const currentQty = currentQtyArr.length;

    if (val > currentQty) {
      // User clicked '+'
      if (sessionMaxQty > 1) {
        // Kuota lebih dari 1, tampilkan modal untuk memilih siapa pengonsumsinya
        setIncludeModalOpen(true);
        setSelectedCardId(item.id);
      } else {
        // Kuota hanya 1, otomatis assign ke PASIEN
        setQuantities(prev => ({
          ...prev,
          [item.id]: [...(prev[item.id] || []), 'PASIEN']
        }));
      }
    } else if (val < currentQty) {
      // User clicked '-', hapus elemen terakhir
      setQuantities(prev => {
        const arr = prev[item.id] || [];
        return {
          ...prev,
          [item.id]: arr.slice(0, -1)
        };
      });
    }
  };

  const handleIncludeModalSave = (consumerRole) => {
    const itemId = selectedCardId;
    setQuantities(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), consumerRole]
    }));
    
    // Tutup modal
    setIncludeModalOpen(false);
    setSelectedCardId(null);
  };

  const handleEkstraQuantityChange = (item, val) => {
    const itemId = `ekstra_${item.id}`;
    const currentQty = quantities[itemId]?.length || 0;
    
    if (val > currentQty) {
      setQuantities(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), 'EKSTRA']
      }));
    } else if (val < currentQty) {
      setQuantities(prev => {
        const arr = prev[itemId] || [];
        return {
          ...prev,
          [itemId]: arr.slice(0, -1)
        };
      });
    }
  };

  // Grouping the menus
  const menuPagi = menuItems.filter(item => item.mealTime?.toUpperCase() === 'PAGI');
  const menuSiang = menuItems.filter(item => item.mealTime?.toUpperCase() === 'SIANG');
  const menuMalam = menuItems.filter(item => item.mealTime?.toUpperCase() === 'SORE' || item.mealTime?.toUpperCase() === 'MALAM');

  // Filtered menus for Ekstra Search
  const filteredEkstraSiang = menuSiang.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEkstraMalam = menuMalam.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to render Menu Utama cards in a 2-column mobile grid
  const renderMenuGrid = (items, maxSessionQty) => {
    if (loading) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Memuat menu...</div>;
    if (error) return <div className="p-3 text-sm text-danger-500 italic bg-red-50 rounded-lg border border-red-100 mt-2">Gagal memuat menu.</div>;
    if (items.length === 0) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Data menu belum tersedia.</div>;

    const totalUsedQty = items.reduce((sum, item) => sum + (quantities[item.id]?.length || 0), 0);
    const remainingQty = maxSessionQty - totalUsedQty;

    return (
      <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 overflow-x-auto pb-4 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map(item => {
          const currentQty = quantities[item.id]?.length || 0;
          const dynamicMaxQty = currentQty + remainingQty;

          return (
            <div key={`wrap-${item.id}`} className="min-w-[160px] w-[45vw] sm:w-auto sm:min-w-0 snap-start shrink-0 flex">
              <div className="w-full">
                <MenuCard 
                  key={item.id}
                  type="paket"
                  subtitle={item.paketName || 'Paket'}
                  title={item.name}
                  description={item.description}
                  quantity={currentQty}
                  maxQuantity={dynamicMaxQty}
                  sessionMaxQuantity={maxSessionQty}
                  onQuantityChange={(val) => handleQuantityChange(item, val, maxSessionQty)}
                  image={item.image || item.imageUrl}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper to render Ekstra cards with 'ekstra_' prefix
  const renderEkstraGrid = (items) => {
    if (loading) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Memuat menu ekstra...</div>;
    if (error) return <div className="p-3 text-sm text-danger-500 italic bg-red-50 rounded-lg border border-red-100 mt-2">Gagal memuat menu.</div>;
    if (items.length === 0) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Data menu ekstra belum tersedia.</div>;

    return (
      <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 overflow-x-auto pb-4 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map(item => {
          const itemId = `ekstra_${item.id}`;
          const currentQty = quantities[itemId]?.length || 0;

          return (
            <div key={`ekstra-wrap-${item.id}`} className="min-w-[160px] w-[45vw] sm:w-auto sm:min-w-0 snap-start shrink-0 flex">
              <div className="w-full">
                  <MenuCard 
                    key={`ekstra-card-${item.id}`}
                    type="extra"
                    subtitle={item.paketName || 'Paket'}
                    title={item.name}
                    description={item.description}
                    price="Rp 15.000"
                    quantity={currentQty}
                    onQuantityChange={(val) => handleEkstraQuantityChange(item, val)}
                    image={item.image || item.imageUrl}
                  />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalItems = Object.values(quantities).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);

  return (
    <PageTransition>
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-neutral-900 pt-[60px] pb-24">
      
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
          onLogout={() => {
            logoutPatient();
            navigate('/');
          }}
        />
      </div>

      {/* Main Content Container - Centered */}
      <div className="flex-1 flex flex-col px-4 py-6 z-10 relative pb-8 w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Patient Profile Card */}
        <PatientIdentityCard 
          name={displayPatient.name}
          rmNumber={displayPatient.rmNumber?.replace('RM-', '') || '1223'}
          room={displayPatient.roomName?.replace('Kamar ', '') || '402'}
          roomClass={displayPatient.roomClass}
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

          <SearchBar 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Accordion 
            title="Makan Siang" 
            defaultExpanded={true}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          >
            {renderEkstraGrid(filteredEkstraSiang)}
          </Accordion>

          <Accordion 
            title="Makan Malam" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          >
            {renderEkstraGrid(filteredEkstraMalam)}
          </Accordion>
        </div>

      </div>

      {/* Modals */}
      <IncludeModal 
        isOpen={includeModalOpen}
        onClose={() => {
          setIncludeModalOpen(false);
          setSelectedCardId(null);
        }}
        itemData={selectedCardId ? menuItems.find(m => m.id === selectedCardId) : null}
        onSave={handleIncludeModalSave}
      />

      {/* Floating Cart Banner */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-[#004e8c] text-white rounded-2xl shadow-xl z-40 p-3 md:px-6 md:py-4 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="relative ml-1">
              <ShoppingBag size={24} className="text-white opacity-90" />
              <span className="absolute -top-2.5 -right-2.5 bg-danger-600 text-white text-[10px] font-bold w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-[#004e8c]">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col ml-1">
              <span className="font-bold text-base leading-tight">{totalItems} Item</span>
              <span className="text-xs text-white/80 font-normal mt-0.5">Item terpilih</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/cart', { state: { quantities, menuItems } })}
            className="bg-white text-[#004e8c] font-bold px-4 py-2 rounded-[10px] text-sm hover:bg-neutral-50 transition-colors flex items-center gap-1.5 border-0 outline-none shadow-none"
          >
            Lanjut ke Ringkasan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}


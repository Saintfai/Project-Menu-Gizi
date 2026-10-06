import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenuItemsByCycle } from '../../../services/menuService';
import { updateOrderNotes } from '../../../services/orderService';

export default function ComponentEditModal({ isOpen, onClose, selectedMeal, cycleNumber }) {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  
  // Selected overrides
  const [karbo, setKarbo] = useState('');
  const [protein, setProtein] = useState('');
  const [sayur, setSayur] = useState('');
  const [nabati, setNabati] = useState('');
  const [tambahan, setTambahan] = useState('');

  const [originalMenu, setOriginalMenu] = useState(null);

  // Fetch available menu components for the current cycle & mealTime
  useEffect(() => {
    if (isOpen && selectedMeal && cycleNumber) {
      // Clear previous data immediately to prevent flickering of old menu data
      setMenus([]);
      setOriginalMenu(null);
      setKarbo('');
      setProtein('');
      setSayur('');
      setNabati('');
      setTambahan('');

      const fetchMenus = async () => {
        try {
          const mealTime = (selectedMeal.mealTime || '').toUpperCase();
          const targetOrder = selectedMeal.items[0];

          let cycleItems = [];
          try {
            cycleItems = await getMenuItemsByCycle(cycleNumber);
          } catch (e) {
            console.warn('Could not fetch cycle items for modal:', e);
          }
          const filtered = (cycleItems || []).filter(item => (item.mealTime || '').toUpperCase() === mealTime);
          setMenus(filtered);

          // Find the matching menu item for the target order (case-insensitive & supports name / paketName)
          const orderMenuName = (targetOrder.menuName || targetOrder.paketName || '').trim().toLowerCase();
          const orderPaketName = (targetOrder.paketName || '').trim().toLowerCase();

          const matchedMenu = filtered.find(m => 
            (m.name && m.name.trim().toLowerCase() === orderMenuName) ||
            (m.paketName && m.paketName.trim().toLowerCase() === orderMenuName) ||
            (m.paketName && m.paketName.trim().toLowerCase() === orderPaketName)
          );

          // Base ingredients: prioritaskan matchedMenu, fallback ke nilai langsung dari targetOrder
          const baseKarbo = matchedMenu?.karbohidrat || targetOrder.karbohidrat || '';
          const baseProtein = matchedMenu?.protein || targetOrder.protein || '';
          const baseSayur = matchedMenu?.sayur || targetOrder.sayur || '';
          const baseNabati = matchedMenu?.nabati || targetOrder.nabati || '';
          const baseTambahan = matchedMenu?.proteinTambahan || targetOrder.proteinTambahan || targetOrder.protein_tambahan || '';

          const orig = {
            karbohidrat: baseKarbo === '-' ? '' : baseKarbo,
            protein: baseProtein === '-' ? '' : baseProtein,
            sayur: baseSayur === '-' ? '' : baseSayur,
            nabati: baseNabati === '-' ? '' : baseNabati,
            proteinTambahan: baseTambahan === '-' ? '' : baseTambahan,
          };
          setOriginalMenu(orig);

          let initKarbo = orig.karbohidrat;
          let initProtein = orig.protein;
          let initSayur = orig.sayur;
          let initNabati = orig.nabati;
          let initTambahan = orig.proteinTambahan;

          // Parse existing notes to reflect previously saved changes
          const existingNotes = targetOrder.notes || '';
          if (existingNotes) {
              const parseNote = (label, currentVal) => {
                  if (existingNotes.includes(`[Tanpa ${label}]`)) return '';
                  const match = existingNotes.match(new RegExp(`\\[Ganti ${label}: (.*?)\\]`));
                  return match ? match[1] : currentVal;
              };

              initKarbo = parseNote('Karbohidrat', initKarbo);
              initProtein = parseNote('Protein Hewani', initProtein);
              initSayur = parseNote('Sayur', initSayur);
              initNabati = parseNote('Protein Nabati', initNabati);
              initTambahan = parseNote('Protein Tambahan', initTambahan);
          }

          setKarbo(initKarbo);
          setProtein(initProtein);
          setSayur(initSayur);
          setNabati(initNabati);
          setTambahan(initTambahan);
        } catch (err) {
          console.error('Failed to initialize component modal:', err);
        }
      };
      fetchMenus();
    }
  }, [isOpen, selectedMeal, cycleNumber]);

  if (!isOpen || !selectedMeal) return null;

  // Extract unique options
  const uniqueOptions = (field) => {
    const opts = menus.map(m => m[field]).filter(val => val && val.trim() !== '' && val !== '-');
    const origVal = originalMenu?.[field];
    if (origVal && origVal.trim() !== '' && origVal !== '-' && !opts.includes(origVal)) {
      opts.push(origVal);
    }
    return [...new Set(opts)];
  };

  const handleSave = async () => {
    if (!selectedMeal.items || selectedMeal.items.length === 0) {
        onClose();
        return;
    }

    setLoading(true);
    
    // Determine which order to update (we take the first one if multiple, usually there's only 1 include meal per cell)
    const targetOrder = selectedMeal.items[0];
    let newNotes = targetOrder.notes || '';

    // Bersihkan tag catatan komponen gizi yang lama sebelum diset ulang
    const labels = ['Karbohidrat', 'Protein Hewani', 'Sayur', 'Protein Nabati', 'Protein Tambahan'];
    labels.forEach(label => {
        newNotes = newNotes.replace(new RegExp(`\\[Ganti ${label}: .*?\\]\\n?`, 'g'), '');
        newNotes = newNotes.replace(new RegExp(`\\[Tanpa ${label}\\]\\n?`, 'g'), '');
    });
    newNotes = newNotes.trim();

    const addNote = (label, val, originalVal) => {
        const orig = originalVal || '';
        const current = val || '';
        
        if (current !== orig) {
            let noteStr = '';
            if (current === '') {
                noteStr = `[Tanpa ${label}]`;
            } else {
                noteStr = `[Ganti ${label}: ${current}]`;
            }
            
            newNotes = newNotes ? `${newNotes}\n${noteStr}` : noteStr;
        }
    };

    addNote('Karbohidrat', karbo, originalMenu?.karbohidrat);
    addNote('Protein Hewani', protein, originalMenu?.protein);
    addNote('Sayur', sayur, originalMenu?.sayur);
    addNote('Protein Nabati', nabati, originalMenu?.nabati);
    addNote('Protein Tambahan', tambahan, originalMenu?.proteinTambahan);

    const updatedFields = {
      karbohidrat: karbo || '-',
      protein: protein || '-',
      sayur: sayur || '-',
      nabati: nabati || '-',
      proteinTambahan: tambahan || '-',
    };

    try {
        await updateOrderNotes(targetOrder.id, newNotes, updatedFields);
        targetOrder.notes = newNotes;
        targetOrder.karbohidrat = updatedFields.karbohidrat;
        targetOrder.protein = updatedFields.protein;
        targetOrder.sayur = updatedFields.sayur;
        targetOrder.nabati = updatedFields.nabati;
        targetOrder.proteinTambahan = updatedFields.proteinTambahan;
        
        toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              } max-w-sm bg-white text-neutral-800 shadow-[0_3px_10px_rgba(0,0,0,0.1)] rounded-[8px] pointer-events-auto px-4 py-3 flex gap-2.5 items-center transition-all duration-500 ease-in-out`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-[#61d345] rounded-full">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="font-medium text-[14px]">
                Perubahan komponen gizi berhasil disimpan.
              </div>
            </div>
        ), { position: 'top-right', duration: 3000 });
    } catch (err) {
        console.error('Failed to update component overrides', err);
        alert(`Gagal menyimpan perubahan komponen gizi.\n\nDetail: ${err.message || JSON.stringify(err)}`);
    } finally {
        setLoading(false);
        onClose();
    }
  };

  const renderSelect = (label, value, setter, fieldKey) => {
      const options = uniqueOptions(fieldKey);
      
      return (
          <div className="mb-3">
              <label className="block text-xs font-bold text-neutral-700 mb-1">{label}</label>
              <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full h-9 px-3 border border-neutral-300 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                  <option value="">Tidak Pakai</option>
                  {options.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                  ))}
                  {/* Ensure original value is in the dropdown if not in standard options */}
                  {value && !options.includes(value) && (
                      <option value={value}>{value}</option>
                  )}
              </select>
          </div>
      );
  };

  const hasAnyOptions = menus.length > 0 || !!originalMenu;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Ubah Komponen Gizi</h3>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Makan {selectedMeal.mealTime} - Pasien {selectedMeal.row.patientName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-2.5 pb-4 min-h-[400px] max-h-[65vh] overflow-y-auto flex flex-col">
          {!hasAnyOptions ? (
              <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-neutral-500 italic text-center animate-pulse">Memuat opsi menu komponen...</p>
              </div>
          ) : (
              <div className="animate-in fade-in duration-200">
                  <p className="text-xs text-neutral-600 mb-3">Pilih komponen baru jika pasien meminta penggantian.</p>
                  {renderSelect('Karbohidrat', karbo, setKarbo, 'karbohidrat')}
                  {renderSelect('Protein Hewani', protein, setProtein, 'protein')}
                  {renderSelect('Sayur', sayur, setSayur, 'sayur')}
                  {renderSelect('Protein Nabati', nabati, setNabati, 'nabati')}
                  {renderSelect('Protein Tambahan', tambahan, setTambahan, 'proteinTambahan')}
              </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !hasAnyOptions}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-lg text-sm font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : (
                <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

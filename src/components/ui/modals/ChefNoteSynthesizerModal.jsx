import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { 
  X, 
  FileEdit, 
  Search, 
  AlertTriangle, 
  Check, 
  Plus, 
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../buttons/Button';
import { getChefDailyNote, saveChefDailyNote } from '../../../services/orderService';
import { hasRealAllergy } from '../../../utils/orderTransformer';

/**
 * Modal Kurasi Catatan Koki (Chef Note Synthesizer).
 * Sisi Kiri: Menampilkan daftar kartu catatan khusus dan riwayat alergi pasien.
 * Sisi Kanan: Area free-text dokumen bersih tanpa template kaku untuk merangkum instruksi dapur.
 */
export default function ChefNoteSynthesizerModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  servingDate = '',
  onSaved 
}) {
  const [chefNoteText, setChefNoteText] = useState('');
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Kunci scroll pada document body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  // Ambil catatan koki yang pernah tersimpan untuk tanggal penyajian ini
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadExistingNote() {
      setIsLoadingNote(true);
      try {
        const noteData = await getChefDailyNote(servingDate);
        if (isMounted && noteData?.note) {
          setChefNoteText(noteData.note);
        }
      } catch (err) {
        console.warn('Gagal memuat catatan koki sebelumnya:', err);
      } finally {
        if (isMounted) setIsLoadingNote(false);
      }
    }

    loadExistingNote();
    return () => { isMounted = false; };
  }, [isOpen, servingDate]);

  // Helper untuk membandingkan tanggal penyajian dengan aman
  const targetDateNorm = useMemo(() => {
    if (!servingDate) return '';
    const s = String(servingDate).trim();
    const dmyMatch = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    return s.slice(0, 10);
  }, [servingDate]);

  // Ekstrak pesanan pasien yang memiliki catatan khusus atau alergi KHUSUS untuk tanggal penyajian ini
  // Filter 1 saja catatan dari masing-masing pasien (deduplikasi per pasien)
  const patientNotesList = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const patientMap = new Map();

    orders.forEach((order, idx) => {
      // Filter ketat berdasarkan tanggal penyajian agar catatan tidak bocor antar hari
      if (targetDateNorm) {
        const orderDate = order.servingDate || order.serving_date || order.createdAt;
        if (orderDate) {
          const d = new Date(orderDate);
          const pad = (n) => String(n).padStart(2, '0');
          const orderDateStr = !isNaN(d.getTime()) 
            ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
            : String(orderDate).slice(0, 10);
          
          if (orderDateStr !== targetDateNorm) {
            return;
          }
        }
      }

      const hasNote = order.notes && typeof order.notes === 'string' && order.notes.trim() !== '' && order.notes.trim() !== '-';
      const allergyRaw = order.patient?.allergies || order.allergies || order.allergyNote || '';
      const isAllergic = typeof order.hasAllergy === 'boolean'
        ? order.hasAllergy
        : hasRealAllergy(allergyRaw);

      // Hanya tampilkan di daftar kurasi jika pesanan benar-benar memiliki catatan khusus
      if (hasNote) {
        const patientName = order.patientName || order.consumer_name || order.patient?.name || 'Pasien';
        const room = order.roomNumber || order.kamar || '-';
        const patientId = order.patientId || order.rmNumber || '-';
        const rawMeal = (order.mealTime || order.meal_time || 'PAGI').toUpperCase();
        const mealTime = rawMeal === 'MALAM' ? 'SORE' : rawMeal;
        const menu = order.menuName || order.paketName || 'Paket Menu';
        const noteText = order.notes.trim();
        const allergyText = isAllergic ? allergyRaw.trim() : '';
        const rawType = (order.type || '').toUpperCase();
        const orderType = rawType === 'EXCLUDE' ? 'Ekstra' : 'Utama';
        const orderIdVal = order.orderId || order.order_id || order.orderCode;

        // Kunci pembeda per sesi transaksi pesanan (order_id):
        // 1. Jika dalam 1 sesi checkout memesan Pagi, Siang, Sore -> orderId-nya sama, sehingga disatukan menjadi 1 kartu (tidak dobel 3 kali).
        // 2. Jika pasien yang sama kemudian memesan lagi (misal Paket Ekstra) dengan orderId baru, catatannya tetap muncul sebagai kartu pesanan baru!
        const patientKey = String(patientId && patientId !== '-' ? patientId : `${patientName}_${room}`).trim().toLowerCase();
        const groupKey = orderIdVal && orderIdVal !== '-'
          ? String(orderIdVal).trim()
          : `${patientKey}_${orderType}_${noteText || idx}`;

        if (!patientMap.has(groupKey)) {
          patientMap.set(groupKey, {
            id: orderIdVal || order.id || `${groupKey}-${idx}`,
            groupKey,
            orderId: orderIdVal || '-',
            orderType,
            patientKey,
            patientId,
            patientName,
            room,
            mealTimes: new Set(mealTime ? [mealTime] : []),
            menus: new Set(menu && menu !== '-' ? [menu] : []),
            notesSet: new Set(noteText ? [noteText] : []),
            allergies: allergyText,
            hasAllergy: Boolean(allergyText && hasRealAllergy(allergyText)),
          });
        } else {
          const existing = patientMap.get(groupKey);
          if (mealTime) existing.mealTimes.add(mealTime);
          if (menu && menu !== '-') existing.menus.add(menu);
          if (noteText) existing.notesSet.add(noteText);
          if (!existing.allergies && allergyText) {
            existing.allergies = allergyText;
            existing.hasAllergy = Boolean(allergyText && hasRealAllergy(allergyText));
          }
        }
      }
    });

    return Array.from(patientMap.values()).map(item => {
      const notesCombined = Array.from(item.notesSet).join('; ');
      const mealTimesArray = Array.from(item.mealTimes);
      const mealTimeDisplay = mealTimesArray.length >= 3 
        ? 'Semua Waktu (Pagi, Siang, Sore)' 
        : mealTimesArray.map(m => m.charAt(0) + m.slice(1).toLowerCase()).join(', ');
      const menuDisplay = Array.from(item.menus).slice(0, 2).join(', ');

      return {
        id: item.id,
        orderId: item.orderId,
        orderType: item.orderType,
        patientKey: item.patientKey,
        patientId: item.patientId,
        patientName: item.patientName,
        room: item.room,
        mealTime: mealTimeDisplay || 'Jadwal Harian',
        menu: menuDisplay || '-',
        notes: notesCombined,
        allergies: item.allergies,
        hasNote: Boolean(notesCombined),
        hasAllergy: item.hasAllergy,
      };
    });
  }, [orders, targetDateNorm]);

  // Filter daftar catatan pasien berdasarkan pencarian nama atau kamar
  const filteredPatientNotes = useMemo(() => {
    if (!searchQuery.trim()) return patientNotesList;
    const q = searchQuery.toLowerCase().trim();
    return patientNotesList.filter(item => 
      item.patientName.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q) ||
      item.allergies.toLowerCase().includes(q)
    );
  }, [patientNotesList, searchQuery]);

  // Sisipkan catatan pasien ke textarea dokumen di sisi kanan (1 snippet bersih per transaksi pesanan)
  const handleInsertNote = (item) => {
    const allergyPart = item.hasAllergy ? ` [Alergi: ${item.allergies}]` : '';
    const notePart = item.notes ? `: ${item.notes}` : '';
    const typeLabel = item.orderType ? ` - ${item.orderType}` : '';
    const mealPart = item.mealTime ? ` (${item.mealTime}${typeLabel})` : '';
    const snippet = `• Kamar ${item.room} - ${item.patientName}${mealPart}${allergyPart}${notePart}\n`;
    
    setChefNoteText(prev => (prev ? `${prev.trimEnd()}\n${snippet}` : snippet));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
    toast.success(`Catatan ${item.patientName} (${item.orderType}) disisipkan!`, { duration: 1500 });
  };

  // Simpan catatan rangkuman ke server RS Edelweiss
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chefNoteText.trim()) {
      toast.error('Catatan rangkuman koki masih kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveChefDailyNote(chefNoteText.trim(), servingDate);
      toast.success('Rangkuman catatan koki berhasil disimpan!');
      if (onSaved) onSaved(chefNoteText.trim());
      onClose();
    } catch (err) {
      console.error('Gagal menyimpan rangkuman catatan koki:', err);
      toast.error(err.message || 'Gagal menyimpan catatan ke server RS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalMarkup = (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-neutral-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white border border-neutral-200 text-primary-700">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                Rangkuman Catatan Dapur & Koki
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Rangkum instruksi operasional untuk koki berdasarkan catatan khusus dan alergi pasien
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer border-none outline-none"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Modal: Split-View 2 Kolom */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-200 min-h-0 bg-neutral-50/20">
          
          {/* SISI KIRI: Daftar Catatan Pasien Masuk */}
          <div className="md:col-span-5 flex flex-col min-h-0 bg-neutral-50/40">
            {/* Header Kolom Kiri */}
            <div className="p-3 border-b border-neutral-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Catatan Pesanan Masuk ({patientNotesList.length})
                </span>
                <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  {servingDate ? `Tgl: ${servingDate}` : 'Jadwal Hari Ini'}
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pasien atau kamar..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* List Kartu Catatan Pasien */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredPatientNotes.length === 0 ? (
                <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <p className="text-xs font-medium text-neutral-600">
                    {searchQuery ? 'Tidak ada catatan pasien yang cocok.' : 'Belum ada catatan khusus pasien untuk jadwal ini.'}
                  </p>
                </div>
              ) : (
                filteredPatientNotes.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-lg border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-neutral-900 leading-tight">
                            {item.patientName}
                          </p>
                          {item.orderType && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                              item.orderType === 'Ekstra'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-primary-50 text-primary-700 border border-primary-200'
                            }`}>
                              {item.orderType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          {item.room} • RM: {item.patientId}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {item.mealTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-600">
                      Menu: <span className="font-medium text-neutral-800">{item.menu}</span>
                    </div>

                    {/* Catatan Khusus */}
                    {item.notes && (
                      <div className="p-2 rounded bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-medium">
                        <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">Catatan:</span>
                        <p className="italic">{item.notes}</p>
                      </div>
                    )}

                    {/* Alergi jika ada */}
                    {item.hasAllergy && (
                      <div className="p-1.5 rounded bg-danger-50 border border-danger-200 text-danger-700 text-xs flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-danger-500" />
                        <span>Alergi: <strong>{item.allergies}</strong></span>
                      </div>
                    )}

                    {/* Tombol Sisipkan Cepat ke Sisi Kanan */}
                    <button
                      type="button"
                      onClick={() => handleInsertNote(item)}
                      className="w-full py-1 px-2 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Sisipkan catatan ini ke lembar kerja kanan"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-success-600" />
                          <span className="text-success-700 font-bold">Disisipkan!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-primary-600" />
                          <span>Sisipkan ke Catatan</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SISI KANAN: Text Editor Free-Text Tanpa Template */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-white">
            {/* Header Kolom Kanan */}
            <div className="px-4 py-3 border-b border-neutral-200 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                Catatan Rangkuman untuk Koki
              </span>
              {chefNoteText && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bersihkan isi catatan rangkuman?')) {
                      setChefNoteText('');
                    }
                  }}
                  className="text-xs text-neutral-500 hover:text-danger-600 cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* Area Editor Free-Text */}
            <div className="flex-1 p-4 flex flex-col relative min-h-[300px]">
              {isLoadingNote && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 text-neutral-500 text-xs font-medium z-10">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  <span>Memuat catatan...</span>
                </div>
              )}

              <textarea
                value={chefNoteText}
                onChange={(e) => setChefNoteText(e.target.value)}
                placeholder="Ketik catatan rangkuman instruksi untuk koki di sini..."
                className="w-full flex-1 p-3.5 text-sm text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 font-sans leading-relaxed resize-none placeholder:text-neutral-400"
                rows={14}
                autoFocus
              />
            </div>

            {/* Footer Modal: Tombol Batal & Simpan */}
            <div className="px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting || !chefNoteText.trim()}
              >
                Simpan Catatan
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }
  return modalMarkup;
}

ChefNoteSynthesizerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orders: PropTypes.array,
  servingDate: PropTypes.string,
  onSaved: PropTypes.func,
};

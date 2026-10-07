import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  ChevronDown, 
  Info, 
  Sun, 
  Utensils, 
  Moon, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Loader2,
  UtensilsCrossed
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenuCycleByDate } from '../../utils/cycleHelper';
import { 
  getMenuItemsByCycle, 
  updateMenuItem, 
  createMenuItem, 
  deleteMenuItem 
} from '../../services/menuService';
import Button from '../../components/ui/buttons/Button';
import { Input, Textarea } from '../../components/ui/forms/Input';
import Modal from '../../components/ui/modals/Modal';
import PageTransition from '../../components/PageTransition';
import { validateMenuItemFields } from '../../utils/inputValidator';

export default function MenuCycle() {
  const activeCycle = getMenuCycleByDate();
  const [selectedCycle, setSelectedCycle] = useState(activeCycle);
  const isActiveCycle = selectedCycle === activeCycle;
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  
  const [currentMealTime, setCurrentMealTime] = useState('PAGI');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    paketName: 'Paket A',
    name: '',
    description: '',
    karbohidrat: '',
    protein: '',
    nabati: '',
    proteinTambahan: '',
    sayur: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch items for selected cycle
  const loadCycleItems = useCallback(async (cycleId, showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      else setIsLoading(true);

      const items = await getMenuItemsByCycle(cycleId);
      setMenuItems(items);

      if (showToast) {
        toast.success(`Data Siklus ${cycleId} berhasil diperbarui!`);
      }
    } catch (error) {
      console.error('Error loading cycle items:', error);
      toast.error('Gagal memuat data menu siklus.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCycleItems(selectedCycle);
  }, [selectedCycle, loadCycleItems]);

  // Group items by mealTime
  const pagiItems = menuItems.filter((item) => item.mealTime === 'PAGI');
  const siangItems = menuItems.filter((item) => item.mealTime === 'SIANG');
  const soreItems = menuItems.filter((item) => item.mealTime === 'SORE');

  
  const handleOpenAdd = (mealTime) => {
    setCurrentMealTime(mealTime);
    
    const existing = menuItems.filter((m) => m.mealTime === mealTime);
    const nextLetter = String.fromCharCode(65 + existing.length); 
    setFormData({
      paketName: `Paket ${nextLetter}`,
      name: '',
      description: '',
      karbohidrat: '',
      protein: '',
      nabati: '',
      proteinTambahan: '',
      sayur: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      paketName: item.paketName || 'Paket A',
      name: item.name || '',
      description: item.description || '',
      karbohidrat: item.karbohidrat || '',
      protein: item.protein || '',
      nabati: item.nabati || '',
      proteinTambahan: item.proteinTambahan || '',
      sayur: item.sayur || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (item) => {
    if (isActiveCycle) {
      toast.error('Menu tidak dapat dihapus saat siklus sedang aktif.');
      return;
    }
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Submit Add
  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // ─── SECURITY FIX: Validate & sanitize menu item fields ───
    const { valid, sanitized, errors } = validateMenuItemFields(formData);
    if (!valid) {
      toast.error(errors.join(' '));
      return;
    }

    try {
      setIsSubmitting(true);
      await createMenuItem({
        cycleId: selectedCycle,
        mealTime: currentMealTime,
        paketName: (sanitized.paketName || formData.paketName).trim(),
        name: sanitized.name.trim(),
        description: (sanitized.description || '').trim(),
        karbohidrat: sanitized.karbohidrat || null,
        protein: sanitized.protein || null,
        nabati: sanitized.nabati || null,
        proteinTambahan: sanitized.proteinTambahan || null,
        sayur: sanitized.sayur || null,
      });
      toast.success('Menu baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      loadCycleItems(selectedCycle);
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error(error?.message || 'Gagal menambahkan menu baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    // ─── SECURITY FIX: Validate & sanitize menu item fields ───
    const { valid, sanitized, errors } = validateMenuItemFields(formData);
    if (!valid) {
      toast.error(errors.join(' '));
      return;
    }

    try {
      setIsSubmitting(true);
      await updateMenuItem(selectedItem.id, {
        cycleId: selectedCycle,
        mealTime: selectedItem.mealTime || currentMealTime,
        paketName: (sanitized.paketName || formData.paketName).trim(),
        name: sanitized.name.trim(),
        description: (sanitized.description || '').trim(),
        karbohidrat: sanitized.karbohidrat || '-',
        protein: sanitized.protein || '-',
        nabati: sanitized.nabati || '-',
        proteinTambahan: sanitized.proteinTambahan || '-',
        sayur: sanitized.sayur || '-',
      });
      toast.success('Perubahan menu berhasil disimpan!');
      setIsEditModalOpen(false);
      loadCycleItems(selectedCycle);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Gagal menyimpan perubahan menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    if (isActiveCycle) {
      toast.error('Menu tidak dapat dihapus saat siklus sedang aktif.');
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteMenuItem(selectedItem.id);
      toast.success(`Menu "${selectedItem.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      loadCycleItems(selectedCycle);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Gagal menghapus menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a Single Meal Column
  const renderMealColumn = (title, items, mealTime, icon) => {
    return (
      <div className="bg-white rounded-xl border border-neutral-300 shadow-xs flex flex-col h-full overflow-hidden transition-all duration-200">
        {/* Column Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white border border-primary-200 text-primary-700 flex-shrink-0">
              {icon}
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm sm:text-base">{title}</h2>
              <p className="text-xs text-neutral-600 font-medium">
                {items.length} Paket Menu Terdaftar
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md border border-primary-200 bg-white text-primary-800">
            Siklus {selectedCycle}
          </span>
        </div>

        {/* List of Items */}
        <div className="p-4 flex-1 space-y-3 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <p className="text-xs font-medium text-neutral-500">Memuat paket menu...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 px-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-700">Belum Ada Menu</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                Belum ada hidangan yang diatur untuk {title.toLowerCase()} pada Siklus {selectedCycle}.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-primary-400 hover:shadow-xs transition-all duration-200 space-y-2"
              >
                {/* Header item: Badge & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-800">
                    {item.paketName || 'Paket'}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit Menu"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(item)}
                      disabled={isActiveCycle}
                      className={`p-1.5 rounded-md transition-colors ${
                        isActiveCycle
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-600 hover:text-danger-600 hover:bg-danger-50'
                      }`}
                      title={isActiveCycle ? "Menu tidak dapat dihapus saat siklus sedang aktif" : "Hapus Menu"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-neutral-900 text-sm leading-snug">
                  {item.name}
                </h3>

                {/* Description */}
                {item.description && (
                  <div className="text-xs text-neutral-600 bg-neutral-50 rounded-lg p-2 border border-neutral-100 leading-relaxed font-normal">
                    {item.description}
                  </div>
                )}

                {/* Nutrition breakdown pill table */}
                {(item.karbohidrat || item.protein || item.sayur || item.nabati || item.proteinTambahan) && (
                  <div className="text-[11px] bg-neutral-50/70 rounded-lg p-2 border border-neutral-200 space-y-1">
                    {item.karbohidrat && item.karbohidrat !== '-' && (
                      <div className="flex justify-between gap-1 text-neutral-600">
                        <span className="text-neutral-400 font-medium">Karbohidrat:</span>
                        <span className="font-semibold text-neutral-800 text-right truncate">{item.karbohidrat}</span>
                      </div>
                    )}
                    {item.protein && item.protein !== '-' && (
                      <div className="flex justify-between gap-1 text-neutral-600">
                        <span className="text-neutral-400 font-medium">Prot. Hewani:</span>
                        <span className="font-semibold text-neutral-800 text-right truncate">{item.protein}</span>
                      </div>
                    )}
                    {item.sayur && item.sayur !== '-' && (
                      <div className="flex justify-between gap-1 text-neutral-600">
                        <span className="text-neutral-400 font-medium">Sayur:</span>
                        <span className="font-semibold text-neutral-800 text-right truncate">{item.sayur}</span>
                      </div>
                    )}
                    {item.nabati && item.nabati !== '-' && (
                      <div className="flex justify-between gap-1 text-neutral-600">
                        <span className="text-neutral-400 font-medium">Prot. Nabati:</span>
                        <span className="font-semibold text-neutral-800 text-right truncate">{item.nabati}</span>
                      </div>
                    )}
                    {item.proteinTambahan && item.proteinTambahan !== '-' && (
                      <div className="flex justify-between gap-1 text-neutral-600">
                        <span className="text-neutral-400 font-medium">Prot. Tambahan:</span>
                        <span className="font-semibold text-neutral-800 text-right truncate">{item.proteinTambahan}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Button Add */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => handleOpenAdd(mealTime)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="border-neutral-300 hover:border-primary-600 hover:bg-white hover:text-primary-700 text-neutral-700 text-xs font-semibold py-2"
          >
            Tambah {title}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
    <div className="space-y-6 w-full pb-10">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary-600" />
            Manajemen Siklus Menu Gizi
          </h1>
          <p className="text-sm text-neutral-500 mt-1 mb-3">
            Daftar dan konfigurasi paket makanan pasien berdasarkan 11 Siklus Dietetik Rumah Sakit.
          </p>
        </div>

        {/* Active Badge & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
            Siklus Aktif Hari Ini: Siklus {activeCycle}
          </span>

          <button
            type="button"
            onClick={() => loadCycleItems(selectedCycle, true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh Data Siklus"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Cycle Switcher & Information Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3.5 bg-white border border-neutral-200 rounded-xl shadow-xs">
        {/* Cycle Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="cycle-select" className="text-xs sm:text-sm font-bold text-neutral-800 whitespace-nowrap pl-1">
            Pilih Siklus Menu:
          </label>
          <div className="relative w-48 sm:w-56">
            <select
              id="cycle-select"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(Number(e.target.value))}
              className="w-full h-10 appearance-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-xl pl-3.5 pr-9 text-xs sm:text-sm font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all shadow-xs"
            >
              {Array.from({ length: 11 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  Siklus {c} {c === 11 ? '(Khusus Tgl 31)' : ''} {c === activeCycle ? '★ Aktif Besok' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700 bg-neutral-50 px-3.5 py-2 rounded-lg border border-neutral-200">
          <Info className={`w-4 h-4 shrink-0 ${isActiveCycle ? 'text-amber-600' : 'text-primary-600'}`} />
          <p className="leading-snug">
            {isActiveCycle ? (
              <>
                <strong>Siklus {selectedCycle}</strong> aktif untuk T+1. Menu dapat diedit atau ditambah; <strong>penghapusan dikunci</strong>.
              </>
            ) : (
              <>
                Sistem menerapkan <strong>Siklus {selectedCycle}</strong>. Anda dapat mengedit, menambah, atau menghapus menu secara bebas.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cycle Content Overview per Meal Time (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Makan Pagi (Sarapan) */}
        {renderMealColumn(
          'Makan Pagi',
          pagiItems,
          'PAGI',
          <Sun className="w-5 h-5 text-warning-600" />
        )}

        {renderMealColumn(
          'Makan Siang',
          siangItems,
          'SIANG',
          <Utensils className="w-5 h-5 text-primary-600" />
        )}

        {renderMealColumn(
          'Makan Sore',
          soreItems,
          'SORE',
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title={`Tambah Menu - ${currentMealTime === 'PAGI' ? 'Makan Pagi' : currentMealTime === 'SIANG' ? 'Makan Siang' : 'Makan Sore'} (Siklus ${selectedCycle})`}
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <Input
            label="Nama Paket"
            placeholder="cth: Paket A, Paket B, Paket Khusus"
            value={formData.paketName}
            onChange={(e) => setFormData({ ...formData, paketName: e.target.value })}
            required
          />

          <Input
            label="Nama Menu / Hidangan Utama"
            placeholder="cth: Nasi Kuning, Dori Bumbu Woku, Beef Teriyaki"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Deskripsi Menu & Komposisi Lauk"
            placeholder="cth: Disajikan dengan telur bumbu semur, bihun goreng, sambal"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          {/* ── Kolom Gizi ── */}
          <div className="pt-1 border-t border-neutral-100 space-y-3">
            <p className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <span>Komponen Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400">(opsional)</span>
            </p>
            <Input
              label="Karbohidrat"
              placeholder="cth: Nasi Putih, Bubur, Roti"
              value={formData.karbohidrat}
              onChange={(e) => setFormData({ ...formData, karbohidrat: e.target.value })}
            />
            <Input
              label="Protein"
              placeholder="cth: Ayam Goreng, Ikan Dori"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
            />
            <Input
              label="Nabati"
              placeholder="cth: Tempe Bacem, Tahu Goreng"
              value={formData.nabati}
              onChange={(e) => setFormData({ ...formData, nabati: e.target.value })}
            />
            <Input
              label="Protein Tambahan"
              placeholder="cth: Telur Rebus, Keju"
              value={formData.proteinTambahan}
              onChange={(e) => setFormData({ ...formData, proteinTambahan: e.target.value })}
            />
            <Input
              label="Sayur"
              placeholder="cth: Tumis Kangkung, Sop Wortel"
              value={formData.sayur}
              onChange={(e) => setFormData({ ...formData, sayur: e.target.value })}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsAddModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Tambah Menu
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title={`Edit Menu Paket - Siklus ${selectedCycle}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Input
            label="Nama Paket"
            placeholder="cth: Paket A, Paket B"
            value={formData.paketName}
            onChange={(e) => setFormData({ ...formData, paketName: e.target.value })}
            required
          />

          <Input
            label="Nama Menu / Hidangan Utama"
            placeholder="cth: Nasi Kuning, Dori Bumbu Woku"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Deskripsi Menu & Komposisi Lauk"
            placeholder="cth: Disajikan dengan telur bumbu semur, bihun goreng"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          {/* ── Kolom Gizi ── */}
          <div className="pt-1 border-t border-neutral-100 space-y-3">
            <p className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <span>Komponen Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400">(opsional)</span>
            </p>
            <Input
              label="Karbohidrat"
              placeholder="cth: Nasi Putih, Bubur, Roti"
              value={formData.karbohidrat}
              onChange={(e) => setFormData({ ...formData, karbohidrat: e.target.value })}
            />
            <Input
              label="Protein"
              placeholder="cth: Ayam Goreng, Ikan Dori"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
            />
            <Input
              label="Nabati"
              placeholder="cth: Tempe Bacem, Tahu Goreng"
              value={formData.nabati}
              onChange={(e) => setFormData({ ...formData, nabati: e.target.value })}
            />
            <Input
              label="Protein Tambahan"
              placeholder="cth: Telur Rebus, Keju"
              value={formData.proteinTambahan}
              onChange={(e) => setFormData({ ...formData, proteinTambahan: e.target.value })}
            />
            <Input
              label="Sayur"
              placeholder="cth: Tumis Kangkung, Sop Wortel"
              value={formData.sayur}
              onChange={(e) => setFormData({ ...formData, sayur: e.target.value })}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Menu"
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3 text-danger-900">
            <AlertCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Apakah Anda yakin ingin menghapus menu ini?</p>
              <p className="text-neutral-600 mt-1">
                Menu <strong>"{selectedItem?.name}"</strong> ({selectedItem?.paketName}) dari Siklus {selectedCycle} akan dihapus secara permanen.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Ya, Hapus Menu</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
}

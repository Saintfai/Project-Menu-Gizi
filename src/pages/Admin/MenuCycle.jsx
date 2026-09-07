import { useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
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
  Sparkles
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

export default function MenuCycle() {
  const activeCycle = getMenuCycleByDate();
  const [selectedCycle, setSelectedCycle] = useState(activeCycle);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [currentMealTime, setCurrentMealTime] = useState('PAGI');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    paketName: 'Paket A',
    name: '',
    description: '',
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

  // Handle Open Add Modal
  const handleOpenAdd = (mealTime) => {
    setCurrentMealTime(mealTime);
    // Suggest next paket name based on existing count
    const existing = menuItems.filter((m) => m.mealTime === mealTime);
    const nextLetter = String.fromCharCode(65 + existing.length); // A, B, C...
    setFormData({
      paketName: `Paket ${nextLetter}`,
      name: '',
      description: '',
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
    });
    setIsEditModalOpen(true);
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Submit Add
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama menu wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      await createMenuItem({
        cycleId: selectedCycle,
        mealTime: currentMealTime,
        paketName: formData.paketName.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      toast.success('Menu baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      loadCycleItems(selectedCycle);
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Gagal menambahkan menu baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama menu wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateMenuItem(selectedItem.id, {
        paketName: formData.paketName.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
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
    const isPagi = mealTime === 'PAGI';
    const isSiang = mealTime === 'SIANG';

    const bgBadge = isPagi ? 'bg-amber-50 text-amber-700 border-amber-200' : isSiang ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
    const iconWrapper = isPagi ? 'bg-amber-100/70 text-amber-600' : isSiang ? 'bg-sky-100/70 text-sky-600' : 'bg-indigo-100/70 text-indigo-600';
    const tagBorder = isPagi ? 'border-amber-200 bg-amber-50/50 text-amber-800' : isSiang ? 'border-sky-200 bg-sky-50/50 text-sky-800' : 'border-indigo-200 bg-indigo-50/50 text-indigo-800';

    return (
      <div className="bg-neutral-0 rounded-xl border border-neutral-200 shadow-xs flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-sm">
        {/* Column Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${iconWrapper}`}>
              {icon}
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">{title}</h2>
              <p className="text-xs text-neutral-500 font-medium">
                {items.length} Paket Tersedia
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bgBadge}`}>
            Siklus {selectedCycle}
          </span>
        </div>

        {/* Column Body - Items List */}
        <div className="p-4 sm:p-5 flex-1 space-y-3.5 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <p className="text-xs font-medium text-neutral-500">Memuat menu...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 px-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-700">Belum Ada Menu</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                Belum ada hidangan yang diatur untuk {title.toLowerCase()} pada Siklus {selectedCycle}.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-primary-300 hover:shadow-xs transition-all duration-200 space-y-2.5"
              >
                {/* Header Paket + Actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${tagBorder}`}>
                    {item.paketName || 'Paket'}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit Menu"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dish Name */}
                <h3 className="font-bold text-neutral-900 text-sm leading-snug">
                  {item.name}
                </h3>

                {/* Description / Detail Lauk */}
                {item.description && (
                  <div className="text-xs text-neutral-600 bg-neutral-50/90 rounded-lg p-2.5 border border-neutral-100 leading-relaxed font-normal">
                    {item.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Column Footer - Add Button */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/30">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => handleOpenAdd(mealTime)}
            className="border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50/50 hover:text-primary-700 text-neutral-600 text-xs font-semibold py-2 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah {title}</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Kelola Siklus Menu
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar dan konfigurasi paket makanan pasien berdasarkan siklus gizi (Siklus 1 - 11).
          </p>
        </div>

        {/* Active Cycle Badge & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-50/70 border border-sky-200 rounded-lg text-slate-800 text-sm font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Siklus Aktif Hari Ini: <strong>Siklus {activeCycle}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => loadCycleItems(selectedCycle, true)}
            disabled={isRefreshing || isLoading}
            className="p-2 bg-white border border-neutral-200 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg shadow-xs transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cycle Selector & Permanent Info Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Cycle Selector Dropdown */}
        <div className="flex items-center gap-3 shrink-0 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-xs">
          <label htmlFor="cycle-select" className="text-sm font-bold text-slate-700 select-none whitespace-nowrap pl-1">
            Pilih Siklus:
          </label>
          <div className="relative">
            <select
              id="cycle-select"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(Number(e.target.value))}
              className="appearance-none bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-300 rounded-lg pl-3.5 pr-9 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer transition-colors min-w-[170px]"
            >
              {Array.from({ length: 11 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  Siklus {c} {c === 11 ? '(Khusus Tgl 31)' : ''} {c === activeCycle ? '★ Aktif' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#e8f1fd] border-l-4 border-primary-600 rounded-r-xl text-slate-800 text-sm shadow-xs">
          <Info className="w-5 h-5 text-primary-600 shrink-0" />
          <p className="leading-snug text-xs sm:text-sm text-slate-700">
            Sistem otomatis menerapkan paket menu dari <strong>Siklus {selectedCycle}</strong> untuk pemesanan pasien. Anda dapat mengubah detail menu atau menambah paket baru melalui tombol di bawah.
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
          <Sun className="w-5 h-5" />,
          'amber'
        )}

        {/* Makan Siang */}
        {renderMealColumn(
          'Makan Siang',
          siangItems,
          'SIANG',
          <Utensils className="w-5 h-5" />,
          'sky'
        )}

        {/* Makan Malam / Sore */}
        {renderMealColumn(
          'Makan Sore / Malam',
          soreItems,
          'SORE',
          <Moon className="w-5 h-5" />,
          'indigo'
        )}
      </div>

      {/* ================= MODAL: TAMBAH MENU ================= */}
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
            rows={3}
          />

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
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Tambah Menu</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EDIT MENU ================= */}
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
            rows={3}
          />

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
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
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
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileText, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// Komponen tabel rekapitulasi pesanan pasien terintegrasi (mendukung pagination, rincian paket, alergi, dan modal catatan)
export const OrdersTable = ({ 
  data = [], 
  onNoteClick, 
  className = '', 
  onMealClick,
  pageSize: controlledPageSize,
  onPageSizeChange,
  currentPage: controlledCurrentPage,
  onPageChange,
  pageSizeOptions = [10, 20, 50, 'ALL'],
}) => {
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  const isControlledPageSize = controlledPageSize !== undefined;
  const pageSize = isControlledPageSize ? controlledPageSize : internalPageSize;

  // Tangani perubahan batas jumlah baris per halaman
  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    if (!isControlledPageSize) {
      setInternalPageSize(newSize);
    }
    handlePageChange(1);
  };

  const isControlledCurrentPage = controlledCurrentPage !== undefined;
  const currentPage = isControlledCurrentPage ? controlledCurrentPage : internalCurrentPage;

  // Tangani navigasi pindah halaman tabel
  const handlePageChange = (newPage) => {
    const pageNum = typeof newPage === 'function' ? newPage(currentPage) : newPage;
    if (onPageChange) {
      onPageChange(pageNum);
    }
    if (!isControlledCurrentPage) {
      setInternalCurrentPage(pageNum);
    }
  };

  const totalItems = data.length;
  const isAll = pageSize === 'ALL';
  const numericPageSize = isAll ? Math.max(1, totalItems) : Number(pageSize) || 10;
  const totalPages = isAll || totalItems === 0 ? 1 : Math.ceil(totalItems / numericPageSize);

  // Sesuaikan nomor halaman jika melebihi total halaman yang tersedia
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handlePageChange(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = isAll ? 0 : (currentPage - 1) * numericPageSize;
  const endIndex = isAll ? totalItems : Math.min(startIndex + numericPageSize, totalItems);

  const paginatedData = useMemo(() => {
    if (isAll) return data;
    return data.slice(startIndex, endIndex);
  }, [data, isAll, startIndex, endIndex]);

  const startRecord = totalItems === 0 ? 0 : startIndex + 1;
  const endRecord = endIndex;

  // Hitung deret nomor halaman pagination dengan penyingkat ellipsis (...)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // Render sel kolom waktu makan dengan notasi pemisah '/' (porsi) dan '|' (Paket Utama vs Ekstra)
  const renderMealCell = (items, mealTime, row) => {
    if (!items || items.length === 0) {
      return <span className="text-neutral-400 font-normal">-</span>;
    }

    const includeItems = items.filter(i => (i.type || 'INCLUDE').toUpperCase() === 'INCLUDE');
    const excludeItems = items.filter(i => (i.type || '').toUpperCase() === 'EXCLUDE');

    const formatGroup = (group, isExclude) => {
      if (group.length === 0) return null;
      
      return group.map((item, idx) => {
        const rawName = item.menuName || item.paketName || 'Menu';
        let name = typeof rawName === 'string' ? rawName.trim() : rawName;
        if (item.quantity > 1) {
            name = `${name} ${item.quantity}x`;
        }

        return (
          <React.Fragment key={item.id || idx}>
            <span
              onClick={(e) => {
                 e.stopPropagation();
                 if (onMealClick) {
                     onMealClick(row, mealTime, [item]);
                 }
              }}
              className={`${isExclude ? 'font-semibold text-success-700 cursor-pointer hover:text-success-800 hover:underline align-middle m-0.5' : 'font-semibold text-primary-700 cursor-pointer hover:text-primary-800 hover:underline align-middle m-0.5'} transition-colors`}
            >
              {name}
            </span>
            {idx < group.length - 1 && <span className="text-neutral-300 font-normal mx-1">/</span>}
          </React.Fragment>
        );
      });
    };

    const includeElems = formatGroup(includeItems, false);
    const excludeElems = formatGroup(excludeItems, true);

    return (
      <div className="text-xs leading-relaxed whitespace-normal break-words">
        {includeElems}
        {includeElems && excludeElems && <span className="text-neutral-400 font-bold mx-1.5 align-middle">|</span>}
        {excludeElems}
      </div>
    );
  };

  return (
    <div className={`w-full bg-white mb-8 overflow-hidden ${className}`} style={{ border: '1px solid #9ca3af' }}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 text-center w-12" style={{ border: '1px solid #9ca3af' }}>NO</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 w-28" style={{ border: '1px solid #9ca3af' }}>NO. RM</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900" style={{ border: '1px solid #9ca3af' }}>PASIEN</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 w-24" style={{ border: '1px solid #9ca3af' }}>KAMAR</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900" style={{ border: '1px solid #9ca3af' }}>MAKAN PAGI</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900" style={{ border: '1px solid #9ca3af' }}>MAKAN SIANG</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900" style={{ border: '1px solid #9ca3af' }}>MAKAN SORE</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 text-left w-32" style={{ border: '1px solid #9ca3af' }}>BENTUK MAKANAN</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 text-center w-20" style={{ border: '1px solid #9ca3af' }}>CATATAN</th>
            </tr>
          </thead>
          <tbody>
            {totalItems === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-neutral-500 bg-white" style={{ border: '1px solid #9ca3af' }}>
                  Belum ada data pesanan masuk untuk jadwal penyajian ini.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const displayRm = row.rmNumber || (row.pasienRM?.match(/\(([^)]+)\)/)?.[1]) || (row.pasienRM?.startsWith('RM') ? row.pasienRM : '-');
                const displayName = row.patientName || row.pasienRM?.replace(/\s*\([^)]*\)/, '') || row.pasienRM || '-';
                const rowNumber = startIndex + index + 1;

                return (
                  <tr key={row.id || index} className="hover:bg-neutral-100 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-neutral-900 text-center align-top font-medium" style={{ border: '1px solid #9ca3af' }}>
                      {rowNumber}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-primary-700 align-top" style={{ border: '1px solid #9ca3af' }}>
                      <div>{displayRm}</div>
                      {row.noReg && (
                        <div className="text-[10px] text-neutral-500 font-normal mt-0.5">
                          Reg: {row.noReg}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 min-w-[200px] align-top" style={{ border: '1px solid #9ca3af' }}>
                      <div className="flex items-start gap-1.5 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-normal break-words">
                        {row.hasAllergy && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-danger-600 flex-shrink-0 mt-1 inline-block"
                            title={row.allergyNote ? `Alergi: ${row.allergyNote}` : 'Riwayat Alergi'}
                          />
                        )}
                        <span className="leading-tight">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 align-top" style={{ border: '1px solid #9ca3af' }}>
                      {row.kamar}
                    </td>
                    <td className="px-3 py-2.5 min-w-[150px] max-w-[250px] align-top whitespace-normal break-words" style={{ border: '1px solid #9ca3af' }}>
                      {renderMealCell(row.itemsPagi, 'PAGI', row)}
                    </td>
                    <td className="px-3 py-2.5 min-w-[150px] max-w-[250px] align-top whitespace-normal break-words" style={{ border: '1px solid #9ca3af' }}>
                      {renderMealCell(row.itemsSiang, 'SIANG', row)}
                    </td>
                    <td className="px-3 py-2.5 min-w-[150px] max-w-[250px] align-top whitespace-normal break-words" style={{ border: '1px solid #9ca3af' }}>
                      {renderMealCell(row.itemsSore, 'SORE', row)}
                    </td>
                    <td className="px-3 py-2.5 text-left align-top" style={{ border: '1px solid #9ca3af' }}>
                      <span className="font-medium text-xs text-neutral-700">{row.bentukMakananText || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center align-top" style={{ border: '1px solid #9ca3af' }}>
                      <button 
                        type="button"
                        onClick={() => row.hasCatatan && onNoteClick && onNoteClick(row)}
                        className={`p-1.5 rounded-md transition-colors ${row.hasCatatan ? 'text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer border border-primary-200' : 'text-neutral-300 cursor-default'}`}
                        disabled={!row.hasCatatan}
                        aria-label={row.hasCatatan ? `Lihat catatan ${displayName}` : 'Tidak ada catatan'}
                        title={row.hasCatatan ? 'Lihat catatan khusus' : 'Tidak ada catatan'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Pagination Controls */}
      <div 
        className="px-4 py-2.5 bg-neutral-100 border-t border-neutral-400 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs" 
        style={{ borderTop: '1px solid #9ca3af' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-neutral-700">
            Menampilkan <strong className="text-neutral-900 font-bold">{startRecord}-{endRecord}</strong> dari <strong className="text-neutral-900 font-bold">{totalItems}</strong> pesanan pasien
          </span>

          <div className="flex items-center gap-1.5 border-l border-neutral-300 pl-3">
            <span className="text-neutral-600 font-medium text-[11px]">Tampilkan:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  handlePageSizeChange(val);
                }}
                className="h-7 appearance-none bg-white border border-neutral-300 rounded pl-2 pr-6 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-2xs"
                title="Pilih jumlah baris per halaman"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'ALL' ? 'Semua' : `${opt} Baris`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pagination Navigation */}
        {!isAll && totalPages > 1 ? (
          <div className="flex items-center gap-1 self-end md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => handlePageChange((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 h-7 px-2 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-1.5 text-neutral-400 font-semibold select-none">
                      ...
                    </span>
                  );
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[26px] h-7 px-1.5 flex items-center justify-center rounded text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 shadow-2xs'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 h-7 px-2 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              title="Halaman berikutnya"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-neutral-500 font-medium text-[11px]">
            Instalasi Gizi & Dietetik RS Edelweiss
          </span>
        )}
      </div>
    </div>
  );
};

OrdersTable.propTypes = {
  data: PropTypes.array,
  onNoteClick: PropTypes.func,
  className: PropTypes.string,
  onMealClick: PropTypes.func,
  pageSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPageSizeChange: PropTypes.func,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSizeOptions: PropTypes.array,
};

export default OrdersTable;


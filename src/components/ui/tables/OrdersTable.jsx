/**
 * NAMA FILE: OrdersTable.jsx
 * FUNGSI UTAMA: Komponen UI Tabel untuk menyajikan data dalam bentuk baris dan kolom.
 * 
 * DETAIL:
 * - Mendukung penampilan daftar data yang terstruktur.
 * - Mengatur tampilan kolom dan sel data secara proporsional.
 */
import React from 'react';
import PropTypes from 'prop-types';

export const OrdersTable = ({ data = [], onNoteClick, className = '' }) => {
  // Helper to format meal string nicely with PRD delimiters
  const renderMealCell = (mealStr) => {
    if (!mealStr || mealStr === '-') {
      return <span className="text-neutral-400 font-normal">-</span>;
    }

    if (typeof mealStr !== 'string') {
      return <span>{String(mealStr)}</span>;
    }

    
    if (mealStr.includes('|')) {
      const [includePart, excludePart] = mealStr.split('|').map((s) => s.trim());
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {includePart && (
            <span className={includePart === '-' ? 'text-neutral-400 font-normal' : 'font-semibold text-primary-700'}>
              {includePart}
            </span>
          )}
          <span className="text-neutral-300 font-bold px-0.5">|</span>
          {excludePart && (
            <span className="font-semibold text-success-700 bg-success-50 px-1.5 py-0.5 rounded text-[11px] border border-success-200/60">
              {excludePart}
            </span>
          )}
        </div>
      );
    }

    return <span className="font-semibold text-primary-700">{mealStr}</span>;
  };

  return (
    <div className={`w-full bg-neutral-0 rounded-xl border border-neutral-200 overflow-hidden shadow-sm ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-neutral-500 uppercase bg-primary-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3.5 font-semibold">NO</th>
              <th className="px-4 py-3.5 font-semibold">NO. RM</th>
              <th className="px-4 py-3.5 font-semibold">PASIEN</th>
              <th className="px-4 py-3.5 font-semibold">KAMAR</th>
              <th className="px-4 py-3.5 font-semibold">MAKAN PAGI</th>
              <th className="px-4 py-3.5 font-semibold">MAKAN SIANG</th>
              <th className="px-4 py-3.5 font-semibold">MAKAN SORE</th>
              <th className="px-4 py-3.5 font-semibold">TANGGAL & WAKTU</th>
              <th className="px-4 py-3.5 font-semibold text-center">CATATAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-neutral-400">
                  Belum ada data pesanan masuk.
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const displayRm = row.rmNumber || (row.pasienRM?.match(/\(([^)]+)\)/)?.[1]) || (row.pasienRM?.startsWith('RM') ? row.pasienRM : '-');
                const displayName = row.patientName || row.pasienRM?.replace(/\s*\([^)]*\)/, '') || row.pasienRM || '-';

                return (
                  <tr key={row.id || index} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-4 text-neutral-900">{index + 1}</td>
                    <td className="px-4 py-4 text-xs font-semibold text-primary-700">
                      {displayRm}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        {row.hasAllergy && (
                          <div className="w-4 h-4 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0" title={row.allergyNote || 'Riwayat Alergi'}>
                            <div className="w-2 h-2 rounded-full bg-danger-600"></div>
                          </div>
                        )}
                        <span>{displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-neutral-600">
                      {row.kamar}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        {renderMealCell(row.makanPagi)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        {renderMealCell(row.makanSiang)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        {renderMealCell(row.makanSore || row.makanMalam)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-800">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0"></div>
                        <span>{row.tanggalBesok || row.tanggalWaktuPengantaran}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        type="button"
                        onClick={() => row.hasCatatan && onNoteClick && onNoteClick(row)}
                        className={`p-1.5 rounded-md transition-colors ${row.hasCatatan ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 cursor-pointer' : 'text-neutral-300 cursor-default'}`}
                        disabled={!row.hasCatatan}
                        aria-label={row.hasCatatan ? `Lihat catatan ${displayName}` : 'Tidak ada catatan'}
                        title={row.hasCatatan ? 'Lihat catatan khusus' : 'Tidak ada catatan'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="px-4 py-3 bg-primary-50 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600">
          Menampilkan <strong className="text-neutral-900">{data.length}</strong> pesanan pasien
        </span>
        <span className="text-xs text-neutral-500 font-medium">
          Dapur Gizi RS Edelweiss
        </span>
      </div>
    </div>
  );
};

OrdersTable.propTypes = {
  data: PropTypes.array,
  onNoteClick: PropTypes.func,
  className: PropTypes.string,
};

export default OrdersTable;

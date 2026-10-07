import React from 'react';
import PropTypes from 'prop-types';

export const OrdersTable = ({ data = [], onNoteClick, className = '', onMealClick }) => {
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
      <div className="text-xs leading-relaxed">
        {includeElems}
        {includeElems && excludeElems && <span className="text-neutral-300 font-bold mx-1.5 align-middle">|</span>}
        {excludeElems}
      </div>
    );
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
              <th className="px-4 py-3.5 font-semibold text-center">BENTUK MAKANAN</th>
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
                    <td className="px-4 py-4 min-w-[140px] max-w-[180px] whitespace-normal">
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
                    <td className="px-4 py-4 min-w-[120px] max-w-[200px] whitespace-normal">
                      <div className="text-xs">
                        {renderMealCell(row.itemsPagi, 'PAGI', row)}
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-[120px] max-w-[200px] whitespace-normal">
                      <div className="text-xs">
                        {renderMealCell(row.itemsSiang, 'SIANG', row)}
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-[120px] max-w-[200px] whitespace-normal">
                      <div className="text-xs">
                        {renderMealCell(row.itemsSore, 'SORE', row)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center font-semibold text-xs text-neutral-600">
                        <span>{row.bentukMakananText || '-'}</span>
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

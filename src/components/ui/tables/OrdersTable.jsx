import React from 'react';
import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';

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
              className={`${isExclude ? 'font-semibold text-success-700 bg-success-50 px-1.5 py-0.5 rounded text-[11px] border border-success-200/60 inline-block align-middle cursor-pointer hover:bg-success-100 m-0.5' : 'font-semibold text-primary-700 cursor-pointer hover:text-primary-800 hover:underline align-middle m-0.5'} transition-colors`}
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
        {!includeElems && excludeElems && (
          <>
            <span className="text-neutral-400 font-normal mr-1">-</span>
            <span className="text-neutral-400 font-bold mr-1.5 align-middle">|</span>
          </>
        )}
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
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 text-center w-32" style={{ border: '1px solid #9ca3af' }}>BENTUK MAKANAN</th>
              <th className="px-3 py-3 text-xs font-bold text-neutral-900 text-center w-20" style={{ border: '1px solid #9ca3af' }}>CATATAN</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-neutral-500 bg-white" style={{ border: '1px solid #9ca3af' }}>
                  Belum ada data pesanan masuk untuk jadwal penyajian ini.
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const displayRm = row.rmNumber || (row.pasienRM?.match(/\(([^)]+)\)/)?.[1]) || (row.pasienRM?.startsWith('RM') ? row.pasienRM : '-');
                const displayName = row.patientName || row.pasienRM?.replace(/\s*\([^)]*\)/, '') || row.pasienRM || '-';

                return (
                  <tr key={row.id || index} className="hover:bg-neutral-100 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-neutral-900 text-center align-top font-medium" style={{ border: '1px solid #9ca3af' }}>
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-primary-700 align-top" style={{ border: '1px solid #9ca3af' }}>
                      {displayRm}
                    </td>
                    <td className="px-3 py-2.5 min-w-[200px] align-top" style={{ border: '1px solid #9ca3af' }}>
                      <div className="flex items-start gap-1.5 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-normal break-words">
                        {row.hasAllergy && (
                          <div className="w-3.5 h-3.5 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5" title={row.allergyNote || 'Riwayat Alergi'}>
                            <div className="w-2 h-2 rounded-full bg-danger-600"></div>
                          </div>
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
                    <td className="px-3 py-2.5 text-center align-top" style={{ border: '1px solid #9ca3af' }}>
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
      
      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-neutral-100 border-t border-neutral-400 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #9ca3af' }}>
        <span className="font-medium text-neutral-700">
          Total: <strong className="text-neutral-900 font-bold">{data.length}</strong> pesanan pasien terdata
        </span>
        <span className="text-neutral-600 font-medium">
          Instalasi Gizi & Dietetik RS Edelweiss
        </span>
      </div>
    </div>
  );
};

OrdersTable.propTypes = {
  data: PropTypes.array,
  onNoteClick: PropTypes.func,
  className: PropTypes.string,
  onMealClick: PropTypes.func,
};

export default OrdersTable;


import React from 'react';
import PropTypes from 'prop-types';
import { Table } from './Table';

export const OrdersTable = ({ data = [], onNoteClick, className = '' }) => {
  return (
    <div className={`bg-neutral-0 rounded-xl border border-neutral-200 overflow-hidden shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-neutral-500 uppercase bg-primary-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 font-semibold">NO</th>
              <th className="px-4 py-3 font-semibold">PASIEN</th>
              <th className="px-4 py-3 font-semibold">KAMAR</th>
              <th className="px-4 py-3 font-semibold">MAKAN PAGI</th>
              <th className="px-4 py-3 font-semibold">MAKAN SIANG</th>
              <th className="px-4 py-3 font-semibold">MAKAN MALAM</th>
              <th className="px-4 py-3 font-semibold">MENU TAMBAHAN</th>
              <th className="px-4 py-3 font-semibold">TANGGAL & WAKTU</th>
              <th className="px-4 py-3 font-semibold text-center">CATATAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.map((row, index) => (
              <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-4 text-neutral-900">{index + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    {row.hasAllergy && (
                      <div className="w-4 h-4 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></div>
                      </div>
                    )}
                    {row.pasienRM}
                  </div>
                </td>
                <td className="px-4 py-4 text-xs font-medium text-neutral-600">
                  {row.kamar}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1 text-primary-600 text-xs font-semibold">
                    {row.makanPagi.map((menu, i) => <span key={i}>{menu}</span>)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1 text-primary-600 text-xs font-semibold">
                    {row.makanSiang.map((menu, i) => <span key={i}>{menu}</span>)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1 text-primary-600 text-xs font-semibold">
                    {row.makanMalam.map((menu, i) => <span key={i}>{menu}</span>)}
                  </div>
                </td>
                <td className="px-4 py-4 text-neutral-600 text-xs">
                  {row.menuTambahan || '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold text-primary-700">
                      <div className="w-0.5 h-3 bg-primary-600 rounded-full"></div>
                      {row.tanggalWaktuPesanan}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-neutral-400">
                      <div className="w-0.5 h-3 bg-neutral-300 rounded-full"></div>
                      {row.tanggalWaktuPengantaran}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button 
                    onClick={() => row.hasCatatan && onNoteClick && onNoteClick(row)}
                    className={`p-1.5 rounded-md transition-colors ${row.hasCatatan ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 cursor-pointer' : 'text-neutral-300 cursor-default'}`}
                    disabled={!row.hasCatatan}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination */}
      <div className="px-4 py-3 bg-primary-50 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Page 1 of 20</span>
        <div className="flex items-center gap-4 text-neutral-400">
          <button className="hover:text-neutral-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="hover:text-neutral-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

OrdersTable.propTypes = {
  data: PropTypes.array,
  className: PropTypes.string,
};

export default OrdersTable;

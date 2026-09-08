import React from 'react';
import PropTypes from 'prop-types';

export const NoteDetailContent = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header Box */}
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase">PASIEN</div>
            <div className="text-sm font-semibold text-neutral-900">{data.pasienRM}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-neutral-500 uppercase">KAMAR</div>
            <div className="text-sm font-semibold text-neutral-900">{data.kamar}</div>
          </div>
        </div>
        
        {data.hasAllergy && data.allergyNote && (
          <div className="bg-danger-50 border border-danger-200 p-2.5 rounded text-danger-700 flex gap-2 items-start">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="text-[10px] font-bold uppercase mb-0.5">Catatan Alergi & Pantangan</div>
              <div className="text-xs">{data.allergyNote}</div>
            </div>
          </div>
        )}
      </div>

      {/* Order Level Special Note (PRD 3.2 / FR-007) */}
      <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-amber-900">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Catatan Khusus Pesanan
        </div>
        <div className="text-xs font-medium text-neutral-800">
          {data.notes || data.catatan || 'Tidak ada catatan khusus.'}
        </div>
      </div>

      {/* Rincian Menu */}
      <div className="divide-y divide-neutral-100 text-sm">
        <div className="py-2.5 flex justify-between items-center text-xs">
          <span className="font-bold text-primary-700">Makan Pagi:</span>
          <span className="text-neutral-700 font-medium">{data.makanPagi || data.menuPagiText || '-'}</span>
        </div>
        <div className="py-2.5 flex justify-between items-center text-xs">
          <span className="font-bold text-primary-700">Makan Siang:</span>
          <span className="text-neutral-700 font-medium">{data.makanSiang || data.menuSiangText || '-'}</span>
        </div>
        <div className="py-2.5 flex justify-between items-center text-xs">
          <span className="font-bold text-primary-700">Makan Malam:</span>
          <span className="text-neutral-700 font-medium">{data.makanMalam || data.menuMalamText || '-'}</span>
        </div>
      </div>
    </div>
  );
};

NoteDetailContent.propTypes = {
  data: PropTypes.object,
};

export default NoteDetailContent;

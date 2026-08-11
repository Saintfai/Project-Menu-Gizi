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

      {/* Meal Notes */}
      <div className="divide-y divide-neutral-100 text-sm">
        {/* Makan Pagi */}
        <div className="py-3 flex gap-4">
          <div className="w-1/3">
            <div className="font-bold text-primary-700 text-xs mb-0.5">Makan Pagi</div>
            <div className="text-[10px] text-neutral-500 leading-tight">{data.menuPagiText || '-'}</div>
          </div>
          <div className="w-2/3 text-xs text-neutral-700">{data.notePagi || '-'}</div>
        </div>
        
        {/* Makan Siang */}
        <div className="py-3 flex gap-4">
          <div className="w-1/3">
            <div className="font-bold text-primary-700 text-xs mb-0.5">Makan Siang</div>
            <div className="text-[10px] text-neutral-500 leading-tight">{data.menuSiangText || '-'}</div>
          </div>
          <div className="w-2/3 text-xs text-neutral-700">{data.noteSiang || '-'}</div>
        </div>

        {/* Makan Malam */}
        <div className="py-3 flex gap-4">
          <div className="w-1/3">
            <div className="font-bold text-primary-700 text-xs mb-0.5">Makan Malam</div>
            <div className="text-[10px] text-neutral-500 leading-tight">{data.menuMalamText || '-'}</div>
          </div>
          <div className="w-2/3 text-xs text-neutral-700">{data.noteMalam || '-'}</div>
        </div>

        {/* Menu Tambahan */}
        <div className="py-3 flex gap-4 items-start">
          <div className="w-1/3">
            <div className="font-bold text-primary-700 text-xs mb-0.5">Menu Tambahan</div>
            <div className="text-[10px] text-neutral-500 leading-tight">{data.menuTambahanText || '-'}</div>
          </div>
          <div className="w-2/3 text-xs text-neutral-700 flex justify-between items-start">
            <span>{data.noteTambahan || '-'}</span>
            {data.statusTambahan === 'Sudah Dikirim' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Sudah Dikirim
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NoteDetailContent.propTypes = {
  data: PropTypes.object,
};

export default NoteDetailContent;

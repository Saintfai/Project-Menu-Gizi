import React from 'react';
import Button from '../buttons/Button';

export const DeletePackageContent = () => {
  return (
    <div className="p-6 flex flex-col gap-6 bg-neutral-0 rounded-xl">
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 text-danger-600">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        </div>
        <div className="pt-1">
          <h3 className="font-bold text-neutral-900 text-lg mb-2">Hapus Paket C dari Siklus 6?</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Paket akan tidak tampil pada pemilihan menu pasien. Riwayat pesanan sebelumnya tetap tersimpan.
          </p>
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 mt-2">
        <Button variant="outline" className="px-6 py-2 border-neutral-200">
          Batal
        </Button>
        <Button variant="danger" className="px-6 py-2">
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default DeletePackageContent;

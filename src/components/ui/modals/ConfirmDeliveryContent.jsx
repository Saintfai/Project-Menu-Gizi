import React from 'react';
import Button from '../buttons/Button';

export const ConfirmDeliveryContent = () => {
  return (
    <div className="p-6 flex flex-col gap-6 bg-neutral-0 rounded-xl">
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 text-success-600 mt-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 text-lg mb-1">Konfirmasi Pengiriman</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Apakah Anda yakin pesanan ini sudah dikirim?<br/>
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-2">
        <Button variant="outline" className="px-6 py-2 border-neutral-200">Batal</Button>
        <button className="px-6 py-2 font-semibold text-sm rounded-md bg-success-100 text-success-700 hover:bg-success-200 transition-colors border border-transparent outline-none">
          Ya, Sudah Dikirim
        </button>
      </div>
    </div>
  );
};

export default ConfirmDeliveryContent;

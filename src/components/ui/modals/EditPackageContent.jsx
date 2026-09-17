import React from 'react';
import Button from '../buttons/Button';
import { Input } from '../forms/Input';

export const EditPackageContent = () => {
  return (
    <div className="flex flex-col bg-neutral-0 rounded-xl shadow-md border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="font-bold text-neutral-900 text-lg">Edit Paket Menu</h3>
      </div>
      <div className="p-6 space-y-5">
        <Input 
          label="Nama Paket" 
          defaultValue="Paket A" 
        />
        <Input 
          label="URL Image" 
          defaultValue="https://image1.com" 
        />
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700">Daftar Menu</label>
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-sm text-neutral-700 font-medium">Bubur Ayam Spesial</span>
            <button className="text-danger-500 hover:text-danger-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-sm text-neutral-700 font-medium">Teh Hangat</span>
            <button className="text-danger-500 hover:text-danger-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <button className="w-full py-3.5 mt-2 border-2 border-dashed border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tambah Menu
          </button>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-neutral-200 flex justify-end items-center gap-3 rounded-b-xl bg-neutral-0">
        <Button variant="outline" className="px-6 py-2 border-neutral-200">
          Batal
        </Button>
        <Button variant="primary" className="px-6 py-2">
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
};

export default EditPackageContent;

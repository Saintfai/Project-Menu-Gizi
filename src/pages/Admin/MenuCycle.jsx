import React, { useState } from 'react';
import { RotateCw, ChevronDown, Info, Sun, Utensils, Moon } from 'lucide-react';
import { getMenuCycleByDate } from '../../utils/cycleHelper';

export default function MenuCycle() {
  const activeCycle = getMenuCycleByDate();
  const [selectedCycle, setSelectedCycle] = useState(activeCycle);

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Siklus Menu
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Atur menu makanan berdasarkan siklus yang berlaku.
          </p>
        </div>

        {/* Active Cycle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50/50 border border-sky-200 rounded-lg text-slate-800 text-sm font-semibold shadow-xs self-start sm:self-auto">
          <RotateCw className="w-4 h-4 text-primary-600" />
          <span>Siklus Aktif: Siklus {activeCycle}</span>
        </div>
      </div>

      {/* Cycle Selector & Permanent Info Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Cycle Selector Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="cycle-select" className="text-sm font-medium text-slate-700 select-none whitespace-nowrap">
            Pilih Siklus:
          </label>
          <div className="relative">
            <select
              id="cycle-select"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer shadow-xs min-w-[140px]"
            >
              {Array.from({ length: 11 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  Siklus {c} {c === 11 ? '(Tgl 31)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#e8f1fd] border-l-4 border-primary-600 rounded-r-lg text-slate-800 text-sm">
          <Info className="w-5 h-5 text-primary-600 shrink-0" />
          <p className="leading-snug">
            Sistem otomatis menggunakan menu permanen dari siklus ini. Perubahan hanya perlu disimpan jika Anda mengganti atau mengedit paket.
          </p>
        </div>
      </div>

      {/* Cycle Content Overview per Meal Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Makan Pagi */}
        <div className="bg-neutral-0 rounded-xl border border-neutral-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-neutral-900">Makan Pagi</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              Siklus {selectedCycle}
            </span>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 text-center text-sm text-neutral-500">
            Daftar paket Makan Pagi untuk Siklus {selectedCycle}
          </div>
        </div>

        {/* Makan Siang */}
        <div className="bg-neutral-0 rounded-xl border border-neutral-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <Utensils className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-neutral-900">Makan Siang</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
              Siklus {selectedCycle}
            </span>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 text-center text-sm text-neutral-500">
            Daftar paket Makan Siang untuk Siklus {selectedCycle}
          </div>
        </div>

        {/* Makan Malam */}
        <div className="bg-neutral-0 rounded-xl border border-neutral-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-neutral-900">Makan Malam</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
              Siklus {selectedCycle}
            </span>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 text-center text-sm text-neutral-500">
            Daftar paket Makan Malam untuk Siklus {selectedCycle}
          </div>
        </div>
      </div>
    </div>
  );
}

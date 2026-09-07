import React from 'react';
import { Sun, Utensils, Moon, PlusCircle } from 'lucide-react';
import RekapCard from '../../components/ui/cards/RekapCard';
import OrdersTable from '../../components/ui/tables/OrdersTable';

export default function Dashboard() {
  return (
    <div className="space-y-6 w-full">
      {/* 4 Card Widget Informasi (Polosan / Default 0) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {/* Makan Pagi */}
        <RekapCard
          title="Makan Pagi"
          icon={<Sun className="w-4 h-4 text-amber-500" />}
          total={0}
          totalLabel="Total Porsi"
          details={[
            { label: 'Paket A', value: 0 },
            { label: 'Paket B', value: 0 }
          ]}
        />

        {/* Makan Siang */}
        <RekapCard
          title="Makan Siang"
          icon={<Utensils className="w-4 h-4 text-primary-600" />}
          total={0}
          totalLabel="Total Porsi"
          details={[
            { label: 'Paket A', value: 0 },
            { label: 'Paket B', value: 0 }
          ]}
        />

        {/* Makan Malam */}
        <RekapCard
          title="Makan Malam"
          icon={<Moon className="w-4 h-4 text-indigo-600" />}
          total={0}
          totalLabel="Total Porsi"
          details={[
            { label: 'Paket A', value: 0 },
            { label: 'Paket B', value: 0 }
          ]}
        />

        {/* Paket Ekstra */}
        <RekapCard
          title="Ekstra"
          icon={<PlusCircle className="w-4 h-4 text-emerald-600" />}
          total={0}
          totalLabel="Total Item"
          details={[
            { label: '0 Jenis Menu', value: 0 }
          ]}
        />
      </section>

      {/* Tabel Rekapitulasi Pesanan (Full Width & Responsif) */}
      <section className="w-full">
        <OrdersTable data={[]} />
      </section>
    </div>
  );
}

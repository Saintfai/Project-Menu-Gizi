# 📚 Dokumentasi Database - Sistem Menu Gizi RS Edelweiss

Dokumen ini berisi penjelasan lengkap mengenai struktur tabel (Data Dictionary) yang digunakan pada aplikasi pemesanan menu gizi. Skema database dibangun menggunakan **PostgreSQL** dan dikelola melalui **Prisma ORM**.

> **Catatan Autentikasi Admin:** Sesuai PRD v1.6, Dashboard Admin tidak memerlukan tabel akun database (`Admin`). Autentikasi staf dapur menggunakan verifikasi satu password hardcode melalui Environment Variable aplikasi.

---

## 🏗️ 1. Tabel Master Data

Tabel-tabel ini berisi data dasar yang dikelola oleh Admin Gizi untuk konten siklus menu.

### 1.1. `MenuCycle`
Menyimpan data Siklus Menu (11 hari). Sesuai PRD, penentuan menu per hari bergantung pada tanggal berjalan (tanggal 1-10, 11-20, 21-30 berulang ke siklus 1-10, khusus tanggal 31 ke siklus 11).

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | Int (PK) | Nomor siklus menu (bernilai 1 sampai 11). |
| `description`| String | Penjelasan singkat siklus (misal: "Siklus Menu 1"). |

### 1.2. `MenuItem`
Katalog makanan yang tersedia pada tiap siklus. Semua makanan (baik jatah gratis/Include maupun Paket Ekstra/Exclude) dikelola di tabel ini.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik setiap item menu. |
| `name` | String | Nama makanan (misal: "Nasi Tim Ayam", "Puding Cokelat"). |
| `cycleId` | Int (FK) | Relasi ke `MenuCycle`. Menandakan menu ini keluar di siklus hari ke-berapa (1-11). |
| `mealTime`| Enum | Jadwal sajian makanan. Pilihan: `PAGI`, `SIANG`, `SORE`. |
| `paketName`| String? | Nama pengelompokan paket (opsional). Contoh: "PAKET A", "PAKET B". |
| `createdAt`| DateTime | Waktu saat menu ditambahkan ke sistem. |
| `updatedAt`| DateTime | Waktu terakhir data menu diubah. |

---

## 🛒 2. Tabel Transaksional

Tabel-tabel ini menyimpan data operasional harian yang dinamis, seperti data pasien masuk dan pesanan mereka.

### 2.1. `Patient`
Data identitas dan kondisi pasien. Data ini **di-fetch dari API SIMRS** saat login/onboarding menggunakan No. RM (atau Nama + Tgl Lahir), kemudian disimpan/disinkronkan ke sistem ini sebagai referensi pemesanan.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID internal sistem untuk pasien. |
| `rmNumber`| String (Unique)| Nomor Rekam Medis (kunci login utama). |
| `name` | String | Nama lengkap pasien. |
| `dob` | DateTime | Tanggal lahir pasien (digunakan untuk validasi login alternatif). |
| `phone` | String? | Nomor telepon pasien atau keluarga pendamping (opsional). |
| `roomName`| String | Nama/nomor kamar pasien yang ditarik dari SIMRS. |
| `roomClass`| String | Kelas kamar saat login (misal: VIP A, Kelas 1). Sangat penting untuk validasi kuota porsi harian. |
| `allergies`| String? | Catatan riwayat alergi yang dikonfirmasi pasien (PRD FR-002). |
| `medicalConditions`| String?| Penyakit atau kondisi medis khusus yang berdampak pada pembatasan diet. |
| `createdAt`| DateTime | Waktu pertama kali pasien login ke aplikasi. |

### 2.2. `Order`
Tabel Induk Pesanan (Keranjang / Checkout). Mewakili satu sesi transaksi pemesanan oleh satu pasien.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik untuk pesanan (Nomor Transaksi). |
| `patientId`| String (FK) | Relasi ke tabel `Patient` (pemilik pesanan). |
| `roomNumber`| String | **(Snapshot)** Nomor kamar tempat pesanan ini harus diantar. (Disimpan tersendiri agar riwayat tetap konsisten bila pasien pindah kamar di kemudian hari). |
| `classType`| String | **(Snapshot)** Kelas kamar saat checkout (VIP A / Non-VIP). Untuk validasi kuota porsi. |
| `status` | Enum | Status pemesanan: `CART` (masih dalam keranjang, dapat diedit) atau `CHECKOUT` (sudah konfirmasi ke dapur; **final, tidak dapat diedit/dibatalkan**). |
| `notes` | String? | **Catatan khusus pesanan** (1 kolom per transaksi checkout, mencakup seluruh item dalam pesanan). |
| `createdAt`| DateTime | Waktu keranjang dibuat. |
| `checkoutAt`| DateTime? | Waktu pasti kapan tombol checkout ditekan oleh pasien. |

### 2.3. `OrderItem`
Tabel Rincian Pesanan. Mewakili setiap item hidangan/paket yang ada di dalam sebuah pesanan.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik rincian pesanan. |
| `orderId` | String (FK) | Relasi ke `Order` (nomor pesanan induk). |
| `menuName`| String | **(Snapshot)** Nama makanan yang dipesan saat checkout. |
| `paketName`| String? | **(Snapshot)** Nama paket makanan saat dipesan (jika ada). |
| `menuItemId`| String? (FK) | Relasi ke `MenuItem`. Bersifat opsional (SetNull jika master menu dihapus, data struk tetap aman berkat snapshot). |
| `type` | Enum | Penanda jenis paket: `INCLUDE` (Paket Utama ranap gratis) atau `EXCLUDE` (Paket Ekstra berbayar). |
| `consumer`| Enum | Penanda konsumen: `PASIEN` atau `PENDAMPING`. |
| `quantity`| Int | Jumlah porsi yang dipesan. |
| `servingDate`| DateTime| Tanggal penyajian/pengantaran makanan (**seluruh pesanan diantarkan besok / T+1**, baik Include maupun Ekstra). |
| `servingTime`| String | Waktu/sesi makan (`PAGI`, `SIANG`, atau `SORE`). Catatan: Paket Ekstra hanya tersedia untuk `SIANG` dan `SORE`. |
| `isDelivered`| Boolean | Penanda status pengantaran di dashboard dapur (default: `false`). Menandai selesai mengubah baris menjadi hijau. |
| `billingStatus`| Enum | Status integrasi tagihan Paket Ekstra ke API Billing SIMRS: `PENDING`, `SYNCED`, atau `FAILED`. |

---

## 🏷️ 3. Tipe Enumerasi (Enum)
Kumpulan nilai tetap untuk integritas data:

- **`MealTime`**: `PAGI`, `SIANG`, `SORE`
- **`OrderStatus`**: `CART` (dapat diedit di keranjang), `CHECKOUT` (terkonfirmasi, final / no edit no cancel)
- **`OrderType`**: `INCLUDE` (Paket Utama / Ranap Include), `EXCLUDE` (Paket Ekstra / Berbayar)
- **`Consumer`**: `PASIEN`, `PENDAMPING`
- **`BillingStat`**: `PENDING` (Menunggu sinkronisasi), `SYNCED` (Berhasil masuk billing SIMRS), `FAILED` (Gagal kirim ke API RS)

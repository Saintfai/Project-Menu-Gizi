# 📚 Dokumentasi Database - Sistem Menu Gizi RS Edelweiss

Dokumen ini berisi penjelasan lengkap mengenai struktur tabel (Data Dictionary) yang digunakan pada aplikasi pemesanan menu gizi. Skema database dibangun menggunakan **PostgreSQL** (Supabase) dan dikelola melalui **Prisma ORM**.

> **Catatan Autentikasi Admin:** Sesuai PRD v1.6, Dashboard Admin tidak memerlukan tabel akun database (`Admin`). Autentikasi staf dapur menggunakan verifikasi satu password hardcode melalui Environment Variable aplikasi.
>
> **Catatan Keranjang Pasien:** Keranjang belanja dikelola sepenuhnya di sisi pengguna via `sessionStorage` (tanpa menulis ke DB saat memilih menu). Data baru masuk ke tabel `Order` saat pasien menekan tombol **Checkout**.

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
| `name` | String | Nama makanan (misal: "Nasi Tim Ayam", "Chicken Schnitzel"). |
| `description`| String? | Detail isi menu / lauk pauk (misal: "Rolade tahu, bobor bayam"). |
| `cycleId` | Int (FK) | Relasi ke `MenuCycle`. Menandakan menu ini keluar di siklus hari ke-berapa (1-11). |
| `mealTime`| Enum | Jadwal sajian makanan. Pilihan: `PAGI`, `SIANG`, `SORE`. |
| `paketName`| String? | Nama pengelompokan paket (opsional). Contoh: "Paket A", "Paket B". |
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
Tabel Pemesanan (Flat Table / Denormalized Transaction). Setiap menu yang dipesan dicatat sebagai 1 baris di tabel ini, dan baris-baris dari satu sesi checkout dikelompokkan menggunakan kode `orderCode` yang sama.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik setiap baris pesanan item. |
| `orderCode` | String | **Kode Grup Transaksi** (misal: `ORD-20260908-001`). Menyatukan seluruh item yang di-checkout bersamaan oleh pasien. |
| `patientId` | String (FK) | Relasi ke tabel `Patient` (pemilik pesanan). |
| `roomNumber` | String | **(Snapshot)** Nomor kamar tempat pesanan ini harus diantar. |
| `classType` | String | **(Snapshot)** Kelas kamar saat checkout (VIP A / Non-VIP). |
| `menuName` | String | **(Snapshot)** Nama makanan yang dipesan (misal: "Nasi Uduk"). Tersimpan permanen meski master menu diubah. |
| `paketName` | String? | **(Snapshot)** Nama paket (misal: "Paket A", "Paket B"). |
| `mealTime` | Enum (`MealTime`) | Sesi makan (`PAGI`, `SIANG`, atau `SORE`). |
| `servingDate` | DateTime | Tanggal penyajian/pengantaran makanan (**seluruh pesanan diantarkan besok / T+1**). |
| `quantity` | Int | Jumlah porsi yang dipesan (default: 1). |
| `type` | Enum (`OrderType`) | Jenis paket: `INCLUDE` (jatah ranap gratis) atau `EXCLUDE` (Paket Ekstra berbayar). |
| `consumer` | Enum (`Consumer`) | Penanda konsumen: `PASIEN` atau `PENDAMPING`. |
| `notes` | String? | **Catatan khusus pesanan** (disimpan per transaksi checkout, mencakup instruksi diet/khusus ke dapur). |
| `createdAt` | DateTime | Waktu transaksi checkout dicatat ke sistem. |

---

## 🏷️ 3. Tipe Enumerasi (Enum)
Kumpulan nilai tetap untuk integritas data:

- **`MealTime`**: `PAGI`, `SIANG`, `SORE`
- **`OrderType`**: `INCLUDE` (Paket Utama / Ranap Include), `EXCLUDE` (Paket Ekstra / Berbayar)
- **`Consumer`**: `PASIEN`, `PENDAMPING`

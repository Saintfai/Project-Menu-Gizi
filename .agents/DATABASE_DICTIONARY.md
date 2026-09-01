# 📚 Dokumentasi Database - Sistem Menu Gizi RS Edelweiss

Dokumen ini berisi penjelasan lengkap mengenai struktur tabel (Data Dictionary) yang digunakan pada aplikasi pemesanan menu gizi. Skema database dibangun menggunakan **PostgreSQL** dan dikelola melalui **Prisma ORM**.

---

## 🏗️ 1. Tabel Master Data

Tabel-tabel ini berisi data dasar yang jarang berubah, dikelola langsung oleh Admin Gizi.

### 1.1. `Admin`
Menyimpan data akun petugas gizi/dapur yang memiliki hak akses untuk masuk ke Dashboard Admin.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik untuk setiap akun admin. |
| `email` | String (Unique)| Alamat email / username untuk login. |
| `name` | String | Nama lengkap petugas/admin. |
| `password`| String | Kata sandi (terenkripsi) untuk otentikasi. |
| `role` | String | Peran admin (default: `admin`). Saat ini semua staf dapur punya level akses yang sama (PRD 6). |
| `createdAt`| DateTime | Waktu saat akun dibuat. |
| `updatedAt`| DateTime | Waktu saat data akun terakhir diubah. |

### 1.2. `MenuCycle`
Menyimpan data Siklus Menu (11 hari). Sesuai PRD, penentuan menu per hari bergantung pada tanggal berjalan (tanggal 1-10, 11-20, 21-30, khusus 31 ke siklus 11).

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | Int (PK) | Nomor siklus menu (hanya boleh bernilai 1 sampai 11). |
| `description`| String | Penjelasan singkat siklus (misal: "Siklus Menu Minggu Pertama"). |

### 1.3. `MenuItem`
Katalog makanan yang tersedia. Semua makanan (baik jatah gratis/Include maupun jajan/Exclude) digabung di tabel ini.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik setiap item menu. |
| `name` | String | Nama makanan (misal: "Nasi Tim Ayam", "Puding Cokelat"). |
| `cycleId` | Int (FK) | Relasi ke `MenuCycle`. Menandakan menu ini keluar di siklus hari ke-berapa. |
| `mealTime`| Enum | Jadwal sajian makanan. Pilihan: `PAGI`, `SIANG`, `SORE`. |
| `paketName`| String? | Nama pengelompokan paket (opsional). Contoh: "PAKET A", "PAKET B". Digunakan untuk mengelompokkan menu agar rapi seperti pada data Excel. |
| `createdAt`| DateTime | Waktu saat menu ditambahkan ke sistem. |
| `updatedAt`| DateTime | Waktu terakhir data menu diubah. |

---

## 🛒 2. Tabel Transaksional

Tabel-tabel ini menyimpan data operasional harian yang dinamis, seperti data pasien masuk dan pesanan mereka.

### 2.1. `Patient`
Data identitas dan kondisi pasien. Data ini **di-fetch dari API SIMRS** saat login menggunakan No. RM, kemudian disimpan ke sistem ini sebagai referensi pesanan.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID internal sistem untuk pasien. |
| `rmNumber`| String (Unique)| Nomor Rekam Medis (kunci login utama). |
| `name` | String | Nama lengkap pasien. |
| `dob` | DateTime | Tanggal lahir pasien (digunakan untuk validasi login alternatif). |
| `phone` | String? | Nomor telepon pasien atau keluarga pendamping (opsional). |
| `roomName`| String | Nama/nomor kamar pasien yang ditarik dari SIMRS. |
| `roomClass`| String | Kelas kamar saat login (misal: VIP A, Kelas 1). Sangat penting untuk menghitung kuota porsi harian. |
| `allergies`| String? | Catatan riwayat alergi yang dikonfirmasi pasien (PRD FR-002). |
| `medicalConditions`| String?| Penyakit atau kondisi medis khusus yang berdampak pada larangan makanan. |
| `createdAt`| DateTime | Waktu pertama kali pasien login ke aplikasi. |

### 2.2. `Order`
Tabel Induk Pesanan (Keranjang). Mewakili satu kali proses *checkout* oleh satu pasien. Konsepnya seperti "Kepala Struk" kasir.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik untuk pesanan (Nomor Struk). |
| `patientId`| String (FK) | Relasi ke tabel `Patient` (pemilik pesanan). |
| `roomNumber`| String | **(Snapshot)** Nomor kamar tempat pesanan ini harus diantar. (Disimpan tersendiri agar riwayat tidak berubah bila pasien pindah kamar besoknya). |
| `classType`| String | **(Snapshot)** Kelas kamar saat checkout (VIP/Non-VIP). Untuk validasi kuota porsi. |
| `status` | Enum | Status pemesanan: `CART` (masih pilih-pilih) atau `CHECKOUT` (sudah konfirmasi ke dapur). |
| `notes` | String? | Catatan instruksi khusus untuk dapur (berlaku untuk 1 pesanan utuh). |
| `createdAt`| DateTime | Waktu keranjang dibuat. |
| `checkoutAt`| DateTime? | Waktu pasti (Timestamp) kapan tombol checkout ditekan oleh pasien. |

### 2.3. `OrderItem`
Tabel Rincian Pesanan. Mewakili setiap makanan individu yang ada di dalam sebuah keranjang/struk.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik rincian pesanan. |
| `orderId` | String (FK) | Relasi ke `Order` (Berada di struk yang mana). |
| `menuName`| String | **(Snapshot)** Nama makanan yang dipesan. Mencatat permanen agar aman meski menu dihapus. |
| `paketName`| String? | **(Snapshot)** Nama paket makanan saat dipesan (jika ada). |
| `menuItemId`| String? (FK) | Relasi ke `MenuItem`. Bersifat opsional. Jika menu master di-Hard Delete, nilainya menjadi `null` tetapi data struk tetap utuh berkat Snapshot. |
| `type` | Enum | Penanda: `INCLUDE` (jatah gratis RS) atau `EXCLUDE` (jajan berbayar). |
| `consumer`| Enum | Penanda siapa yang akan makan: `PASIEN` atau `PENDAMPING`. |
| `quantity`| Int | Jumlah porsi yang dipesan. |
| `servingDate`| DateTime| Tanggal makanan harus diantar (H+1 untuk Include, Hari H untuk Exclude). |
| `servingTime`| String | Jam/waktu spesifik pengantaran. |
| `isDelivered`| Boolean | Tombol centang penyelesaian pengantaran di dashboard dapur (default: `false`). |
| `billingStatus`| Enum | Status integrasi tagihan menu Ekstra ke API Billing SIMRS: `PENDING`, `SYNCED`, atau `FAILED`. |

---

## 🏷️ 3. Tipe Enumerasi (Enum)
Kumpulan nilai tetap yang tidak bisa diisi dengan kata lain (menghindari typo).

- **`MealTime`**: `PAGI`, `SIANG`, `SORE`
- **`OrderStatus`**: `CART`, `CHECKOUT` 
- **`OrderType`**: `INCLUDE` (Fasilitas Rawat Inap), `EXCLUDE` (Pesanan Luar/A La Carte)
- **`Consumer`**: `PASIEN`, `PENDAMPING`
- **`BillingStat`**: `PENDING` (Menunggu dikirim), `SYNCED` (Berhasil masuk tagihan), `FAILED` (Gagal ke API RS)

# Project Rules: Hospital Dietary System PRD

**PRODUCT REQUIREMENT DOCUMENT (PRD)**

**Application Food Ordering & Nutrition Management System (Hospital Dietary System)**

  ----------------------------------- -----------------------------------
  **Dokumen Versi**                   1.2
  **Status**                          Approved / Ready for Development
                                      --- Revisi Kelengkapan
  **Perubahan dari v1.1**             Menambahkan Alur Pengguna, aturan
                                      onboarding data medis, kontrol
                                      akses berbasis kondisi pasien,
                                      sistem keranjang, manajemen siklus
                                      menu, integrasi eksternal, dan Out
                                      of Scope.
  ----------------------------------- -----------------------------------

**1. Ringkasan Produk & Tujuan**

Sistem Pemesanan dan Pemantauan Makanan Rumah Sakit adalah solusi
digital berbasis Web/QR yang memfasilitasi pasien rawat inap dalam
memesan paket makanan gizi harian serta menu ekstra/jajan secara
mandiri. Sistem ini secara real-time mengonsolidasikan dan menyalurkan
data pemesanan ke Dashboard Dapur Gizi untuk mempermudah operasional
produksi, rekapitulasi bahan, dan efisiensi pengiriman makanan di rumah
sakit.

**Tujuan Utama**

-   Memangkas proses manual pencatatan menu gizi harian oleh dietisien
    atau pramusaji.
-   Mencegah kesalahan distribusi makanan dengan menyajikan informasi
    identitas pasien, lokasi kamar, riwayat alergi, serta catatan khusus
    per menu.
-   Menyediakan data rekapitulasi kebutuhan porsi/paket gizi secara
    otomatis dan instan (real-time summary) di dapur gizi.
-   Menyajikan visualisasi penjadwalan pengantaran yang ringkas dalam
    satu tampilan kolom terintegrasi untuk tim gizi.
-   Mencegah pasien memesan menu yang bertentangan dengan kondisi medis
    atau status puasa (NPO) melalui kontrol akses berbasis kondisi
    pasien.

**2. Target Pengguna (User Personas)**

-   Pasien / Penunggu Pasien: Memesan paket makanan harian dan menu
    ekstra/jajan, sesuai kondisi medis yang diizinkan.
-   Tim Gizi / Dapur (Kitchen & Dietary Staff): Memantau pesanan masuk,
    melihat rekap total paket per waktu makan, mengelola konten siklus
    menu, mengatur akses pemesanan per ruangan, dan mengelola
    operasional penyiapan makanan via Dashboard Admin.

**3. Ketentuan & Aturan Bisnis (Business Rules)**

**3.1. Autentikasi & Identitas Pasien**

-   Pasien mengakses aplikasi melalui pemindaian QR Code yang ada di
    ruang rawat inap.
-   Pasien memasukkan kunci pencarian awal berupa Nomor RM ATAU gabungan
    Nama Pasien & Tanggal Lahir.
-   Saat proses login/verifikasi berhasil, sistem menarik (fetch) data
    pasien secara otomatis dari sistem eksisting rumah sakit, termasuk
    riwayat alergi dan riwayat/kondisi penyakit yang relevan dengan
    pembatasan diet.
-   Data yang ditarik tersebut ditampilkan pada halaman Onboarding
    sebagai langkah konfirmasi sebelum pasien diarahkan masuk ke
    aplikasi pemesanan. Pasien meninjau data ini (tidak mengetik ulang
    dari nol) dan dapat mengoreksi bila ada ketidaksesuaian.
-   Sistem menampilkan form verifikasi identitas pada onboarding (dapat
    dikoreksi manual jika data belum lengkap/tidak sinkron):
    -   Nomor RM
    -   Nama Pasien
    -   Tanggal Lahir
    -   Ruangan / Kelas Kamar
    -   Nomor Telepon
    -   Riwayat Alergi (Wajib diisi/dikonfirmasi, diisi "Tidak Ada" jika
        nihil)
    -   Kondisi/Diagnosa relevan yang memengaruhi pembatasan menu (jika
        tersedia dari data eksisting)

  -----------------------------------------------------------------------
  **Dependensi:** *Fitur ini bergantung pada API data pasien yang
  disediakan oleh sistem eksisting rumah sakit (lihat Bagian 7 ---
  Integrasi Eksternal).*
  -----------------------------------------------------------------------

**3.2. Pemesanan Paket Utama (Ranap Include)**

-   Jadwal Pemesanan: Pesan hari ini (T) untuk penyajian besok (T+1).
-   Batas Waktu (Cut-Off Time): Pemesanan Paket Utama maksimal pukul
    15:00 WIB. Lewat dari pukul 15:00 WIB, pemesanan paket utama
    ditutup.
-   Batas Frekuensi: Pemesanan Paket Utama hanya dapat dilakukan 1 kali
    per hari untuk jadwal besok.
-   Logika Siklus Menu (11 Siklus):
    -   Tanggal 1--10: Siklus Menu 1--10
    -   Tanggal 11--20: Berulang ke Siklus Menu 1--10
    -   Tanggal 21--30: Berulang ke Siklus Menu 1--10
    -   Tanggal 31: Khusus Siklus Menu 11
-   Batas Kuota Porsi (Qty) Paket Utama:
    -   Kelas VIP A ke Atas (VIP A, VVIP, Suite): Maksimal 2 porsi per
        waktu makan (Pagi: 2, Siang: 2, Malam: 2).
    -   Kelas VIP B ke Bawah (VIP B, Kelas 1, 2, 3): Pagi: 2 porsi,
        Siang: 1 porsi, Malam: 1 porsi.
-   Menu Default: Jika pasien tidak menyelesaikan pemesanan Paket Utama
    sebelum cut-off time (15:00 WIB), sistem otomatis menetapkan Menu
    Default yang mengikuti Siklus Menu berjalan pada tanggal tersebut,
    sesuai kelas kamar pasien, sehingga pasien tetap menerima makanan
    tanpa perlu input manual.
-   Ketentuan Catatan Menu Utama & Ekstra:
    -   Setiap item menu (baik Menu Utama maupun Menu Ekstra) mendukung
        fasilitas pencatatan khusus.
    -   Jika pasien memesan 2 porsi pada menu yang sama, sistem
        menyediakan 1 kolom catatan khusus untuk menu tersebut.
    -   Jika pasien memesan 2 menu yang berbeda, masing-masing menu
        memiliki kolom catatan terpisah.

**3.3. Pemesanan Ekstra / Jajan / A la Carte**

-   Dapat dipesan kapan saja (tidak dibatasi pukul 15:00 WIB) dan dapat
    dilakukan berkali-kali.
-   Memiliki inputan Jadwal Waktu Penyajian (tanggal dan jam penyajian
    yang disesuaikan oleh pasien).
-   Skema Pembayaran: Seluruh tagihan pesanan ekstra otomatis dimasukkan
    ke dalam Hospital Billing / Tagihan Kamar Pasien melalui integrasi
    API real-time (lihat Bagian 7).

**3.4. Kontrol Akses Pemesanan Berbasis Penempatan QR Code (Proses
Operasional, di Luar Sistem)**

Pembatasan akses pemesanan untuk pasien dengan kondisi medis khusus
TIDAK ditangani melalui logika/fitur di dalam sistem, melainkan murni
melalui proses operasional fisik oleh Admin Gizi.

-   QR Code/barcode pemesanan hanya ditempelkan oleh Admin Gizi di
    ruangan-ruangan pasien yang memang diperbolehkan memesan mandiri.
-   Untuk pasien dengan kondisi khusus yang tidak boleh mengonsumsi menu
    tertentu secara mandiri (misalnya kondisi yang mengharuskan
    pengaturan makan ketat oleh tenaga medis), Admin Gizi cukup tidak
    menempelkan/menyediakan QR Code di ruangan tersebut.
-   Dengan demikian, pasien di ruangan tanpa QR Code secara praktis
    tidak memiliki cara untuk mengakses aplikasi pemesanan sama sekali
    --- bukan karena sistem menolak aksesnya, tetapi karena tidak ada QR
    Code yang bisa dipindai.
-   Sistem tidak perlu menyimpan, mengelola, atau memeriksa status
    "boleh/tidak boleh memesan" untuk suatu ruangan atau pasien; kontrol
    ini sepenuhnya berada di luar aplikasi (proses manual Admin Gizi
    saat menempel/melepas QR Code fisik di ruangan).

**3.5. Mekanisme Keranjang (Cart) & Pengeditan Pesanan**

Pemesanan Paket Utama maupun Ekstra menggunakan pola keranjang belanja
(cart), bukan transaksi langsung sekali submit.

-   Setiap item menu yang dipilih pasien masuk ke keranjang terlebih
    dahulu, sebelum pasien melakukan checkout untuk mengonfirmasi
    pesanan.
-   Selama item masih berada di keranjang (belum checkout), pasien dapat
    mengubah pilihan menu, jumlah porsi, maupun catatan khusus secara
    bebas.
-   Setelah checkout, pesanan berpindah status menjadi terkonfirmasi dan
    diteruskan ke Dashboard Dapur. Pada tahap ini pesanan tidak dapat
    dibatalkan (no cancel).
-   Pesanan yang sudah checkout tetap dapat diedit (misalnya perubahan
    menu atau catatan) selama masih memenuhi ketentuan lain yang berlaku
    (contoh: cut-off time untuk Paket Utama), namun tidak dapat
    dihapus/dibatalkan seluruhnya.

**3.6. Perubahan Status Pasien (Discharge / Pindah Kelas Kamar)**

  -----------------------------------------------------------------------
  **Asumsi Default:** *Poin ini menggunakan aturan default awal berikut
  dan perlu dikonfirmasi lebih lanjut bersama tim gizi/operasional
  sebelum development dimulai.*
  -----------------------------------------------------------------------

-   Discharge (pasien pulang): Akun/akses pemesanan pasien dinonaktifkan
    secara manual oleh Admin Gizi setelah menerima status pulang dari
    sistem eksisting rumah sakit. Pesanan yang belum diantarkan pada
    tanggal berjalan tetap menjadi bagian rekap dapur sampai ditandai
    selesai atau dibatalkan manual oleh Admin.
-   Pindah Kelas Kamar: Kuota porsi Paket Utama menyesuaikan otomatis ke
    kelas kamar terbaru pada pemesanan berikutnya (T+1), berdasarkan
    data kamar terkini dari sistem eksisting. Pesanan yang sudah
    checkout sebelum perpindahan tidak diubah retroaktif.

**3.7. Manajemen Siklus Menu oleh Admin Gizi**

-   Struktur jumlah siklus bersifat tetap, yaitu 11 Siklus Menu,
    mengikuti logika pemetaan tanggal pada Bagian 3.2.
-   Admin Gizi dapat mengubah konten/isi menu pada setiap siklus (nama
    menu, komponen menu) melalui Dashboard Admin, tanpa mengubah jumlah
    maupun logika pemetaan siklusnya.

**3.8. Aturan Tampilan Dashboard Admin / Dapur**

-   Kolom Tanggal Pengantaran Terintegrasi: Tabel dashboard memiliki 1
    kolom khusus tanggal & waktu pengantaran yang memuat hingga 2 tipe
    jadwal sekaligus:
    -   Jadwal Pengantaran Masakan Utama (Pengantaran Besok / T+1).
    -   Jadwal & Jam Pengantaran Ekstra/Jajan (Jam & Tanggal spesifik
        permintaan pasien).
-   Modul Catatan Berbasis Tombol Pop-up / Modal: Catatan tidak
    ditampilkan langsung sebagai teks panjang di tabel utama, melainkan
    dalam bentuk tombol interaktif (misal: \[Lihat Catatan\]). Saat
    tombol dipencet, sistem menampilkan modal/pop-up yang berisi seluruh
    catatan dari menu utama maupun menu ekstra yang dipesan pasien
    tersebut.
-   Status Pengantaran Ekstra/Jajan: Berlaku khusus untuk pesanan
    Ekstra/Jajan (tidak berlaku untuk Paket Utama). Admin Dapur menandai
    pesanan sebagai selesai diantarkan melalui satu tombol aksi. Tidak
    ada label status tertulis yang ditampilkan; baris pesanan yang telah
    selesai diantarkan ditandai secara visual dengan latar warna hijau
    pada tabel.

**4. Alur Pengguna (User Flow)**

**4.1. Alur Pasien --- Pemesanan Paket Utama & Ekstra**

  -----------------------------------------------------------------------
  **Catatan:** *Tidak ada langkah pengecekan status akses di dalam
  sistem. QR Code hanya tersedia secara fisik di ruangan pasien yang
  memang diperbolehkan memesan (lihat Bagian 3.4); pasien di ruangan
  tanpa QR Code otomatis tidak dapat memulai alur ini.*
  -----------------------------------------------------------------------

+----+-----------------------------------------------------------------+
| *  | **Scan QR Code di Ruangan**                                     |
| *1 |                                                                 |
| ** | Pasien/penunggu memindai QR Code pemesanan yang tersedia di     |
|    | ruangan tersebut (QR Code hanya ditempel oleh Admin Gizi di     |
|    | ruangan pasien yang diperbolehkan memesan).                     |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Input Kunci Pencarian**                                       |
| *2 |                                                                 |
| ** | Pasien memasukkan Nomor RM atau kombinasi Nama Pasien & Tanggal |
|    | Lahir.                                                          |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Fetch & Tampilkan Data Onboarding**                           |
| *3 |                                                                 |
| ** | Sistem menarik data pasien (identitas, ruangan, alergi,         |
|    | kondisi/diagnosa relevan) dari sistem eksisting rumah sakit dan |
|    | menampilkannya di halaman onboarding untuk                      |
|    | ditinjau/dikonfirmasi pasien.                                   |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Konfirmasi/Koreksi Data**                                     |
| *4 |                                                                 |
| ** | Pasien mengonfirmasi data yang tampil atau melakukan koreksi    |
|    | manual bila ada ketidaksesuaian, lalu melanjutkan ke aplikasi   |
|    | pemesanan.                                                      |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Pilih Menu & Masukkan ke Keranjang**                          |
| *5 |                                                                 |
| ** | Pasien memilih Menu Paket Utama (sesuai siklus menu & kuota     |
|    | kelas kamar) dan/atau Menu Ekstra/Jajan beserta catatan khusus; |
|    | setiap pilihan masuk ke keranjang.                              |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Edit di Keranjang (opsional)**                                |
| *6 |                                                                 |
| ** | Selama belum checkout, pasien bebas mengubah menu, porsi, atau  |
|    | catatan di keranjang.                                           |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Checkout**                                                    |
| *7 |                                                                 |
| ** | Pasien menyelesaikan pemesanan. Untuk Paket Utama, sistem       |
|    | memvalidasi cut-off time (15:00 WIB) dan batas 1x transaksi per |
|    | hari. Pesanan yang sudah checkout tidak dapat dibatalkan, namun |
|    | masih dapat diedit sesuai ketentuan yang berlaku.               |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Sinkronisasi Real-time ke Dapur & Billing**                   |
| *8 |                                                                 |
| ** | Pesanan tersinkronisasi ke Dashboard Dapur (\< 3 detik) dan,    |
|    | khusus menu Ekstra, tercatat ke sistem Billing Rumah Sakit      |
|    | melalui API real-time.                                          |
+----+-----------------------------------------------------------------+

**4.2. Alur Admin Gizi / Dapur**

+----+-----------------------------------------------------------------+
| *  | **Login Dashboard Admin**                                       |
| *1 |                                                                 |
| ** | Staf gizi/dapur masuk ke Dashboard Admin sesuai peran (role)    |
|    | masing-masing.                                                  |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Pantau Rekap Real-time**                                      |
| *2 |                                                                 |
| ** | Dashboard menampilkan rekap akumulasi porsi/paket per waktu     |
|    | makan yang diperbarui otomatis.                                 |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Tinjau Jadwal Pengantaran & Catatan**                         |
| *3 |                                                                 |
| ** | Admin melihat kolom jadwal pengantaran terintegrasi (Paket      |
|    | Utama T+1 dan Ekstra sesuai jadwal pasien) serta membuka modal  |
|    | catatan bila diperlukan.                                        |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Tandai Pesanan Ekstra Selesai**                               |
| *4 |                                                                 |
| ** | Setelah pesanan Ekstra/Jajan diantarkan, Admin menandainya      |
|    | selesai dengan satu klik; baris pesanan berubah warna hijau.    |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Kelola Konten Siklus Menu**                                   |
| *5 |                                                                 |
| ** | Admin Gizi memperbarui isi menu pada siklus 1--11 sesuai        |
|    | kebutuhan, tanpa mengubah struktur/jumlah siklus.               |
+----+-----------------------------------------------------------------+

+----+-----------------------------------------------------------------+
| *  | **Kelola Penempatan QR Code per Ruangan (di Luar Sistem)**      |
| *6 |                                                                 |
| ** | Admin Gizi menempel atau melepas QR Code fisik di ruangan       |
|    | sesuai kondisi terbaru pasien --- proses operasional manual,    |
|    | tidak melalui fitur di dalam sistem.                            |
+----+-----------------------------------------------------------------+

**5. Spesifikasi Persyaratan Fungsional (Functional Requirements)**

  -----------------------------------------------------------------------------
  **Modul**    **ID**       **Deskripsi Fitur**
  ------------ ------------ ---------------------------------------------------
  Auth & Data  **FR-001**   Sistem dapat memvalidasi pasien melalui scan QR /
                            input No. RM / Nama + Tgl Lahir.

  Auth & Data  **FR-002**   Sistem menampilkan dan menyimpan data alergi pasien
                            yang wajib dikonfirmasi sebelum pemesanan.

  Auth & Data  **FR-013**   Sistem menarik data pasien (termasuk alergi &
                            kondisi/diagnosa relevan) secara otomatis dari API
                            eksisting rumah sakit saat login, dan
                            menampilkannya pada halaman onboarding sebelum
                            pasien masuk ke aplikasi pemesanan.

  Siklus Menu  **FR-003**   Sistem menerapkan logika pemetaan otomatis tanggal
                            ke 11 Siklus Menu (tanggal mod 10 dengan perlakuan
                            khusus tanggal 31 ke Siklus 11).

  Siklus Menu  **FR-018**   Admin Gizi dapat mengelola (create/read/update)
                            konten menu pada setiap siklus (1--11) melalui
                            Dashboard Admin, tanpa mengubah jumlah/logika
                            pemetaan siklus.

  Pemesanan    **FR-004**   Sistem membatasi waktu pemesanan Paket Utama hingga
                            pukul 15:00 WIB untuk jadwal makan besok (T+1).

  Pemesanan    **FR-005**   Sistem mengunci pemesanan Paket Utama jika pasien
                            sudah pernah memesan untuk tanggal penyajian yang
                            sama (maksimal 1 kali transaksi).

  Pemesanan    **FR-006**   Sistem menerapkan kuota porsi berdasarkan kelas
                            kamar: VIP A ke atas (Pagi 2, Siang 2, Malam 2) dan
                            VIP B ke bawah (Pagi 2, Siang 1, Malam 1).

  Pemesanan    **FR-007**   Sistem menyediakan fasilitas input catatan baik
                            pada Menu Utama maupun Menu Ekstra. Menyediakan 1
                            catatan jika porsi sama, dan catatan terpisah jika
                            menu berbeda.

  Pemesanan    **FR-014**   Sistem menetapkan Menu Default otomatis mengikuti
                            siklus menu berjalan dan kelas kamar pasien,
                            apabila pasien tidak menyelesaikan pemesanan Paket
                            Utama sebelum cut-off time.

  Pemesanan    **FR-016**   Sistem menerapkan mekanisme keranjang (cart): item
                            pemesanan dapat diedit bebas sebelum checkout;
                            setelah checkout, pesanan tidak dapat dibatalkan
                            namun tetap dapat diedit sesuai ketentuan yang
                            berlaku.

  Ekstra /     **FR-008**   Sistem memfasilitasi pemesanan menu ekstra/luar
  Jajan                     ranap kapan saja dengan inputan jadwal penyajian
                            (tanggal & jam).

  Billing      **FR-009**   Sistem mencatatkan seluruh transaksi menu ekstra ke
                            skema tagihan kamar pasien (hospital billing).

  Billing      **FR-017**   Sistem terintegrasi dengan API Billing Rumah Sakit
                            secara real-time untuk mencatat setiap transaksi
                            menu ekstra.

  Dashboard    **FR-010**   Dashboard Dapur menampilkan real-time summary rekap
  Admin                     akumulasi jumlah per porsi/paket per waktu makan.

  Dashboard    **FR-011**   Dashboard Admin menampilkan 1 kolom jadwal
  Admin                     terintegrasi yang memuat Tanggal Pengantaran Menu
                            Utama (T+1) dan Tanggal/Jam Pengantaran Ekstra.

  Dashboard    **FR-012**   Dashboard Admin menyajikan kolom Catatan berupa
  Admin                     tombol aksi yang saat diklik membuka modal/pop-up
                            berisi rincian seluruh catatan menu (Utama &
                            Ekstra).

  Dashboard    **FR-019**   Dashboard Admin menyediakan tombol aksi "Selesai"
  Admin                     khusus pada baris pesanan Ekstra/Jajan; baris yang
                            telah ditandai selesai berubah warna latar menjadi
                            hijau tanpa label status tertulis. Fitur ini tidak
                            berlaku untuk Paket Utama.

  Notifikasi   **FR-020**   Sistem tidak menyediakan modul notifikasi
                            (push/email/SMS) pada versi ini, karena aplikasi
                            berbasis website.
  -----------------------------------------------------------------------------

**6. Kebutuhan Non-Fungsional (Non-Functional Requirements)**

-   Real-time Synchronization: Rekapitulasi pesanan pada dashboard gizi
    terbarui otomatis (\< 3 detik) setelah pasien menyelesaikan
    transaksi pemesanan.
-   Usability: Tampilan antarmuka pasien (mobile-friendly) dirancang
    responsif, bersih, dan berukuran font yang jelas agar mudah
    digunakan oleh pasien rawat inap. Antarmuka admin dapur menyajikan
    modal catatan yang mudah diakses tanpa merusak tata letak tabel.
-   Reliability: Sistem mampu menangani akses bersamaan pada jam-jam
    mendekati cut-off time (pukul 13:00--15:00 WIB) tanpa downtime.
-   Security & Privacy: Keamanan data pasien (identitas, alergi, kondisi
    medis) menjadi tanggung jawab API terintegrasi yang disediakan oleh
    pihak internal rumah sakit (di luar cakupan pengembangan aplikasi
    ini). Aplikasi memastikan data yang diterima dari API tersebut hanya
    diteruskan/ditampilkan sesuai kebutuhan (allergy & kondisi relevan)
    dan tidak disimpan berlebih di luar kebutuhan fungsional.
-   Role-based Access (Admin): Seluruh staf Tim Gizi/Dapur menggunakan
    level akses yang sama pada Dashboard Admin (tidak ada pembagian
    peran/permission bertingkat pada versi ini).

**7. Integrasi & Ketergantungan Eksternal**

Sistem ini bukan sistem yang berdiri sendiri (standalone); beberapa
fungsi utamanya bergantung pada integrasi dengan sistem/API yang telah
tersedia di lingkungan rumah sakit.

-   API Data Pasien (SIMRS/HIS): Sumber data identitas, riwayat alergi,
    dan kondisi/diagnosa pasien yang ditampilkan pada halaman
    onboarding. Aplikasi ini mengonsumsi (consume) data dari API
    tersebut, bukan menjadi sumber data utama (source of truth).
-   API Billing Rumah Sakit: Digunakan untuk mencatatkan transaksi menu
    Ekstra/Jajan ke tagihan kamar pasien secara real-time. Aplikasi ini
    tidak membangun sistem pembayaran sendiri.
-   Keamanan data (enkripsi, autentikasi, audit akses) pada pertukaran
    data dengan kedua API di atas berada pada tanggung jawab tim/pihak
    yang menyediakan API tersebut.

**8. Di Luar Cakupan (Out of Scope)**

-   Fitur/logika pengecekan status akses pemesanan berdasarkan kondisi
    medis pasien di dalam sistem: pembatasan akses sepenuhnya bersifat
    operasional dan fisik, melalui ada/tidaknya penempelan QR Code oleh
    Admin Gizi di ruangan pasien (lihat Bagian 3.4), bukan fitur yang
    dibangun dalam aplikasi.
-   Sistem pembayaran/payment gateway: transaksi Ekstra hanya diteruskan
    ke sistem Hospital Billing eksisting melalui API, tidak ada modul
    pembayaran yang dibangun dalam aplikasi ini.
-   Modul notifikasi (push notification, email, SMS, reminder cut-off
    time): tidak termasuk dalam cakupan karena aplikasi berbasis website
    murni.
-   Fitur pembatalan (cancel) pesanan yang sudah checkout: hanya
    tersedia fitur edit, bukan pembatalan.
-   Role/permission bertingkat pada Dashboard Admin: seluruh staf
    gizi/dapur menggunakan hak akses yang sama.
-   Status tracking bertahap (diterima → disiapkan → dikirim) untuk
    Paket Utama: status tracking hanya berlaku untuk pesanan
    Ekstra/Jajan (indikator selesai berwarna hijau).
-   Aplikasi mobile native (iOS/Android): aplikasi diakses melalui
    browser (web) via scan QR Code.
-   Fitur di luar pemesanan makanan pada aplikasi pasien (misalnya chat
    dengan dietisien, riwayat medis lengkap, dsb.): aplikasi pasien
    murni difokuskan untuk fungsi pemesanan makanan.

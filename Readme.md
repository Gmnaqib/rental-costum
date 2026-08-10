# Application System Rental Kostum (Smart & Interactive Platform)

## 1. Informasi Kelompok

- **Nama Kelompok:** Perpus Dimari
- **Nama Team:**
  - Muhammad Febriansyah
  - Gumilar Muhammad Naqib
  - Syansyan Fadhila H

## 2. Nama Project

- **Nama Project:** Rental Kostum

## 3. List Fitur Utama

### A. Fitur Unggulan (Unique Differentiators)

- **Smart Size & Fitting Estimator (Rule-Based Fitting):**
  - **Fungsi:** Memberikan rekomendasi tingkat kecocokan ukuran kostum (_Compatibility Score_) berdasarkan data atribut fisik pengguna (Tinggi, Berat Badan, Lingkar Dada/Pinggang) untuk mencegah kesalahan pemilihan ukuran.

- **Interactive Event Calendar & Advance Pre-Booking:**
  - **Masalah:** Aplikasi sewa biasa cuma bisa sewa saat ini (_real-time_). Padahal orang butuh sewa kostum untuk acara di masa depan (misal: Comic-Con bulan depan, acara sekolah minggu depan).
  - **Fitur Unik:**
    - **Tampilan Kalender Ketersediaan Unit:** User bisa melihat tanggal berapa saja unit (misal: `KST-NR-001`) tersebut _available_ atau sudah dibooking orang lain.
    - **Fitur Pre-Booking Tanggal Event:** User bisa memesan untuk tanggal spesifik di masa depan, dan sistem akan mengunci tanggal tersebut secara otomatis.
  - **Nilai Unik:** Menyelesaikan kebutuhan utama pasar rental (perencanaan event) yang tidak dimiliki oleh sistem rental biasa.

### B. Fitur Standar & Aturan Bisnis

- **Autentikasi & Multi-Role:** Login & Logout dengan pemisahan hak akses Admin dan User (Anggota).
- **Manajemen Profil:** 1 User = 1 Profil (One-to-One), user dapat mengedit data profil dan atribut fisik secara mandiri.
- **Manajemen Master Data (Admin):**
  - CRUD (Create, Read, Update, Delete) Data Unit Kostum dan User (Anggota).
  - Dukungan nama kostum sama dengan pembeda **Kode Unit** yang unik.
- **Pencarian Unit:** Pencarian katalog unit kostum berdasarkan Nama Unit.
- **Sistem Penyewaan & Pengembalian:**
  - Batas maksimal sewa 2 unit per anggota.
  - Maksimal durasi pinjam 5 hari (denda otomatis jika terlambat).
  - Pemrosesan pengembalian unit kostum dilakukan secara terpusat oleh Admin.
- **Monitoring & Riwayat:**
  - Admin dapat melihat daftar unit terpinjam dari seluruh anggota.
  - User hanya dapat melihat daftar unit yang sedang/pernah dipinjam oleh dirinya.
  - Admin dapat melihat dan mencetak (_print/export_) laporan riwayat peminjaman.
- **Validasi Data:** Validasi form input (_required_, _unique_, dll.) pada setiap transaksi dan pengelolaan data.

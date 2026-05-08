# Modul Praktikum Generator

Sistem **Modul Praktikum Generator** adalah aplikasi berbasis web modern yang dirancang khusus untuk dosen atau pengajar. Aplikasi ini mempermudah pembuatan, pengelolaan, pengeditan, pendesainan template, hingga ekspor modul praktikum akademik secara profesional.

---

## Konsep Utama Sistem

Sistem ini memiliki 2 fitur utama:
1. **Generate Modul dengan AI:** Membuat draf awal modul secara instan.
2. **Buat/Edit Modul Manual:** Menulis dan menyusun modul dari awal.

> **Catatan:** Seluruh hasil *generate* AI dapat diedit ulang sepenuhnya oleh dosen menggunakan editor modern dengan *live preview* yang berjalan secara *realtime*. Website juga dilengkapi sistem *Template Designer* tingkat lanjut layaknya Canva, Notion, atau Google Docs untuk mendesain layout dokumen.

---

## Tech Stack

Teknologi modern yang digunakan dalam pengembangan aplikasi ini:

### Frontend
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Animation:** Framer Motion

### Backend & Database
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### Editor & Rendering
- **Rich Text Editor:** TipTap / EditorJS
- **LaTeX Rendering:** KaTeX (`katex` npm package), `@tiptap/extension-mathematics` (WYSIWYG Math)
- **Icons:** Font Awesome

### Document Export & State Management
- **PDF Generator:** `pdf-lib` / `jsPDF`
- **DOCX Generator:** `docx` npm package
- **State Management:** Zustand / Context API
- **Drag & Drop:** `dnd-kit` / React DnD

---

## Design & UI/UX

Desain aplikasi berfokus pada **Modern SaaS Dashboard** dengan kriteria berikut:
- *Clean & minimal layout* dengan gaya profesional akademik.
- User friendly, *fresh*, elegan, dan responsif di seluruh perangkat (Mobile, Tablet, Desktop).
- **Font:** Inter atau Poppins.
- **Elemen UI:** *Rounded modern card*, *soft shadow*, *smooth animation*, *sticky navbar*, *responsive sidebar*.
- **Fitur UI:** *Dark mode*, *toast notification*, *confirmation modal*, *loading skeleton*, *smooth page transition*.
- **Pantangan:** Hindari penggunaan emoji pada seluruh tampilan antarmuka.

---

## Alur Sistem

1. **Login:** Dosen login ke dashboard.
2. **Pilih Metode Pembuatan:** Dosen memilih antara **Generate dengan AI** atau **Buat Manual**.
3. **Generate AI (opsional):**
   - Mengisi data: Nama mata kuliah, topik, semester, program studi, capaian pembelajaran, pilih template.
   - AI menghasilkan draf: Judul, deskripsi, tujuan, dasar teori, alat & bahan, langkah praktikum, tabel pengamatan, analisa data, tugas, kesimpulan, dan daftar pustaka.
4. **Editing Manual:**
   - Semua konten hasil AI dapat diedit, ditambah, atau dihapus *section*-nya.
   - Upload gambar/tabel dan format dokumen bebas diubah.
5. **Live Preview Realtime:**
   - *Split layout* (kiri editor, kanan *preview*).
   - Perubahan langsung terlihat di *preview* termasuk pagination, header/footer, dan daftar isi.
6. **Finalisasi:**
   - Simpan sebagai draft, publikasi modul, atau ekspor ke PDF/DOCX.

---

## Detail Fitur

### 1. Authentication & Authorization
- Login (email/password), Register akun dosen, Forgot password.
- Session management & Protected routes.
- **Role:** Admin, Dosen.

### 2. Dashboard
- Menampilkan metrik: Total modul, draft modul, modul *publish*, statistik AI *generate*, statistik ekspor, dan aktivitas terbaru.
- Komponen: *Quick action button*, *recent modules*, *modern sidebar*, *sticky navbar*.

### 3. Generate Modul AI
- Menghasilkan draf komprehensif berdasarkan *input* awal dari dosen.
- Dilengkapi dengan *loading skeleton/progress bar* yang modern.
- **Fitur lanjutan:** *Retry generate*, *generate per section*, *rewrite section*, *improve writing*, *extend content*, *summarize content*.

### 4. Manual Editor
- Mendukung fitur *rich text*: Bold, Italic, Underline, Tabel, Image Upload, Numbering, Bullet List, Code Block, Drag & Drop Image, Alignment.
- **LaTeX Formula Support:**
  - *Inline math* (`$...$`) dan *Block/display math* (`$$...$$`).
  - Auto-complete saat mengetik command LaTeX.
  - Visual symbol picker / toolbar untuk insert simbol tanpa menghafal kode.
  - Realtime rendering menggunakan KaTeX langsung di dalam editor (WYSIWYG).
  - Shortcut `Ctrl+M` untuk mode LaTeX. Error indicator jika sintaks tidak valid.

### 5. Live Preview Realtime
- Split layar: Kiri (Editor), Kanan (Live Preview Dokumen A4).
- Render *realtime* mencakup: Cover modul, header/footer, pagination otomatis, daftar isi otomatis, rendering LaTeX, page break, dan watermark.

### 6. Template Designer Advanced
- Dosen dapat membuat, mengedit, menyimpan, menduplikasi, dan *export/import* konfigurasi template layout.
- **Kustomisasi:**
  - **Cover:** Upload logo, background, typography, alignment, warna, overlay.
  - **Header/Footer:** Gambar, logo, teks dinamis, nomor halaman, watermark.
  - **Page Layout:** Margin, A4/F4, orientation, multi-column, spacing.
  - **Typography:** Pilihan font, ukuran, text alignment.
  - **Content Block Builder:** *Drag & drop block* (Teks, Heading, Image, Tabel, Quote, Formula, Equation numbering, Signature).

### 7. Save Draft & Export
- **Save Draft:** Auto-save otomatis, penyimpanan manual, dan fitur *duplicate/delete* modul.
- **Export PDF:** Output A4 yang siap cetak (print-ready) dengan layout akademik profesional. LaTeX dirender sebagai *vector graphics* agar tajam.
- **Export DOCX:** Output kompatibel dengan Microsoft Word. Formula LaTeX dikonversi ke OMML agar bisa diedit langsung di MS Word (fallback ke PNG jika OMML gagal).

### 8. Pencarian & Filter
- Search modul, filter berdasarkan mata kuliah, semester, dan dosen.
- Sort (terbaru/terlama) beserta pagination data.

---

## Struktur Dokumen Modul

Modul hasil ekspor akan mengikuti urutan baku akademik:
1. Cover
2. Kata Pengantar
3. Daftar Isi
4. Capaian Pembelajaran
5. Dasar Teori
6. Alat dan Bahan
7. Langkah Praktikum
8. Tabel Pengamatan
9. Analisa Data
10. Tugas
11. Kesimpulan
12. Daftar Pustaka

---

## Database Schema (Supabase)

Aplikasi ini menggunakan skema relasional di PostgreSQL.

- **`users`**: `id`, `name`, `email`, `role`, `created_at`
- **`modules`**: `id`, `user_id`, `module_name`, `course_name`, `lecturer_name`, `semester`, `study_program`, `content`, `template_id`, `status`, `created_at`, `updated_at`
- **`templates`**: `id`, `user_id`, `template_name`, `cover_config`, `header_config`, `footer_config`, `typography_config`, `watermark_config`, `layout_config`, `created_at`, `updated_at`
- **`exports`**: `id`, `module_id`, `export_type`, `exported_at`
- **`generated_logs`**: `id`, `user_id`, `module_id`, `generated_at`

---

## Project Structure

```text
/
├── app/          # Next.js 16 App Router (pages & layouts)
├── components/   # Reusable UI components (shadcn/ui, custom elements)
├── hooks/        # Custom React hooks
├── services/     # API calls, Supabase client integrations
├── lib/          # Helper libraries & configurations
├── utils/        # Utility functions & formatting tools
└── types/        # TypeScript type definitions
```

---

## Teknis Implementasi & Deployment

- Gunakan **TipTap** dengan **@tiptap/extension-mathematics** dan **KaTeX** untuk editor matematika yang WYSIWYG.
- Konversi DOCX formula dari LaTeX ke OMML menggunakan library khusus (`latex-to-omml` atau sejenisnya).
- State global di-handle menggunakan **Zustand**.
- Aplikasi wajib **Vercel-Ready**: siap deploy ke Vercel dengan manajemen *environment variables* yang rapi.
- Arsitektur berbasis *clean code*, modular, dan *SEO friendly*.

---

*Dokumentasi ini merupakan panduan spesifikasi dan standar kebutuhan pengembangan (Software Requirements Specification) untuk memastikan produk Modul Praktikum Generator dapat dibangun dengan optimal dan profesional.*

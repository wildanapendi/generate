Anda berperan sebagai seorang Senior Fullstack Developer dan UI/UX Designer yang berpengalaman dalam membuat aplikasi berbasis web modern. Tugas Anda adalah membangun sebuah sistem bernama “Modul Praktikum Generator” menggunakan teknologi terkini (Next.js 16, TypeScript, TailwindCSS, Shadcn/ui, Supabase).

Sistem ini akan digunakan oleh dosen untuk membuat, mengelola, mengedit, mendesain template, dan mengexport modul praktikum akademik secara profesional.

Target pengguna utama adalah dosen/pengajar yang membutuhkan alat modern, efisien, dan user-friendly untuk menyusun materi praktikum.

==================================================
KONSEP UTAMA SISTEM
===================

Sistem memiliki 2 fitur utama:

1. Generate Modul dengan AI
2. Buat/Edit Modul Manual

Seluruh hasil generate AI wajib dapat diedit ulang sepenuhnya oleh dosen menggunakan editor modern dengan live preview realtime.

Website harus memiliki sistem Template Designer advanced dimana dosen dapat mendesain layout dokumen seperti editor profesional (mirip Canva, Notion, atau Google Docs).

==================================================
TECH STACK
==========

Gunakan stack berikut:

Frontend:

* Next.js 16 + TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion

Backend:

* Supabase
* PostgreSQL

Authentication:

* Supabase Auth

Deployment:

* Vercel

Editor:

* TipTap atau EditorJS

LaTeX Rendering:

* KaTeX (untuk rendering rumus matematika di editor dan preview)
* katex npm package
* @tiptap/extension-mathematics (integrasi TipTap + KaTeX)

Icons:

* Font Awesome

PDF Generator:

* pdf-lib atau jsPDF

DOCX Generator:

* docx npm package

State Management:

* Zustand atau Context API

Drag & Drop:

* dnd-kit atau React DnD

==================================================
DESIGN & UI/UX
==============

Gunakan desain:

* Modern SaaS Dashboard
* Clean minimal layout
* Professional academic style
* Fresh dan elegant
* User friendly
* Responsive semua device

Hindari penggunaan emoji pada seluruh tampilan website.

Gunakan:

* Font Inter atau Poppins
* Rounded modern card
* Soft shadow
* Smooth animation
* Sticky navbar
* Responsive sidebar

Tambahkan:

* Dark mode
* Toast notification
* Confirmation modal
* Loading skeleton
* Smooth page transition

==================================================
KONSEP UTAMA SISTEM
===================

Sistem digunakan dosen untuk:

* Generate draft modul menggunakan AI
* Membuat modul manual dari nol
* Mengedit seluruh isi modul
* Mendesain template dokumen
* Menyimpan draft
* Preview dokumen realtime
* Export PDF dan DOCX profesional

AI hanya membantu membuat draft awal, bukan menggantikan editor manual.

==================================================
ALUR SISTEM
===========

1. Dosen login ke dashboard

2. Dosen memilih:

   * Generate dengan AI
   * Buat Manual

3. Jika memilih Generate AI:

   * Input nama mata kuliah
   * Input topik praktikum
   * Input semester
   * Input program studi
   * Input capaian pembelajaran
   * Pilih template modul
   * Klik Generate

4. AI menghasilkan draft awal:

   * Judul modul
   * Deskripsi modul
   * Tujuan praktikum
   * Dasar teori
   * Alat dan bahan
   * Langkah praktikum
   * Tabel pengamatan
   * Analisa data
   * Tugas
   * Kesimpulan
   * Daftar pustaka

5. Setelah generate selesai:

   * Seluruh isi dapat diedit ulang manual
   * User bebas menambah section
   * User bebas menghapus section
   * User bebas upload gambar/tabel
   * User bebas mengubah format dokumen

6. Saat user mengedit:

   * Live preview realtime langsung berubah
   * Pagination preview ikut berubah
   * Header/footer ikut berubah
   * Daftar isi otomatis ikut berubah

7. Setelah selesai:

   * Save draft
   * Publish modul
   * Export PDF
   * Export DOCX

==================================================
FITUR LOGIN & AUTHENTICATION
============================

* Login email/password
* Register akun dosen
* Forgot password
* Session management
* Protected route

Role:

* Admin
* Dosen

Halaman:

* /login
* /register
* /forgot-password
* /dashboard

==================================================
FITUR DASHBOARD
===============

Dashboard menampilkan:

* Total modul
* Draft modul
* Modul publish
* Statistik generate AI
* Statistik export
* Aktivitas terbaru

Tambahkan:

* Quick action button
* Recent modules
* Sidebar modern
* Sticky navbar

==================================================
FITUR GENERATE MODUL AI
=======================

AI digunakan untuk membantu membuat draft awal modul praktikum.

Input AI:

* Nama mata kuliah
* Topik praktikum
* Semester
* Program studi
* Tingkat kesulitan
* Capaian pembelajaran
* Template modul

AI menghasilkan:

* Judul modul
* Deskripsi modul
* Dasar teori
* Tujuan praktikum
* Alat dan bahan
* Langkah praktikum
* Tabel pengamatan
* Analisa data
* Pertanyaan praktikum
* Kesimpulan
* Daftar pustaka

Tambahkan:

* Loading modern
* Progress generate
* Retry generate
* Generate per section
* Rewrite section
* Improve writing
* Extend content
* Summarize content

==================================================
FITUR MANUAL EDITOR
===================

Dosen dapat membuat/edit modul manual menggunakan editor modern.

Field modul:

* Nama Modul
* Kode Modul
* Mata Kuliah
* Semester
* Program Studi
* Nama Dosen Pengembang
* Laboratorium
* Tahun Akademik
* Deskripsi Modul
* Tujuan Praktikum
* Dasar Teori
* Keselamatan Kerja
* Alat dan Bahan
* Langkah Praktikum
* Tabel Pengamatan
* Analisa Data
* Tugas
* Kesimpulan
* Daftar Pustaka

Editor support:

* Rich text
* Bold/Italic
* Underline
* Table
* Image upload
* Numbering
* Bullet list
* Code block
* Drag & drop image
* Resize image
* Alignment tools

LaTeX Formula Support:

* Inline math menggunakan sintaks $...$ (contoh: $E = mc^2$)
* Block/display math menggunakan sintaks $$...$$ (contoh: $$\int_0^\infty e^{-x} dx = 1$$)
* LaTeX auto-complete saat mengetik command (contoh: ketik \frac lalu muncul suggestion)
* Visual symbol picker / toolbar untuk insert simbol matematika umum tanpa harus hafal kode LaTeX
* Kategori simbol: aritmatika, relasi, Greek letters, kalkulus, matriks, set theory
* Toolbar shortcut button untuk insert LaTeX block langsung dari editor toolbar
* Rendering realtime menggunakan KaTeX di dalam editor (WYSIWYG math)
* Support nested formula seperti \frac{\partial f}{\partial x}, \sum_{i=1}^{n}, \sqrt[n]{x}
* Support environment LaTeX: align, cases, matrix, bmatrix, pmatrix
* Error indicator jika sintaks LaTeX tidak valid (highlight merah dengan pesan error)
* Copy-paste LaTeX code dari sumber eksternal langsung ter-render
* Shortcut keyboard Ctrl+M untuk toggle mode LaTeX pada selection

==================================================
FITUR LIVE PREVIEW REALTIME
===========================

Gunakan split layout:

* Kiri = editor modul
* Kanan = live preview dokumen

Live preview harus realtime tanpa refresh.

Preview menampilkan:

* Cover modul
* Header/footer
* Pagination
* Daftar isi otomatis
* Layout halaman A4
* Nomor halaman
* Format heading
* Watermark
* Page break otomatis
* Rendering LaTeX formula (inline dan block math) menggunakan KaTeX
* LaTeX formula harus ter-render identik antara editor dan preview
* Formula yang error ditampilkan dengan fallback teks merah di preview

Preview harus terlihat seperti hasil final PDF/DOCX.

==================================================
FITUR TEMPLATE DESIGNER ADVANCED
================================

Buat fitur “Template Designer” yang memungkinkan dosen mendesain layout modul praktikum secara visual dan realtime.

==================================================
KEMAMPUAN TEMPLATE DESIGNER
===========================

Dosen dapat:

* Membuat template baru
* Mengedit template existing
* Menyimpan custom template
* Duplicate template
* Export/import template configuration

==================================================
CUSTOM DESIGN FITUR
===================

1. COVER MODUL

* Upload logo kampus
* Upload background cover
* Upload gambar cover
* Atur posisi logo
* Atur ukuran logo
* Atur typography cover
* Atur alignment cover
* Atur warna cover
* Atur overlay cover

2. HEADER DESIGN

* Tambahkan gambar pada header
* Tambahkan logo header
* Tambahkan teks header
* Atur tinggi header
* Atur posisi elemen header
* Multiple column header
* Header berbeda halaman pertama dan halaman isi

3. FOOTER DESIGN

* Tambahkan gambar footer
* Tambahkan watermark footer
* Tambahkan nomor halaman
* Tambahkan informasi kampus
* Tambahkan copyright
* Footer berbeda tiap section

4. WATERMARK SYSTEM

* Text watermark
* Image watermark
* Opacity watermark
* Posisi watermark
* Rotasi watermark
* Watermark per halaman

5. PAGE LAYOUT

* Margin halaman
* Ukuran halaman A4/F4
* Orientation portrait/landscape
* Multi-column layout
* Spacing paragraph
* Line spacing
* Page padding

6. TYPOGRAPHY SYSTEM

* Pilih font dokumen
* Font heading
* Font body
* Font size
* Letter spacing
* Heading hierarchy
* Text alignment

7. CONTENT BLOCK BUILDER
   Gunakan sistem drag & drop block seperti page builder.

Block:

* Text block
* Heading block
* Image block
* Table block
* Divider
* Quote block
* Code block
* Formula/LaTeX block (dedicated block untuk menulis rumus matematika dengan preview realtime)
* Equation numbering block (penomoran persamaan otomatis seperti format akademik: Persamaan 1, Persamaan 2, dst.)
* Signature block

==================================================
LIVE TEMPLATE PREVIEW
=====================

Tambahkan realtime live preview:

* Preview berubah otomatis saat edit
* Preview ukuran asli A4
* Preview pagination realtime
* Preview header/footer realtime
* Preview watermark realtime
* Preview daftar isi otomatis

Gunakan split layout:

* Kiri = template editor
* Kanan = live document preview

==================================================
DYNAMIC DOCUMENT ENGINE
=======================

Sistem harus otomatis:

* Menyesuaikan pagination ketika layout berubah
* Menyesuaikan daftar isi otomatis
* Mengatur page break otomatis
* Mengatur overflow content otomatis
* Mengatur posisi header/footer dinamis

==================================================
FITUR SAVE DRAFT
================

* Save draft otomatis
* Auto save setiap beberapa detik
* Save manual
* Edit ulang draft
* Duplicate modul
* Delete modul
* Publish modul

==================================================
FITUR EXPORT PDF & DOCX
=======================

Export harus menghasilkan dokumen akademik profesional.

Fitur otomatis:

* Cover otomatis
* Daftar isi otomatis
* Pagination otomatis
* Nomor halaman otomatis
* Header/footer otomatis
* Penomoran BAB otomatis
* Format heading konsisten
* Page break otomatis
* Watermark otomatis
* Layout print-ready A4

==================================================
FORMAT EXPORT PDF
=================

PDF harus:

* Ukuran A4
* Multi-page
* Academic layout
* Nomor halaman otomatis
* Header/footer konsisten
* Daftar isi clickable
* Render identik dengan preview
* LaTeX formula ter-render sebagai vector graphics (bukan gambar raster) agar tetap tajam di semua resolusi
* Penomoran persamaan otomatis pada display math
* Support seluruh simbol KaTeX di output PDF

==================================================
FORMAT EXPORT DOCX
==================

DOCX harus:

* Compatible Microsoft Word
* Editable
* Support Heading 1/2/3
* Table of contents otomatis
* Page numbering
* Section break
* Table formatting
* LaTeX formula dikonversi ke OMML (Office Math Markup Language) agar bisa diedit langsung di Microsoft Word
* Fallback: jika konversi OMML gagal, render formula sebagai gambar PNG high-resolution
* Penomoran persamaan ikut terkonversi ke format Word

==================================================
STRUKTUR DOKUMEN
================

Urutan dokumen:

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

==================================================
FITUR PENCARIAN
===============

Tambahkan:

* Search modul
* Filter mata kuliah
* Filter semester
* Filter dosen
* Sort terbaru/terlama
* Pagination data

==================================================
DATABASE SUPABASE
=================

Table users

* id
* name
* email
* role
* created_at

Table modules

* id
* user_id
* module_name
* course_name
* lecturer_name
* semester
* study_program
* content
* template_id
* status
* created_at
* updated_at

Table templates

* id
* user_id
* template_name
* cover_config
* header_config
* footer_config
* typography_config
* watermark_config
* layout_config
* created_at
* updated_at

Table exports

* id
* module_id
* export_type
* exported_at

Table generated_logs

* id
* user_id
* module_id
* generated_at

==================================================
PROJECT STRUCTURE
=================

Gunakan struktur:

* app/
* components/
* hooks/
* services/
* lib/
* utils/
* types/

==================================================
TEKNIS IMPLEMENTASI
===================

Gunakan:

* TipTap untuk editor
* @tiptap/extension-mathematics untuk integrasi LaTeX di TipTap
* KaTeX untuk rendering formula matematika
* dnd-kit untuk drag & drop
* Zustand untuk state management
* Supabase realtime
* Dynamic pagination engine
* Dynamic TOC generation
* PDF rendering engine sinkron dengan preview
* LaTeX-to-OMML converter untuk export DOCX (gunakan latex-to-omml atau mathml2omml)

==================================================
VERCEL READY
============

Project harus:

* Bisa langsung deploy ke Vercel
* Menggunakan environment variable
* Clean architecture
* Reusable component
* API route clean
* SEO friendly
* Production ready

==================================================
OUTPUT YANG DIINGINKAN
======================

Generate:

* Full source code
* SQL schema Supabase
* Setup documentation
* Cara deploy ke Vercel
* Environment variable example
* Struktur folder lengkap
* Reusable component architecture
* Responsive layout
* Production-ready code

Pastikan hasil akhir terlihat seperti aplikasi SaaS akademik modern profesional dengan pengalaman editing dokumen yang powerful dan realtime.

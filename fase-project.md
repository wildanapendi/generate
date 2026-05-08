# Modul Praktikum Generator — Implementation Plan

Platform SaaS akademik untuk dosen membuat, mengedit, mendesain template, dan mengexport modul praktikum secara profesional.

## Keputusan User

| Keputusan | Pilihan |
|---|---|
| **AI Provider** | Google Gemini 3 (`@google/genai`) |
| **Icon Library** | Font Awesome (`@fortawesome/*`) |
| **Image Storage** | Supabase Storage |
| **API Keys** | Belum tersedia — build dulu, isi keys nanti |

> [!NOTE]
> Semua API keys akan dikonfigurasi via `.env.local`. Project akan berfungsi penuh setelah keys diisi. Selama development tanpa keys, halaman auth dan AI generate akan menampilkan error handling yang informatif.

## Kondisi Project Saat Ini

Project sudah di-scaffold dengan `create-next-app`:
- **Next.js 16.2.6** + React 19 + TypeScript 6
- **TailwindCSS 4** + `@tailwindcss/postcss`
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) sudah terinstall
- Belum ada halaman/komponen custom — masih template default

---

## User Review Required

> [!NOTE]
> Semua keputusan teknis sudah dikonfirmasi. Tinggal menunggu approval untuk mulai eksekusi.

> [!IMPORTANT]
> Setelah project selesai dibangun, Anda perlu:
> 1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Jalankan `supabase/schema.sql` di SQL Editor
> 3. Buat bucket `module-assets` di Supabase Storage
> 4. Dapatkan Gemini API key di [Google AI Studio](https://aistudio.google.com/apikey)
> 5. Isi semua values di `.env.local`

---

## Proposed Changes

Implementasi dibagi menjadi **8 Phase** yang dikerjakan secara berurutan.

---

### Phase 1: Foundation & Infrastructure

Setup project foundation, design system, Supabase client, authentication, dan protected routes.

#### [MODIFY] [package.json](file:///c:/generate/package.json)
Tambah semua dependencies yang dibutuhkan sesuai README.md:

```
Dependencies baru:
- @google/genai (Google Gemini 3 SDK)
- @tiptap/react, @tiptap/starter-kit, @tiptap/pm
- @tiptap/extension-table, @tiptap/extension-image, @tiptap/extension-text-align
- @tiptap/extension-underline, @tiptap/extension-code-block, @tiptap/extension-placeholder
- @tiptap/extension-mathematics
- katex
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- zustand
- framer-motion
- jspdf
- docx
- sonner (toast — shadcn/ui compatible)
- @fortawesome/fontawesome-svg-core, @fortawesome/free-solid-svg-icons, @fortawesome/react-fontawesome

DevDependencies baru:
- @types/katex
```

#### [NEW] components.json
Konfigurasi shadcn/ui CLI untuk TailwindCSS 4.

#### [MODIFY] [globals.css](file:///c:/generate/app/globals.css)
Design system lengkap: CSS custom properties, dark mode tokens, typography scale, KaTeX styles import.

#### [MODIFY] [layout.tsx](file:///c:/generate/app/layout.tsx)
- Ganti font ke Inter/Poppins
- Tambah ThemeProvider, Toaster, metadata SEO
- Dark mode support via `class` strategy

#### [NEW] lib/supabase/server.ts
Server-side Supabase client menggunakan `@supabase/ssr` + `cookies()`.

#### [NEW] lib/supabase/client.ts
Browser-side Supabase client menggunakan `createBrowserClient`.

#### [NEW] middleware.ts
- Refresh Supabase auth token
- Redirect unauthenticated users ke `/login`
- Protect routes `/dashboard/*`, `/editor/*`, `/templates/*`

#### [NEW] app/(auth)/login/page.tsx
Login page: email/password form, link ke register & forgot-password.

#### [NEW] app/(auth)/register/page.tsx
Register page: name, email, password, confirm password.

#### [NEW] app/(auth)/forgot-password/page.tsx
Forgot password page: email input, send reset link.

#### [NEW] app/(auth)/layout.tsx
Auth layout: centered card, branding, dark mode toggle.

#### [NEW] app/auth/callback/route.ts
OAuth/magic link callback handler.

#### [NEW] types/database.ts
TypeScript types untuk seluruh Supabase tables.

#### [NEW] types/module.ts
Types untuk Module, Template, Export, GenerateLog.

#### [NEW] .env.example
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### [NEW] supabase/schema.sql
SQL schema lengkap untuk semua 5 tabel + RLS policies + indexes.

```sql
-- users table (extends auth.users)
-- modules table with JSONB content
-- templates table with JSONB configs
-- exports table
-- generated_logs table
-- RLS policies per table
-- Indexes on user_id, status, created_at
```

---

### Phase 2: Dashboard & Module Management

#### [NEW] app/(dashboard)/layout.tsx
Dashboard layout: responsive sidebar + sticky navbar + main content area.

#### [NEW] app/(dashboard)/dashboard/page.tsx
Server component: fetch stats (total/draft/published modules, AI generates, exports, recent activity).

#### [NEW] components/dashboard/stats-cards.tsx
Stat cards: Total Modul, Draft, Published, AI Generates, Exports.

#### [NEW] components/dashboard/recent-modules.tsx
Recent modules list dengan quick actions.

#### [NEW] components/dashboard/activity-feed.tsx
Aktivitas terbaru (create, edit, export, generate).

#### [NEW] components/layout/sidebar.tsx
Responsive sidebar menggunakan shadcn/ui Sidebar component. Menu: Dashboard, Modules, Templates, Settings.

#### [NEW] components/layout/navbar.tsx
Sticky navbar: search, dark mode toggle, user menu, notifications.

#### [NEW] components/ui/ (shadcn components)
Install via CLI: `button`, `card`, `dialog`, `alert-dialog`, `input`, `label`, `select`, `skeleton`, `sonner`, `sidebar`, `dropdown-menu`, `avatar`, `badge`, `separator`, `sheet`, `tabs`, `tooltip`.

#### [NEW] app/(dashboard)/modules/page.tsx
Module list page: search, filter (mata kuliah, semester, dosen), sort, pagination.

#### [NEW] app/(dashboard)/modules/[id]/page.tsx
Module detail/view page.

#### [NEW] services/modules.ts
CRUD services: createModule, getModules, getModuleById, updateModule, deleteModule, duplicateModule, publishModule.

---

### Phase 3: AI Module Generation

#### [NEW] app/api/generate/route.ts
API Route: menerima input → call **Google Gemini 3** via `@google/genai` → return structured module content sebagai JSON.

#### [NEW] app/(dashboard)/generate/page.tsx
Generate form: mata kuliah, topik, semester, prodi, tingkat kesulitan, capaian pembelajaran, template picker.

#### [NEW] components/generate/generate-form.tsx
Client component: form inputs + template selector + generate button.

#### [NEW] components/generate/generate-progress.tsx
Progress indicator: loading animation, section-by-section progress.

#### [NEW] services/ai-generate.ts
AI service menggunakan `@google/genai` (Gemini 3): buildPrompt, parseResponse, generatePerSection, rewriteSection, improveWriting, extendContent, summarizeContent.

#### [NEW] stores/generate-store.ts
Zustand store: generate state, progress tracking, retry logic.

---

### Phase 4: Manual Editor + LaTeX Support

Core editor menggunakan TipTap dengan LaTeX/KaTeX integration.

#### [NEW] app/(editor)/editor/[id]/page.tsx
Split layout page: editor (left) + live preview (right). Resizable panels.

#### [NEW] app/(editor)/layout.tsx
Editor layout: minimal navbar, auto-save indicator, export buttons.

#### [NEW] components/editor/module-editor.tsx
TipTap editor wrapper: toolbar, content area, section management.

#### [NEW] components/editor/editor-toolbar.tsx
Rich text toolbar: bold, italic, underline, heading, list, table, image, code, alignment, LaTeX button (`Ctrl+M`).

#### [NEW] components/editor/latex-extension.ts
Custom TipTap extension: `@tiptap/extension-mathematics` + KaTeX config. Inline `$...$` dan block `$$...$$` support. Error handling dengan red highlight.

#### [NEW] components/editor/latex-symbol-picker.tsx
Visual symbol picker modal: categories (aritmatika, relasi, Greek, kalkulus, matriks, set theory). Click-to-insert.

#### [NEW] components/editor/section-manager.tsx
Drag & drop sections menggunakan `@dnd-kit`. Add/remove/reorder sections.

#### [NEW] components/editor/image-upload.tsx
Image upload: drag & drop, resize, alignment. Upload ke Supabase Storage.

#### [NEW] components/editor/table-editor.tsx
Table creation & editing via TipTap table extension.

#### [NEW] components/editor/module-metadata-form.tsx
Form untuk metadata: nama modul, kode, mata kuliah, semester, prodi, dosen, lab, tahun akademik.

#### [NEW] stores/editor-store.ts
Zustand store: module content, dirty state, auto-save timer, undo/redo.

#### [NEW] hooks/useAutoSave.ts
Auto-save hook: debounced save setiap 5 detik saat ada perubahan.

#### [NEW] services/storage.ts
Supabase Storage service: uploadImage, deleteImage, getImageUrl.

---

### Phase 5: Live Preview Engine

#### [NEW] components/preview/document-preview.tsx
A4 document preview: renders module content sebagai halaman dokumen. KaTeX rendering untuk LaTeX formulas.

#### [NEW] components/preview/cover-page.tsx
Cover page renderer: logo, background, title, subtitle, dosen, prodi, tahun.

#### [NEW] components/preview/header-footer.tsx
Header/footer renderer sesuai template config.

#### [NEW] components/preview/table-of-contents.tsx
Auto-generated TOC dari heading hierarchy.

#### [NEW] components/preview/page-break.tsx
Dynamic page break calculation berdasarkan A4 dimensions.

#### [NEW] components/preview/watermark.tsx
Watermark overlay: text/image, opacity, rotation, position.

#### [NEW] components/preview/pagination.tsx
Page numbering system.

#### [NEW] hooks/usePagination.ts
Dynamic pagination engine: calculate page breaks, overflow handling.

---

### Phase 6: Template Designer

#### [NEW] app/(dashboard)/templates/page.tsx
Template list: create new, edit, duplicate, delete, import/export.

#### [NEW] app/(dashboard)/templates/[id]/page.tsx
Template designer: split layout (editor left, preview right).

#### [NEW] components/template/cover-designer.tsx
Cover designer: logo upload/position/size, background, typography, color, overlay.

#### [NEW] components/template/header-designer.tsx
Header designer: logo, text, columns, height, different first page.

#### [NEW] components/template/footer-designer.tsx
Footer designer: page number, campus info, copyright, watermark.

#### [NEW] components/template/watermark-designer.tsx
Watermark config: text/image, opacity, position, rotation.

#### [NEW] components/template/layout-designer.tsx
Page layout: margin, page size (A4/F4), orientation, columns, spacing.

#### [NEW] components/template/typography-designer.tsx
Typography: font selection, heading/body fonts, sizes, spacing, hierarchy.

#### [NEW] components/template/block-builder.tsx
Content block builder: drag & drop blocks (text, heading, image, table, divider, quote, code, formula/LaTeX, equation numbering, signature).

#### [NEW] stores/template-store.ts
Zustand store: template config state management.

#### [NEW] services/templates.ts
CRUD services: createTemplate, getTemplates, updateTemplate, deleteTemplate, duplicateTemplate, exportConfig, importConfig.

---

### Phase 7: Export Engine (PDF & DOCX)

#### [NEW] services/export-pdf.ts
PDF export menggunakan jsPDF:
- A4 layout, multi-page, cover, TOC, header/footer, pagination
- LaTeX → KaTeX → SVG vector rendering
- Watermark, page breaks, heading formatting
- Equation numbering

#### [NEW] services/export-docx.ts
DOCX export menggunakan `docx` npm:
- Word-compatible, editable, Heading 1/2/3
- TOC, page numbering, section breaks, table formatting
- LaTeX → OMML conversion (fallback: PNG render)
- Equation numbering

#### [NEW] services/latex-to-omml.ts
LaTeX-to-OMML converter utility untuk DOCX export.

#### [NEW] app/api/export/pdf/route.ts
API Route: generate PDF server-side, return as download.

#### [NEW] app/api/export/docx/route.ts
API Route: generate DOCX server-side, return as download.

#### [NEW] components/export/export-dialog.tsx
Export dialog: pilih format (PDF/DOCX), preview sebelum export, download button.

---

### Phase 8: Polish & Production Ready

#### [NEW] app/(dashboard)/settings/page.tsx
User settings: profile, password change, preferences.

#### [MODIFY] [next.config.ts](file:///c:/generate/next.config.ts)
- Image domains (Supabase Storage)
- Environment variables validation
- Security headers

#### [NEW] components/ui/confirmation-modal.tsx
Reusable confirmation modal untuk destructive actions.

#### [NEW] components/ui/loading-skeleton.tsx
Reusable skeleton components untuk semua async operations.

#### Polish tasks:
- Framer Motion page transitions
- Responsive testing (mobile/tablet/desktop)
- Dark mode testing seluruh halaman
- SEO metadata per halaman
- Error boundaries
- 404/500 pages
- Performance optimization

---

## Project Structure (Final)

```
c:\generate\
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── modules/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── generate/page.tsx
│   │   └── settings/page.tsx
│   ├── (editor)/
│   │   ├── layout.tsx
│   │   └── editor/[id]/page.tsx
│   ├── api/
│   │   ├── generate/route.ts
│   │   ├── export/
│   │   │   ├── pdf/route.ts
│   │   │   └── docx/route.ts
│   │   └── auth/callback/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (redirect to /dashboard or /login)
├── components/
│   ├── layout/ (sidebar, navbar)
│   ├── dashboard/ (stats, recent, activity)
│   ├── editor/ (tiptap, toolbar, latex, sections, image, table)
│   ├── preview/ (document, cover, header, footer, toc, watermark)
│   ├── template/ (cover, header, footer, watermark, layout, typography, blocks)
│   ├── generate/ (form, progress)
│   ├── export/ (dialog)
│   └── ui/ (shadcn components + custom)
├── hooks/ (useAutoSave, usePagination)
├── stores/ (editor-store, template-store, generate-store)
├── services/ (modules, templates, ai-generate, export-pdf, export-docx, storage, latex-to-omml)
├── lib/
│   └── supabase/ (server.ts, client.ts)
├── types/ (database.ts, module.ts)
├── utils/
├── supabase/ (schema.sql)
├── middleware.ts
├── .env.example
└── ...config files
```

---

## Database Schema (Supabase)

```sql
-- 5 Tables: users, modules, templates, exports, generated_logs
-- JSONB columns untuk content & config (flexible structure)
-- RLS policies: users only access own data
-- Indexes: user_id, status, created_at
```

Detail schema akan di-generate sebagai file `supabase/schema.sql`.

---

## Environment Variables

| Variable | Deskripsi | Cara Dapat |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini 3 API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` untuk dev |

---

## Verification Plan

### Automated Tests
- `bun run build` — memastikan zero TypeScript errors
- `bun run lint` — memastikan zero ESLint errors
- Browser test: login flow, create module, edit, preview, export

### Manual Verification
- Test responsive layout di mobile/tablet/desktop
- Test dark mode toggle di semua halaman
- Test LaTeX rendering di editor, preview, PDF, dan DOCX
- Test auto-save functionality
- Test export PDF/DOCX output quality
- Test drag & drop sections dan template blocks
- Deploy ke Vercel dan verify production build

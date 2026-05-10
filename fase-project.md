# Modul Praktikum Generator — Implementation Plan

Platform SaaS akademik untuk dosen membuat, mengedit, dan mengexport modul praktikum secara profesional, dengan template management yang dikelola oleh admin.

## Keputusan User

| Keputusan | Pilihan |
|---|---|
| **AI Provider** | Google Gemini 3 (`@google/genai`) |
| **Icon Library** | Font Awesome (`@fortawesome/*`) |
| **Image Storage** | Supabase Storage |
| **API Keys** | Belum tersedia — build dulu, isi keys nanti |
| **Role System** | `admin` \| `lecturer` (enum) — RBAC dengan middleware + RLS |
| **Auth Strategy** | Defense-in-depth: middleware redirect + Supabase RLS policies |
| **Admin Bootstrap** | Manual SQL seed untuk admin pertama, lalu post-login role-based redirect |
| **Forbidden UX** | Silent redirect ke `/dashboard` + toast notification "Akses ditolak" |

## Role-Based Access Matrix

| Fitur | `admin` | `lecturer` (dosen) |
|---|---|---|
| Dashboard | Yes | Yes |
| Modules CRUD (manual + AI generate) | Yes | Yes |
| Manual Editor + LaTeX | Yes | Yes |
| Export PDF/DOCX | Yes | Yes |
| Settings / Profile | Yes | Yes |
| **Template Designer** (`/templates/*`) | **Yes** | **No (redirect)** |
| User management (future) | Yes | No |

> [!NOTE]
> Lecturer (dosen) hanya konsumen template — mereka memilih template saat generate/export, tidak bisa membuat/mengedit. Semua resource (modul, export, log) tetap user-scoped via RLS untuk kedua role.

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
> 6. Register akun admin pertama via `/register`, lalu jalankan `supabase/seed-admin.sql` untuk promote akun tersebut ke role `admin`. Login berikutnya akan otomatis redirect ke dashboard admin berdasarkan role di DB.

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
- Refresh Supabase auth token via `@supabase/ssr`
- Redirect unauthenticated user ke `/login`
- Protect routes `/dashboard/*`, `/editor/*`, `/templates/*`, `/generate/*`, `/modules/*`, `/settings/*`
- **RBAC enforcement**: query `users.role` sekali per request, attach ke request context
- **Admin-only guard**: jika pathname match `/templates(/.*)?` dan role !== 'admin' → redirect ke `/dashboard?forbidden=1` (toast trigger di client)
- **Post-login redirect**: pada hit ke `/login` saat sudah authenticated, redirect ke `/dashboard` (kedua role mendarat di dashboard yang sama; sidebar yang berbeda berdasarkan role)
- Performance: gunakan `select role` only, hindari fetch full user row

#### [NEW] lib/auth/get-session-user.ts
Server-side helper: `getSessionUser()` returns `SessionUser | null` dengan role yang sudah di-fetch. Single source of truth untuk Server Components dan Route Handlers — menghindari duplicate query di setiap page.

#### [NEW] lib/auth/require-role.ts
Server-side guard: `requireRole(role: UserRole)` — throw redirect jika user tidak memenuhi role. Dipakai di Server Component layout `(dashboard)/templates/layout.tsx` sebagai defense-in-depth (selain middleware).

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
TypeScript types untuk seluruh Supabase tables. Termasuk `UserRole = 'admin' | 'lecturer'` sebagai discriminated union.

#### [NEW] types/module.ts
Types untuk Module, Template, Export, GenerateLog.

#### [NEW] types/auth.ts
Types khusus authorization: `UserRole`, `SessionUser` (dengan role embedded), `RoutePermission` map. Tipe inilah yang dikonsumsi middleware dan server components untuk type-safe RBAC.

#### [NEW] .env.example
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### [NEW] supabase/schema.sql
SQL schema lengkap untuk semua 5 tabel + role enum + RLS policies role-aware + indexes.

```sql
-- ENUM type untuk role (type-safe, indeks lebih efisien dari TEXT CHECK)
CREATE TYPE user_role AS ENUM ('admin', 'lecturer');

-- users table (extends auth.users)
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
--   email TEXT NOT NULL UNIQUE
--   full_name TEXT
--   role user_role NOT NULL DEFAULT 'lecturer'  -- default aman: signup baru = dosen
--   created_at, updated_at TIMESTAMPTZ
--
-- Trigger handle_new_user(): on auth.users INSERT, create row di public.users
--   dengan role default 'lecturer'. Admin di-promote manual via seed-admin.sql.
--
-- modules table (JSONB content) — owned by user_id
-- templates table (JSONB config) — owned by user_id (admin only writes)
-- exports table — owned by user_id
-- generated_logs table — owned by user_id

-- RLS policies:
--   users: SELECT own row; admin SELECT all (untuk future user mgmt)
--   modules/exports/generated_logs: per-user CRUD (kedua role)
--   templates:
--     SELECT: semua authenticated user (lecturer perlu read untuk pakai template)
--     INSERT/UPDATE/DELETE: HANYA role 'admin'
--
-- Helper function: auth_role() RETURNS user_role
--   SELECT role FROM public.users WHERE id = auth.uid()
--   Dipakai di RLS policies templates: USING (auth_role() = 'admin')
--
-- Indexes: users(role), modules(user_id, status, created_at),
--          templates(created_at), exports(user_id, created_at)
```

#### [NEW] supabase/seed-admin.sql
One-time script untuk promote akun pertama menjadi admin. Dijalankan manual setelah register akun pertama via UI.

```sql
-- Ganti email di bawah dengan email akun admin yang sudah register
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

---

### Phase 2: Dashboard & Module Management

> [!NOTE]
> **Refactor goals**: (1) clean separation antara data layer (repositories), business logic (use-cases/server actions), dan presentation (components); (2) Next.js 16 native primitives — Server Components untuk reads, Server Actions untuk mutations dengan `revalidateTag` granular; (3) error/loading boundaries per-segment; (4) tipe-driven dengan Zod sebagai single source of truth untuk validation di server + client.

#### Data Access Layer

##### [NEW] lib/data/modules.repository.ts
Repository pattern murni untuk akses tabel `modules`. Hanya berisi query Supabase, tidak ada business logic. Setiap fungsi menerima `SupabaseClient` (server-side) sebagai dependency injection — memudahkan testing dan menjaga single responsibility:

```
listModulesByUser(client, userId, params: ListModulesParams)
getModuleById(client, userId, moduleId)
insertModule(client, payload)
updateModule(client, userId, moduleId, patch)
deleteModule(client, userId, moduleId)
countModulesByStatus(client, userId)  // untuk dashboard stats
```

Semua query memakai `select` eksplisit (hindari `select *`) dan filter `user_id = auth.uid()` sebagai defense-in-depth selain RLS.

##### [NEW] lib/data/activity.repository.ts
Repository untuk gabungan `generated_logs` + `exports` + module mutation events. Method `listRecentActivity(client, userId, limit)` melakukan UNION query dengan kolom yang dinormalisasi (`type`, `entity_id`, `created_at`, `meta`) — menghindari multiple round-trip dari komponen.

##### [NEW] lib/validation/module.schema.ts
Zod schemas: `moduleCreateSchema`, `moduleUpdateSchema`, `moduleListParamsSchema` (search, filter, sort, page, pageSize). Diturunkan menjadi TypeScript types via `z.infer` — dipakai di Server Action input parsing dan client-side form.

#### Server Actions (Mutations)

##### [NEW] app/(dashboard)/modules/_actions/index.ts
Server Actions terdaftar dengan `'use server'`. Setiap action:
1. Resolve session via `getSessionUser()` — throw `redirect('/login')` jika null
2. Parse input dengan Zod schema — return `{ success: false, errors }` jika invalid (typed via discriminated union)
3. Delegate ke repository
4. `revalidateTag('modules:list:'+userId)` dan/atau `revalidateTag('modules:detail:'+moduleId)` untuk cache invalidation granular
5. Return `ActionResult<T>` — discriminated union `{ success: true; data } | { success: false; error; fieldErrors? }`

Actions: `createModuleAction`, `updateModuleAction`, `deleteModuleAction`, `duplicateModuleAction`, `publishModuleAction`.

#### Layout & Shell

##### [NEW] app/(dashboard)/layout.tsx
Server Component yang memanggil `getSessionUser()` sekali, lalu mendelegasikan rendering ke `<DashboardShell user={user}>`. Tidak ada side-effect lain — layout tetap thin agar mudah di-cache oleh Next.js segment cache.

##### [NEW] components/layout/dashboard-shell.tsx
Composite Server Component: `<Sidebar role={user.role} />` + `<Navbar user={user} />` + `<main>{children}</main>` + `<NoticeBanner />` (untuk forbidden toast trigger). Memisahkan layout shell dari layout file membuat shell reusable (mis. di `(editor)` layout untuk variant minimal).

##### [NEW] components/layout/notice-banner.tsx
Refactor dari `forbidden-toast.tsx`. Generic notice banner yang membaca query params dengan whitelist (`forbidden`, `unauthorized`, `success`, `error`), map ke pesan i18n-ready, trigger Sonner toast, lalu `router.replace` untuk strip param. Pendekatan generic ini menghilangkan duplikasi jika nanti ada notice tipe lain.

##### [NEW] components/layout/sidebar.tsx
Responsive sidebar (shadcn Sidebar). Menerima `role: UserRole`. Menu items dideklarasikan sebagai konstanta typed:

```ts
type MenuItem = { label: string; href: Route; icon: IconDefinition; requiredRole?: UserRole }
```

Filter berdasarkan role di module-level (bukan per-render) — hasil di-memoize. Penambahan menu admin-only di masa depan cukup append ke array dengan `requiredRole: 'admin'`.

##### [NEW] components/layout/navbar.tsx
Sticky navbar: command palette (Ctrl+K trigger), theme toggle, user menu (logout via Server Action), notifications dropdown.

#### Dashboard Page

##### [NEW] app/(dashboard)/dashboard/page.tsx
Server Component dengan parallel data fetching via `Promise.all`:

```
const [stats, recent, activity] = await Promise.all([
  getDashboardStats(user.id),
  listRecentModules(user.id, 5),
  listRecentActivity(user.id, 10),
])
```

Setiap fetcher di-wrap `unstable_cache` dengan tag `dashboard:stats:${userId}` — invalidated dari Server Actions. Trade-off: cache stale 1-tick saat mutation, tetapi UX gain dari instant load worth it untuk dashboard yang dibuka ulang berkali-kali.

##### [NEW] app/(dashboard)/dashboard/loading.tsx
Streaming UI: skeleton untuk stats cards + recent + activity. Memanfaatkan React Suspense boundary otomatis Next.js.

##### [NEW] app/(dashboard)/dashboard/error.tsx
Route segment error boundary. Logged ke service (future Sentry hook), tampilkan retry button (`reset()`).

##### [NEW] components/dashboard/stats-cards.tsx
Pure presentation — terima props `{ totalModules, drafts, published, generates, exports }`. Tidak ada data fetching di sini.

##### [NEW] components/dashboard/recent-modules.tsx
Server Component yang menerima list dari parent. Quick actions (duplicate, delete) menggunakan `<form action={serverAction}>` — progressive enhancement, no JS required untuk action dasar.

##### [NEW] components/dashboard/activity-feed.tsx
Server Component dengan virtualized list jika items > 50. Time formatting via `Intl.RelativeTimeFormat` (no client lib needed).

#### Modules CRUD

##### [NEW] components/ui/ (shadcn components)
Install via CLI: `button`, `card`, `dialog`, `alert-dialog`, `input`, `label`, `select`, `skeleton`, `sonner`, `sidebar`, `dropdown-menu`, `avatar`, `badge`, `separator`, `sheet`, `tabs`, `tooltip`, `command`, `pagination`, `data-table`.

##### [NEW] app/(dashboard)/modules/page.tsx
Server Component. `searchParams` di-parse dengan `moduleListParamsSchema` (defaults applied). Fetch via repository dengan params. Render `<ModulesDataTable>` client component dengan initial data. Pagination state di URL (sharable, back/forward friendly) — bukan state lokal.

##### [NEW] app/(dashboard)/modules/[id]/page.tsx
Server Component. Fetch single module — jika null, panggil `notFound()`. Render read-only view + action buttons (Edit → `/editor/[id]`, Delete dengan confirmation, Duplicate, Export).

##### [NEW] app/(dashboard)/modules/loading.tsx
Skeleton untuk modules list.

##### [NEW] app/(dashboard)/modules/[id]/not-found.tsx
404 khusus modul: pesan yang jelas + CTA kembali ke list.

##### [NEW] components/modules/modules-data-table.tsx
Client component (interactivity: row selection, quick filters). Reads dari URL params via `useSearchParams`, push update dengan `router.push` debounced. Setiap row action dispatch ke Server Action.

##### [NEW] components/modules/module-filters.tsx
Filter bar: search input (debounced 300ms), select untuk mata kuliah, semester, status. State sync ke URL params.

##### [NEW] components/modules/delete-module-dialog.tsx
Confirmation dialog reusable. Wraps `<form action={deleteModuleAction}>` dengan `<input type="hidden" name="id">` — server action native, tanpa custom fetch.

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

### Phase 6: Template Designer (Admin-Only)

> [!IMPORTANT]
> Seluruh route `/templates/*` dilindungi tiga lapis:
> 1. **Middleware** — redirect non-admin ke `/dashboard?forbidden=1`
> 2. **Server Component layout** — `requireRole('admin')` sebagai defense-in-depth jika middleware ter-bypass
> 3. **RLS policy** — Supabase menolak INSERT/UPDATE/DELETE templates dari non-admin di level database
>
> Lecturer tetap dapat **READ** templates (untuk picker saat generate/export) — ini di-cover oleh RLS policy SELECT yang permissive untuk authenticated users.

> [!NOTE]
> **Refactor goals**: (1) schema-first design — `TemplateConfig` di-define sebagai Zod schema → semua designer panel terikat ke type yang sama; (2) section-based code splitting — setiap designer adalah sub-route bersarang dengan parallel routes Next.js 16, memungkinkan tab switching tanpa re-fetch; (3) optimistic updates dengan rollback; (4) versioning untuk audit trail dan rollback admin; (5) import/export dengan validation ketat untuk mencegah malformed config corrupt UI.

#### Schema & Types Foundation

##### [NEW] lib/validation/template.schema.ts
Source of truth untuk struktur template. Setiap section adalah Zod schema independen yang di-compose:

```
coverConfigSchema     // logo, background, typography, color, overlay
headerConfigSchema    // logo, text, columns, height, firstPageDifferent
footerConfigSchema    // pageNumber, campusInfo, copyright
watermarkConfigSchema // text/image, opacity, position, rotation
layoutConfigSchema    // margin, pageSize (A4|F4), orientation, columns, spacing
typographyConfigSchema// fontFamily, headingScale, bodySize, lineHeight
blockSchema           // discriminated union: text|heading|image|table|divider|quote|code|formula|signature
templateConfigSchema  // gabungan semua di atas + blocks: blockSchema[]
```

Versi schema (`SCHEMA_VERSION` constant) di-embed di setiap saved config. Migration runner (`migrateConfig(input, fromVersion)`) menangani breaking changes future tanpa membuat data lama unusable.

##### [NEW] types/template.ts
Re-export `z.infer` types dari schema. Tidak ada hand-written interface — single source of truth tetap schema.

#### Data Access Layer

##### [NEW] lib/data/templates.repository.ts
Repository terpisah dengan method spesifik:

```
listTemplates(client, params)
getTemplateById(client, id)
insertTemplate(client, payload)
updateTemplate(client, id, patch)
deleteTemplate(client, id)
listVersions(client, templateId)            // audit history
getVersion(client, templateId, versionId)   // untuk rollback
```

Setiap UPDATE menulis snapshot ke `template_versions` table (versioning) — mengizinkan admin rollback tanpa kehilangan history.

##### [MODIFY] supabase/schema.sql
Tambah tabel `template_versions`:

```
template_versions (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  config JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (template_id, version_number)
)
```

RLS: SELECT untuk admin saja (audit trail bersifat sensitif), INSERT via trigger atomic dari UPDATE templates.

#### Server Actions

##### [NEW] app/(dashboard)/templates/_actions/index.ts
Server Actions dengan `'use server'`:

```
createTemplateAction(input)
updateTemplateAction(id, patch)        // sekaligus snapshot ke template_versions
deleteTemplateAction(id)
duplicateTemplateAction(id)
restoreVersionAction(templateId, versionId)
exportTemplateAction(id) -> { json, filename }
importTemplateAction(rawJson) -> Promise<ActionResult<Template>>
```

`importTemplateAction` melakukan: parse JSON → validate via `templateConfigSchema.safeParse` → check schema version → run migration jika perlu → insert. Validation gagal di-return sebagai field-level errors, mencegah corrupt data masuk DB.

Setiap mutation `revalidateTag('templates:list')` dan `revalidateTag('templates:detail:'+id)`.

#### Layout & Routing

##### [NEW] app/(dashboard)/templates/layout.tsx
Server Component dengan `requireRole('admin')` di top — defense-in-depth setelah middleware. Render shell minimal (breadcrumb, action bar) dengan `{children}`.

##### [NEW] app/(dashboard)/templates/page.tsx
Server Component. Fetch list via repository (cached dengan tag `templates:list`). Render data table + create/import buttons.

##### [NEW] app/(dashboard)/templates/[id]/layout.tsx
Server Component layout designer. Fetch template once → pass via React `cache()` agar child segments bisa baca tanpa re-fetch. Render shell: tab nav (Cover, Header, Footer, Watermark, Layout, Typography, Blocks) + split panel (left: tab content via `{children}`, right: live preview).

##### [NEW] app/(dashboard)/templates/[id]/page.tsx
Default redirect ke `./cover` (designer tab pertama).

##### [NEW] app/(dashboard)/templates/[id]/[section]/page.tsx
Dynamic segment untuk setiap designer panel. Section divalidasi dengan `templateSectionSchema` (enum). Render designer component sesuai section — section yang tidak aktif tidak di-mount, mengurangi bundle size dan memory.

##### [NEW] app/(dashboard)/templates/[id]/loading.tsx
Skeleton split layout untuk designer.

##### [NEW] app/(dashboard)/templates/[id]/error.tsx
Error boundary spesifik designer dengan retry + fallback ke list.

#### State Management

##### [NEW] stores/template-store.ts
Zustand store dengan slice pattern untuk scalability:

```
templateSlice          // current config, dirty flag, last saved at
historySlice           // undo/redo stack (Cmd+Z support, max 50 steps)
optimisticSlice        // pending mutations untuk optimistic UI
```

Store di-create per template instance (factory pattern) untuk menghindari state bleeding antar template di tab/window terpisah. Subscribe selectors menggunakan shallow equality untuk minimize re-renders.

##### [NEW] hooks/useTemplateAutoSave.ts
Debounced auto-save (5 detik). Pre-save: validate via Zod → jika invalid, tampilkan inline errors tanpa save. Post-save: update `lastSavedAt`, clear dirty flag, optimistic rollback jika action fail.

##### [NEW] hooks/useTemplateHistory.ts
Undo/redo bound ke `Cmd+Z`/`Cmd+Shift+Z`. Menggunakan immer untuk patch generation — efisien untuk struktur dalam.

#### Designer Components

Setiap designer adalah Client Component tipis yang membaca slice store + dispatch updates. Tidak ada designer yang mengakses Supabase langsung — semua via store → auto-save hook → server action. Pemisahan ini membuat designer mudah di-unit-test.

##### [NEW] components/template/shared/designer-field.tsx
Wrapper field generic: label, error, description, controlled input. Type-safe dengan generic `DesignerField<K extends keyof TemplateConfig>`.

##### [NEW] components/template/shared/preview-bridge.tsx
Sinkronisasi state store → preview iframe via `postMessage`. Iframe isolasi mencegah CSS designer tercampur dengan CSS preview (penting karena preview pakai print stylesheet A4).

##### [NEW] components/template/cover-designer.tsx
Cover designer: logo upload/position/size, background, typography, color, overlay. Image upload pakai `services/storage.ts` (existing) dengan progress indicator.

##### [NEW] components/template/header-designer.tsx
Header designer: logo, text, columns, height, different first page toggle.

##### [NEW] components/template/footer-designer.tsx
Footer designer: page number config, campus info, copyright text.

##### [NEW] components/template/watermark-designer.tsx
Watermark: text/image picker, opacity slider (0-100), position grid (3x3), rotation (-90 to 90).

##### [NEW] components/template/layout-designer.tsx
Page layout: margin (top/right/bottom/left), page size (A4/F4), orientation (portrait/landscape), columns (1-3), spacing.

##### [NEW] components/template/typography-designer.tsx
Typography: font picker (system fonts + Google Fonts whitelist), heading scale (modular), body size, line height.

##### [NEW] components/template/blocks/block-builder.tsx
Drag & drop block list (`@dnd-kit/sortable`). List virtualized jika > 30 blocks (jarang, tapi safety net).

##### [NEW] components/template/blocks/block-registry.ts
Registry pattern untuk block types:

```ts
type BlockDefinition<T extends BlockType> = {
  type: T
  label: string
  icon: IconDefinition
  defaultData: BlockData<T>
  Editor: ComponentType<BlockEditorProps<T>>
  Renderer: ComponentType<BlockRendererProps<T>>
  schema: ZodSchema
}
```

Tambah block type baru = tambah satu entry di registry, tidak perlu touch builder code. Registry ini juga dipakai oleh preview engine (Phase 5) — single source of truth untuk render.

##### [NEW] components/template/blocks/block-types/*.tsx
Satu file per block type: `text.tsx`, `heading.tsx`, `image.tsx`, `table.tsx`, `divider.tsx`, `quote.tsx`, `code.tsx`, `formula.tsx`, `signature.tsx`. Setiap file export `BlockDefinition`. Auto-discovery via `block-registry.ts` import.

##### [NEW] components/template/version-history-dialog.tsx
Dialog daftar version dengan diff viewer (JSON-diff). Action: preview, restore. Restore memanggil `restoreVersionAction`.

##### [NEW] components/template/import-export-buttons.tsx
- Export: `<form action={exportTemplateAction}>` → server returns JSON → trigger download via response headers (`Content-Disposition`).
- Import: file input → read text → call `importTemplateAction`. Validation errors ditampilkan di dialog dengan path field yang invalid.

#### Implementation Notes

Authorization: write operations tidak melakukan role check di service layer — RLS adalah single source of truth. Service throw saat Supabase return permission denied; UI menangkap dan tampilkan toast generic. Untuk specificity error message yang lebih baik, `requireRole('admin')` di server action layer memberikan error sebelum ke DB. Trade-off ini diterima karena mengurangi tiga tempat yang harus di-keep-in-sync (middleware + action + RLS) menjadi dua (middleware + RLS) dengan action layer hanya sebagai user-experience polish.

Versioning trade-off: setiap update menulis row baru ke `template_versions` — storage cost linear dengan jumlah edit. Mitigasi: cron job mingguan yang prune versions > 90 hari untuk template yang punya > 50 versions, kecuali version yang di-tag (future feature).

Performance: designer panels di-render via dynamic segments — hanya tab aktif yang di-bundle dan di-mount. Preview iframe di-throttle ke 200ms untuk debounce update — mencegah re-render storm saat user drag slider.

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
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── modules/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── _actions/index.ts
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── not-found.tsx
│   │   ├── templates/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── _actions/index.ts
│   │   │   └── [id]/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       └── [section]/page.tsx
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
│   ├── layout/ (dashboard-shell, sidebar, navbar, notice-banner)
│   ├── dashboard/ (stats-cards, recent-modules, activity-feed)
│   ├── modules/ (modules-data-table, module-filters, delete-module-dialog)
│   ├── editor/ (tiptap, toolbar, latex, sections, image, table)
│   ├── preview/ (document, cover, header, footer, toc, watermark)
│   ├── template/
│   │   ├── shared/ (designer-field, preview-bridge)
│   │   ├── cover-designer.tsx
│   │   ├── header-designer.tsx
│   │   ├── footer-designer.tsx
│   │   ├── watermark-designer.tsx
│   │   ├── layout-designer.tsx
│   │   ├── typography-designer.tsx
│   │   ├── blocks/
│   │   │   ├── block-builder.tsx
│   │   │   ├── block-registry.ts
│   │   │   └── block-types/ (text, heading, image, table, divider, quote, code, formula, signature)
│   │   ├── version-history-dialog.tsx
│   │   └── import-export-buttons.tsx
│   ├── generate/ (form, progress)
│   ├── export/ (dialog)
│   └── ui/ (shadcn components + custom)
├── hooks/ (useAutoSave, usePagination, useTemplateAutoSave, useTemplateHistory)
├── stores/ (editor-store, template-store, generate-store)
├── services/ (ai-generate, export-pdf, export-docx, storage, latex-to-omml)
├── lib/
│   ├── supabase/ (server.ts, client.ts)
│   ├── auth/ (get-session-user.ts, require-role.ts)
│   ├── data/ (modules.repository.ts, templates.repository.ts, activity.repository.ts)
│   └── validation/ (module.schema.ts, template.schema.ts)
├── types/ (database.ts, module.ts, template.ts, auth.ts)
├── utils/
├── supabase/ (schema.sql, seed-admin.sql)
├── middleware.ts
├── .env.example
└── ...config files
```

---

## Database Schema (Supabase)

```sql
-- ENUM: user_role ('admin' | 'lecturer')
-- 5 Tables: users, modules, templates, exports, generated_logs
-- JSONB columns untuk content & config (flexible structure)
-- RLS policies:
--   modules/exports/generated_logs → per-user CRUD
--   templates → SELECT all authenticated, write admin-only
-- Indexes: users(role), user_id, status, created_at
-- Trigger: auto-create public.users row on auth.users INSERT (default role='lecturer')
-- Helper: auth_role() function untuk RLS predicates
```

Detail schema akan di-generate sebagai file `supabase/schema.sql`. Seed admin pertama via `supabase/seed-admin.sql`.

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

### RBAC Verification (Critical)
- **Lecturer flow**: register akun baru → konfirmasi role default `lecturer` di DB → login → sidebar tidak menampilkan menu Templates → akses langsung `/templates` di URL bar harus redirect ke `/dashboard?forbidden=1` dengan toast → akses langsung `/templates/<uuid>` juga harus redirect
- **Admin flow**: jalankan `seed-admin.sql` → login → sidebar menampilkan menu Templates → akses penuh CRUD templates
- **API-level RBAC**: dengan akun lecturer, panggil mutation Supabase langsung (via DevTools/Postman dengan JWT lecturer) ke tabel `templates` — harus ditolak oleh RLS dengan permission denied error
- **Picker isolation**: lecturer harus tetap bisa SELECT templates (untuk generate form picker), tapi tidak bisa INSERT/UPDATE/DELETE — verify via Supabase logs
- **Edge case**: user yang role-nya diubah saat sedang login — pada navigasi berikutnya middleware harus pick up role baru (tidak ada caching session yang stale)

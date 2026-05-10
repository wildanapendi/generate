import { requireRole } from "@/lib/auth/require-role";

/**
 * Defense-in-depth layout untuk subtree `/templates/*`.
 *
 * Memanggil `requireRole('admin')` di top-level — jika user bukan admin,
 * throw `redirect('/dashboard?forbidden=1')` SEBELUM children dirender.
 *
 * Ini lapisan keamanan KEDUA setelah middleware RBAC.
 * Ketiga lapisan keamanan secara berurutan:
 * 1. Middleware — redirect non-admin di edge
 * 2. Server Component layout (ini) — defense-in-depth
 * 3. RLS policy — Supabase menolak write dari non-admin di level database
 */
export default async function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Throws redirect jika bukan admin — children tidak pernah dirender
  await requireRole("admin");

  return <>{children}</>;
}

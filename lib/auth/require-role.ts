import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./get-session-user";
import type { SessionUser, UserRole } from "@/types/auth";

/**
 * Server-side guard: memastikan user terautentikasi DAN memiliki role yang dibutuhkan.
 *
 * Jika gagal, throw `redirect()` (Next.js internal throw, bukan return):
 * - User belum login → redirect ke `/login`
 * - Role tidak sesuai → redirect ke `/dashboard?forbidden=1`
 *
 * Digunakan sebagai defense-in-depth di Server Component layouts,
 * terutama `(dashboard)/templates/layout.tsx`, sebagai lapisan keamanan
 * kedua setelah middleware RBAC.
 *
 * @param role — Role minimum yang dibutuhkan
 * @returns `SessionUser` jika berhasil (never returns jika gagal — always throws)
 *
 * @example
 * ```tsx
 * // app/(dashboard)/templates/layout.tsx
 * export default async function TemplatesLayout({ children }) {
 *   await requireRole("admin");
 *   return <>{children}</>;
 * }
 * ```
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect("/dashboard?forbidden=1");
  }

  return user;
}

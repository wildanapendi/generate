import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser, UserRole } from "@/types/auth";

/**
 * Single source of truth untuk mendapatkan user session + role.
 *
 * Melakukan 2 query:
 * 1. `supabase.auth.getUser()` — validasi JWT
 * 2. `SELECT full_name, role FROM users WHERE id = ?` — ambil profile
 *
 * Digunakan oleh:
 * - Server Components (dashboard layout, template pages)
 * - Route Handlers (API routes)
 * - `requireRole()` guard
 *
 * Menghindari duplikasi query auth+profile di setiap page.
 *
 * @returns `SessionUser` jika terautentikasi, `null` jika tidak
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  // Ambil profile dengan query minimal — hanya field yang dibutuhkan
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle() as {
      data: { full_name: string | null; role: string | null } | null;
    };

  // Default role "lecturer" jika profile belum ada atau role null
  // (sesuai schema: trigger handle_new_user set default 'lecturer')
  const role: UserRole =
    profile?.role === "admin" ? "admin" : "lecturer";

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role,
  };
}

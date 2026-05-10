import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Module, ModuleInsert, ModuleStatus } from "@/types/module";

export interface ListModulesParams {
  search?: string;
  status?: ModuleStatus;
  subject?: string;
  semester?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest" | "title";
}

export interface ListModulesResult {
  data: Module[];
  total: number;
  page: number;
  pageSize: number;
}

/** Fetch the current user (or null). Throws on unexpected errors. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

/** User profile row dari tabel `users`. */
export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  role: string | null;
};

/**
 * Ambil profil user dari tabel `users`.
 * Mengembalikan null jika belum login atau belum punya row di `users`.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, institution, role")
    .eq("id", user.id)
    .maybeSingle();

  return (data as UserProfile | null) ?? null;
}

/**
 * Cek apakah user saat ini memiliki role admin.
 * Trade-off: membuat 2 query (auth + profile), tapi menjaga
 * separation of concerns antara auth dan business logic.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === "admin";
}

/** List modules belonging to the current user. */
export async function getModules(
  params: ListModulesParams = {},
): Promise<ListModulesResult> {
  const {
    search,
    status,
    subject,
    semester,
    page = 1,
    pageSize = 12,
    sort = "newest",
  } = params;

  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return { data: [], total: 0, page, pageSize };

  let query = supabase
    .from("modules")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (status) query = query.eq("status", status);
  if (subject) query = query.eq("subject", subject);
  if (semester) query = query.eq("semester", semester);
  if (search) query = query.ilike("title", `%${search}%`);

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "title":
      query = query.order("title", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    return { data: [], total: 0, page, pageSize };
  }

  return {
    data: (data ?? []) as Module[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** Get one module by id (own only). Returns null if not found. */
export async function getModuleById(id: string): Promise<Module | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Module;
}

export async function createModule(input: Omit<ModuleInsert, "user_id">) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("UNAUTHENTICATED");

  const { data, error } = await supabase
    .from("modules")
    // @ts-expect-error — Supabase generated types issue
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error("CREATE_FAILED");
  return data as Module;
}

export async function updateModule(
  id: string,
  patch: Partial<ModuleInsert>,
): Promise<Module> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    // @ts-expect-error — Supabase generated types resolve Update to never
    .update(patch as unknown as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("UPDATE_FAILED");
  return data as Module;
}

export async function deleteModule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw new Error("DELETE_FAILED");
}

export async function duplicateModule(id: string): Promise<Module> {
  const original = await getModuleById(id);
  if (!original) throw new Error("NOT_FOUND");
  const copy: Omit<ModuleInsert, "user_id"> = {
    title: `${original.title} (Salinan)`,
    code: original.code,
    subject: original.subject,
    semester: original.semester,
    program: original.program,
    lecturer: original.lecturer,
    lab: original.lab,
    academic_year: original.academic_year,
    status: "draft",
    template_id: original.template_id,
    content: original.content,
    metadata: original.metadata,
  };
  return createModule(copy);
}

export async function publishModule(id: string) {
  return updateModule(id, { status: "published" });
}

/** Aggregate counts for the dashboard. */
export interface DashboardStats {
  totalModules: number;
  draftCount: number;
  publishedCount: number;
  generateCount: number;
  exportCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  const empty: DashboardStats = {
    totalModules: 0,
    draftCount: 0,
    publishedCount: 0,
    generateCount: 0,
    exportCount: 0,
  };
  if (!user) return empty;

  const [total, draft, published, generates, exports] = await Promise.all([
    supabase
      .from("modules")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("modules")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "draft"),
    supabase
      .from("modules")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "published"),
    supabase
      .from("generated_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("exports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    totalModules: total.count ?? 0,
    draftCount: draft.count ?? 0,
    publishedCount: published.count ?? 0,
    generateCount: generates.count ?? 0,
    exportCount: exports.count ?? 0,
  };
}

export async function getRecentModules(limit = 5): Promise<Module[]> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data } = await supabase
    .from("modules")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Module[];
}

export interface ActivityItem {
  id: string;
  type: "module" | "generate" | "export";
  title: string;
  timestamp: string;
  status?: string;
}

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const [modules, generates, exports] = await Promise.all([
    supabase
      .from("modules")
      .select("id, title, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("generated_logs")
      .select("id, status, created_at, model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("exports")
      .select("id, format, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...((modules.data as any[]) ?? []).map((m) => ({
      id: `mod-${m.id}`,
      type: "module" as const,
      title: `Modul: ${m.title}`,
      timestamp: m.updated_at,
      status: m.status,
    })),
    ...((generates.data as any[]) ?? []).map((g) => ({
      id: `gen-${g.id}`,
      type: "generate" as const,
      title: `AI Generate (${g.model ?? "Gemini"})`,
      timestamp: g.created_at,
      status: g.status,
    })),
    ...((exports.data as any[]) ?? []).map((e) => ({
      id: `exp-${e.id}`,
      type: "export" as const,
      title: `Export ${e.format.toUpperCase()}`,
      timestamp: e.created_at,
      status: e.status,
    })),
  ]
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, limit);

  return items;
}

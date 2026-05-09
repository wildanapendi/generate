import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateTemplate, deleteTemplate } from "@/services/templates";
import type { TemplateConfig } from "@/types/template";

export const runtime = "nodejs";

interface PatchBody {
  name?: string;
  description?: string | null;
  config?: TemplateConfig;
}

/**
 * Helper: validasi bahwa user yang sedang login adalah admin.
 * Mengembalikan NextResponse 401/403 jika tidak valid, atau null jika ok.
 */
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Hanya admin yang dapat mengelola template." },
      { status: 403 },
    );
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const forbidden = await requireAdmin(supabase, user.id);
  if (forbidden) return forbidden;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  try {
    await updateTemplate(id, body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const forbidden = await requireAdmin(supabase, user.id);
  if (forbidden) return forbidden;

  try {
    await deleteTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}

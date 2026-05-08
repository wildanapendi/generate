import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { ModuleContent } from "@/types/module";

export const runtime = "nodejs";

interface PatchBody {
  title?: string;
  code?: string | null;
  subject?: string | null;
  semester?: string | null;
  program?: string | null;
  lecturer?: string | null;
  lab?: string | null;
  academic_year?: string | null;
  status?: "draft" | "published" | "archived";
  content?: ModuleContent;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.code !== undefined) patch.code = body.code;
  if (body.subject !== undefined) patch.subject = body.subject;
  if (body.semester !== undefined) patch.semester = body.semester;
  if (body.program !== undefined) patch.program = body.program;
  if (body.lecturer !== undefined) patch.lecturer = body.lecturer;
  if (body.lab !== undefined) patch.lab = body.lab;
  if (body.academic_year !== undefined) patch.academic_year = body.academic_year;
  if (body.status !== undefined) patch.status = body.status;
  if (body.content !== undefined) patch.content = body.content as unknown as Json;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("modules")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("modules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

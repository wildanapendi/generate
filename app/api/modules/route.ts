import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ModuleContent } from "@/types/module";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

/**
 * POST /api/modules
 * Membuat modul baru secara manual (tanpa AI generate).
 * Body: { title, code?, subject?, semester?, program?, lecturer?, lab?, academic_year?, template_id?, content? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: {
    title?: string;
    code?: string | null;
    subject?: string | null;
    semester?: string | null;
    program?: string | null;
    lecturer?: string | null;
    lab?: string | null;
    academic_year?: string | null;
    template_id?: string | null;
    content?: ModuleContent;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "TITLE_REQUIRED" }, { status: 400 });
  }

  // Default content: empty sections jika tidak disuplai
  const content: ModuleContent = body.content ?? {
    sections: [],
    toc: true,
    version: 1,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("modules")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      code: body.code ?? null,
      subject: body.subject ?? null,
      semester: body.semester ?? null,
      program: body.program ?? null,
      lecturer: body.lecturer ?? null,
      lab: body.lab ?? null,
      academic_year: body.academic_year ?? null,
      template_id: body.template_id ?? null,
      status: "draft",
      content: content as unknown as Json,
      metadata: {
        createdAt: new Date().toISOString(),
        source: "manual",
      },
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

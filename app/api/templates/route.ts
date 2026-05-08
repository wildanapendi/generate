import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTemplate } from "@/services/templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: { name?: string; description?: string | null };
  try {
    body = (await req.json()) as { name?: string; description?: string | null };
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
  }

  try {
    const t = await createTemplate({
      name: body.name.trim(),
      description: body.description ?? null,
    });
    return NextResponse.json({ id: t.id });
  } catch {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}

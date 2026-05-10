import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { updateTemplate, deleteTemplate } from "@/services/templates";
import type { TemplateConfig } from "@/types/template";

export const runtime = "nodejs";

interface PatchBody {
  name?: string;
  description?: string | null;
  config?: TemplateConfig;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Hanya admin yang dapat mengelola template." },
      { status: 403 },
    );
  }

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
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Hanya admin yang dapat mengelola template." },
      { status: 403 },
    );
  }

  try {
    await deleteTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}

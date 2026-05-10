import { NextResponse, type NextRequest } from "next/server";
import { createTemplate } from "@/services/templates";
import { getSessionUser } from "@/lib/auth/get-session-user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Hanya admin yang dapat membuat template." },
      { status: 403 },
    );
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

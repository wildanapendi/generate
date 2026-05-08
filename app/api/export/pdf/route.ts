import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/export/pdf
 * Body: { moduleId: string }
 *
 * Fetches the module and logs the export.
 * Actual PDF generation happens client-side using jsPDF for realtime preview fidelity.
 * This route records the export event in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = (await req.json()) as { moduleId?: string };
    if (!body.moduleId) {
      return NextResponse.json(
        { error: "moduleId is required" },
        { status: 400 },
      );
    }

    // Verify module ownership
    const { data: module } = await supabase
      .from("modules")
      .select("id, title")
      .eq("id", body.moduleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!module) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Log export event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("exports").insert({
      user_id: user.id,
      module_id: body.moduleId,
      format: "pdf",
      status: "completed",
    });

    return NextResponse.json({ ok: true, module });
  } catch {
    return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });
  }
}

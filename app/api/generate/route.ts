import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateModule } from "@/services/ai-generate";
import type { GenerateInput } from "@/types/module";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  // Parse body.
  let body: GenerateInput;
  try {
    body = (await req.json()) as GenerateInput;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.subject || !body.topic || !body.semester || !body.program) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (!Array.isArray(body.learningOutcomes)) body.learningOutcomes = [];

  try {
    const output = await generateModule(body);

    // Persist module + log (best effort).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: createError } = await (supabase as any)
      .from("modules")
      .insert({
        user_id: user.id,
        title: output.title,
        code: output.code ?? null,
        subject: output.subject,
        semester: output.semester,
        program: output.program,
        status: "draft",
        content: output.content,
        metadata: output.metadata,
      })
      .select("id")
      .single();

    if (createError) {
      return NextResponse.json(
        { error: "PERSIST_FAILED" },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("generated_logs").insert({
      user_id: user.id,
      module_id: created.id,
      prompt: body,
      model: output.metadata.model,
      status: "success",
    });

    return NextResponse.json(
      { id: created.id, output },
      { status: 200 },
    );
  } catch (err) {
    console.error("GENERATE_API_ERROR", err);
    const message =
      err instanceof Error ? err.message : "GENERATE_FAILED";

    // Best-effort log (don't surface raw error message).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("generated_logs")
      .insert({
        user_id: user.id,
        prompt: body,
        status: "failed",
        error_message: message,
      })
      .then(() => {});

    if (message === "GEMINI_API_KEY_MISSING") {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message:
            "Gemini API key belum dikonfigurasi. Isi GEMINI_API_KEY di .env.local.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "GENERATE_FAILED",
        message:
          "Gagal membuat modul. Coba lagi atau periksa parameter input.",
        details: message, // <--- Surfacing the real error message for debugging
      },
      { status: 500 },
    );
  }
}

import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { GenerateInput, GenerateOutput, ModuleContent } from "@/types/module";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

/**
 * Build a structured prompt that asks Gemini to return JSON describing a
 * complete lab module.
 */
export function buildPrompt(input: GenerateInput): string {
  const lang = input.language ?? "id";
  const langName = lang === "id" ? "Bahasa Indonesia" : "English";
  const outcomes = input.learningOutcomes.length
    ? input.learningOutcomes.map((o, i) => `  ${i + 1}. ${o}`).join("\n")
    : "  - (tidak disebutkan)";

  return `Anda adalah ahli kurikulum perguruan tinggi yang merancang modul praktikum laboratorium berbahasa ${langName}.

Hasilkan modul praktikum yang LENGKAP dan PROFESIONAL berdasarkan parameter berikut:

- Mata Kuliah: ${input.subject}
- Topik: ${input.topic}
- Semester: ${input.semester}
- Program Studi: ${input.program}
- Tingkat kesulitan: ${input.difficulty}
- Durasi (menit): ${input.duration ?? 120}
- Capaian Pembelajaran:
${outcomes}

Modul HARUS terdiri dari section-section berikut (gunakan tipe yang sesuai):

1. Tujuan Praktikum         (type: "objective")
2. Dasar Teori              (type: "paragraph")
3. Alat dan Bahan           (type: "list")
4. Prosedur Praktikum       (type: "procedure")
5. Lembar Kerja / Hasil     (type: "result")
6. Pembahasan & Analisis    (type: "discussion")
7. Kesimpulan               (type: "paragraph")
8. Referensi                (type: "reference")

KEMBALIKAN HANYA JSON VALID dengan struktur berikut, TANPA markdown code fence, TANPA komentar:

{
  "title": "Judul modul",
  "code": "Kode singkat opsional",
  "subject": "Mata kuliah",
  "semester": "Semester",
  "program": "Program studi",
  "sections": [
    { "id": "sec-1", "type": "objective", "title": "Tujuan Praktikum", "content": "...", "order": 1 },
    { "id": "sec-2", "type": "paragraph", "title": "Dasar Teori", "content": "...", "order": 2 }
  ]
}

Aturan tambahan:
- Setiap "content" berisi teks bermakna, MINIMAL 80 kata kecuali untuk section list (yang berisi item-item dipisahkan baris baru).
- Untuk rumus matematika, gunakan notasi LaTeX inline ($...$) atau block ($$...$$).
- Jangan menyertakan teks lain di luar JSON.`;
}

/**
 * Try to extract JSON from Gemini's response (handles ```json fences too).
 */
export function parseResponse(raw: string): {
  title: string;
  code?: string;
  subject?: string;
  semester?: string;
  program?: string;
  sections: ModuleContent["sections"];
} {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Find the first { ... } block.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("INVALID_RESPONSE");
  }
  const json = text.slice(start, end + 1);
  const parsed = JSON.parse(json) as {
    title?: string;
    code?: string;
    subject?: string;
    semester?: string;
    program?: string;
    sections?: Array<Partial<ModuleContent["sections"][number]>>;
  };

  if (!parsed.title || !Array.isArray(parsed.sections)) {
    throw new Error("INVALID_RESPONSE_SHAPE");
  }

  const sections = parsed.sections.map((s, i) => ({
    id: (s.id as string | undefined) ?? `sec-${i + 1}`,
    type:
      (s.type as ModuleContent["sections"][number]["type"]) ?? "paragraph",
    title: s.title as string | undefined,
    content: (s.content as string | undefined) ?? "",
    order: (s.order as number | undefined) ?? i + 1,
  }));

  return {
    title: parsed.title,
    code: parsed.code,
    subject: parsed.subject,
    semester: parsed.semester,
    program: parsed.program,
    sections,
  };
}

export async function generateModule(
  input: GenerateInput,
): Promise<GenerateOutput> {
  const ai = client();
  const prompt = buildPrompt(input);

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      temperature: 0.6,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  if (!text) throw new Error("EMPTY_RESPONSE");

  const parsed = parseResponse(text);

  return {
    title: parsed.title,
    code: parsed.code,
    subject: parsed.subject || input.subject,
    semester: parsed.semester || input.semester,
    program: parsed.program || input.program,
    content: {
      sections: parsed.sections,
      toc: true,
      version: 1,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      model: DEFAULT_MODEL,
      inputs: input,
    },
  };
}

export async function rewriteSection(
  sectionContent: string,
  instruction: string,
): Promise<string> {
  const ai = client();
  const prompt = `Tulis ulang teks berikut sesuai instruksi.\n\nInstruksi: ${instruction}\n\nTeks:\n${sectionContent}\n\nKembalikan teks hasil tulisan ulang saja, tanpa pembuka.`;
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
  });
  return response.text?.trim() ?? sectionContent;
}

export async function improveWriting(text: string): Promise<string> {
  return rewriteSection(text, "Perbaiki gaya bahasa, tata bahasa, dan kejelasan tanpa mengubah makna.");
}

export async function extendContent(text: string): Promise<string> {
  return rewriteSection(text, "Perpanjang penjelasan dengan informasi yang relevan dan akurat.");
}

export async function summarizeContent(text: string): Promise<string> {
  return rewriteSection(text, "Ringkas menjadi paragraf padat tanpa kehilangan poin utama.");
}

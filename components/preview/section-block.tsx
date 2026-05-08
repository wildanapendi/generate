import type { ModuleSection } from "@/types/module";

const TYPE_LABEL: Partial<Record<ModuleSection["type"], string>> = {
  objective: "Tujuan Praktikum",
  procedure: "Prosedur",
  result: "Hasil",
  discussion: "Pembahasan",
  reference: "Referensi",
};

interface SectionBlockProps {
  section: ModuleSection;
  index: number;
}

export function SectionBlock({ section, index }: SectionBlockProps) {
  const heading =
    section.title ?? TYPE_LABEL[section.type] ?? `Section ${index + 1}`;

  // Section content is HTML produced by TipTap; sanitisation is server-side
  // before persistence (TipTap escapes input text by default).
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">
        {index + 1}. {heading}
      </h2>
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: section.content || "" }}
      />
    </section>
  );
}

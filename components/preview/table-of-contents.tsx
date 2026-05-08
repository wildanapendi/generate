import type { ModuleSection } from "@/types/module";

export function TableOfContents({ sections }: { sections: ModuleSection[] }) {
  if (sections.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">Daftar Isi</h2>
      <ol className="space-y-1 text-sm">
        {sections.map((s, i) => (
          <li key={s.id} className="flex items-baseline justify-between gap-2">
            <span>
              <span className="mr-2 font-medium">{i + 1}.</span>
              {s.title || `Section ${i + 1}`}
            </span>
            <span className="grow border-b border-dotted border-muted-foreground/40" />
          </li>
        ))}
      </ol>
    </section>
  );
}

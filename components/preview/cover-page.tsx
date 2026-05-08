import type { CoverConfig } from "@/types/template";
import type { Module } from "@/types/module";

interface CoverPageProps {
  module: Module;
  config: CoverConfig;
}

export function CoverPage({ module, config }: CoverPageProps) {
  if (!config.enabled) return null;

  const title = config.title || module.title;
  const subtitle = config.subtitle || module.subject;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-6 text-center"
      style={{
        backgroundColor: config.backgroundColor,
        backgroundImage: config.backgroundUrl
          ? `url(${config.backgroundUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.logoUrl}
          alt="Logo"
          style={{ width: config.logoSize ?? 96 }}
          className="object-contain"
        />
      )}
      <div className="space-y-2 px-12">
        <h1 className="text-4xl font-bold tracking-tight">MODUL PRAKTIKUM</h1>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-base text-muted-foreground">{subtitle}</p>
        )}
        {module.code && (
          <p className="text-sm text-muted-foreground">Kode: {module.code}</p>
        )}
      </div>
      <div className="space-y-1 text-sm">
        {config.showLecturer && module.lecturer && (
          <p>Dosen Pengampu: {module.lecturer}</p>
        )}
        {config.showProgram && module.program && (
          <p>{module.program}</p>
        )}
        {config.showAcademicYear && module.academic_year && (
          <p>Tahun Akademik {module.academic_year}</p>
        )}
      </div>
    </div>
  );
}

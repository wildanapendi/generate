import type { HeaderConfig, FooterConfig } from "@/types/template";

export function PageHeader({
  config,
  isFirstPage,
}: {
  config: HeaderConfig;
  isFirstPage?: boolean;
}) {
  if (!config.enabled) return null;
  if (isFirstPage && config.differentFirstPage) return null;

  return (
    <header
      className="flex items-center justify-between border-b pb-2 text-xs text-muted-foreground"
      style={{ minHeight: config.height ?? 48 }}
    >
      <div className="flex items-center gap-2">
        {config.showLogo && config.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.logoUrl}
            alt="Logo"
            className="h-6 w-auto object-contain"
          />
        )}
        <span>{config.text}</span>
      </div>
    </header>
  );
}

export function PageFooter({
  config,
  pageNumber,
  pageCount,
}: {
  config: FooterConfig;
  pageNumber: number;
  pageCount: number;
}) {
  if (!config.enabled) return null;
  return (
    <footer className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
      <span>{config.text}</span>
      <div className="flex items-center gap-3">
        {config.showCopyright && config.copyright && <span>{config.copyright}</span>}
        {config.showPageNumber && (
          <span>
            {pageNumber} / {pageCount}
          </span>
        )}
      </div>
    </footer>
  );
}

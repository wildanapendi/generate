/** Lightweight relative-time formatter (id-ID). */
export function formatRelativeIndo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);

  if (abs < 60) return "baru saja";
  if (abs < 3600) return `${Math.round(abs / 60)} menit lalu`;
  if (abs < 86_400) return `${Math.round(abs / 3600)} jam lalu`;
  if (abs < 7 * 86_400) return `${Math.round(abs / 86_400)} hari lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateIndo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

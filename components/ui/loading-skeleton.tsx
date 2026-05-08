import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Full-page loading skeleton for dashboard pages. */
export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Card skeleton. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm space-y-3",
        className,
      )}
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

/** Stat card skeleton (for dashboard). */
export function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/** Table skeleton. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Editor skeleton (split layout). */
export function EditorSkeleton() {
  return (
    <div className="grid h-[calc(100vh-120px)] grid-cols-2 gap-4">
      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex items-center justify-center rounded-lg border bg-muted/30">
        <Skeleton className="h-[500px] w-[350px]" />
      </div>
    </div>
  );
}

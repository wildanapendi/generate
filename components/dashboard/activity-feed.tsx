import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Download, FileEdit, Sparkles } from "lucide-react";
import type { ActivityItem } from "@/services/modules";
import { formatRelativeIndo } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<ActivityItem["type"], React.ComponentType<{ className?: string }>> = {
  module: FileEdit,
  generate: Sparkles,
  export: Download,
};

const COLORS: Record<ActivityItem["type"], string> = {
  module: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  generate: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  export: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>
          Catatan tindakan terbaru di akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Activity className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = ICONS[item.type];
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-md",
                    COLORS[item.type],
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeIndo(item.timestamp)}
                    {item.status ? ` · ${item.status}` : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

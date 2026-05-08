import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  FileEdit,
  CheckCircle2,
  Sparkles,
  Download,
} from "lucide-react";
import type { DashboardStats } from "@/services/modules";

const ITEMS: Array<{
  key: keyof DashboardStats;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "totalModules",
    label: "Total Modul",
    description: "Seluruh modul yang Anda kelola",
    icon: FileText,
  },
  {
    key: "draftCount",
    label: "Draft",
    description: "Belum dipublikasikan",
    icon: FileEdit,
  },
  {
    key: "publishedCount",
    label: "Published",
    description: "Sudah dipublikasikan",
    icon: CheckCircle2,
  },
  {
    key: "generateCount",
    label: "AI Generates",
    description: "Konten dibuat dengan Gemini",
    icon: Sparkles,
  },
  {
    key: "exportCount",
    label: "Export",
    description: "PDF & DOCX yang dihasilkan",
    icon: Download,
  },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {ITEMS.map(({ key, label, description, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-5 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-semibold tracking-tight">
              {stats[key]}
            </div>
            <CardDescription className="mt-1">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentModules } from "@/components/dashboard/recent-modules";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  getDashboardStats,
  getRecentModules,
  getRecentActivity,
} from "@/services/modules";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan modul, aktivitas, dan aksi cepat.",
};

export default async function DashboardPage() {
  const [stats, recent, activity] = await Promise.all([
    getDashboardStats(),
    getRecentModules(5),
    getRecentActivity(8),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan modul praktikum dan aktivitas terbaru Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/modules">
              <Plus className="size-4" />
              Modul baru
            </Link>
          </Button>
          <Button asChild>
            <Link href="/generate">
              <Sparkles className="size-4" />
              Generate dengan AI
            </Link>
          </Button>
        </div>
      </header>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentModules modules={recent} />
        </div>
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}

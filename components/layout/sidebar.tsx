"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Sparkles,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Jika true, item hanya tampil untuk admin */
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modul", icon: FileText },
  { href: "/templates", label: "Template", icon: LayoutTemplate, adminOnly: true },
  { href: "/generate", label: "Generate Modul", icon: Sparkles },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  /** Apakah user saat ini adalah admin */
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter nav items berdasarkan role — sembunyikan menu admin-only untuk user biasa
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const desktop = (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <span className="font-bold">M</span>
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">
            Modul Praktikum
          </span>
          <span className="text-xs text-muted-foreground">Generator</span>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  const mobile = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="space-y-1 p-3">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}

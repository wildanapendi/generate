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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Role minimum yang dibutuhkan. Undefined = semua role bisa akses. */
  requiredRole?: UserRole;
}

/**
 * Declarative nav items — filter berdasarkan `requiredRole`.
 * Menambahkan menu admin-only baru cukup tambahkan entry dengan requiredRole.
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modul", icon: FileText },
  { href: "/templates", label: "Template", icon: LayoutTemplate, requiredRole: "admin" },
  { href: "/generate", label: "Generate Modul", icon: Sparkles },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  /** Role user saat ini — dari getSessionUser() */
  role?: UserRole;
}

export function DesktopSidebar({ role = "lecturer" }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === role,
  );

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
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
}

export function MobileSidebar({ role = "lecturer" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === role,
  );

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
        <SheetDescription className="sr-only">Navigasi menu utama untuk aplikasi</SheetDescription>
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-semibold">Menu</span>
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
      </SheetContent>
    </Sheet>
  );
}

// Keep the default export or original Sidebar as a wrapper if needed, 
// but it's better to update layout and navbar to use the split components.
export function Sidebar(props: SidebarProps) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
}


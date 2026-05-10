import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { UserRole } from "@/types/auth";

interface NavbarProps {
  email?: string | null;
  fullName?: string | null;
  /** Role user — passed ke mobile Sidebar trigger untuk filtering nav items */
  role?: UserRole;
}

export function Navbar({ email, fullName, role }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      {/* Mobile sidebar trigger — role di-pass agar nav items ter-filter */}
      <div className="md:hidden">
        <Sidebar role={role} />
      </div>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu email={email} fullName={fullName} />
    </header>
  );
}


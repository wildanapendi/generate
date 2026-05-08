import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavbarProps {
  email?: string | null;
  fullName?: string | null;
}

export function Navbar({ email, fullName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <Sidebar />
      </div>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu email={email} fullName={fullName} />
    </header>
  );
}

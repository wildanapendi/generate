import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/30">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold">M</span>
          </span>
          <span className="hidden text-sm sm:block">
            Modul Praktikum Generator
          </span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Modul Praktikum Generator
      </footer>
    </div>
  );
}

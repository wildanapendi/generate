import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ForbiddenToast } from "./forbidden-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single source of truth — satu call untuk auth + profile + role
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar email={user.email} fullName={user.fullName} role={user.role} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      {/* Toast handler untuk redirect dari admin-only routes */}
      <Suspense fallback={null}>
        <ForbiddenToast />
      </Suspense>
    </div>
  );
}


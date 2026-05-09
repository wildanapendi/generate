import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pull profile name & role (best-effort, single query).
  let fullName: string | null = null;
  let isAdmin = false;
  try {
    const { data } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    const profile = data as Record<string, unknown> | null;
    fullName = (profile?.full_name as string | undefined) ?? null;
    isAdmin = profile?.role === "admin";
  } catch {
    /* ignore */
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar email={user.email} fullName={fullName} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

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

  // Pull profile name (best-effort).
  let fullName: string | null = null;
  try {
    const { data } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    fullName = ((data as Record<string, unknown> | null)?.full_name as string | undefined) ?? null;
  } catch {
    /* ignore */
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar email={user.email} fullName={fullName} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

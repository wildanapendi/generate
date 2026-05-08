import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as Record<string, unknown> | null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil dan preferensi akun Anda.
        </p>
      </header>

      <SettingsForm
        email={user.email ?? ""}
        fullName={(p?.full_name as string) ?? ""}
        institution={(p?.institution as string) ?? ""}
        avatarUrl={(p?.avatar_url as string) ?? ""}
      />
    </div>
  );
}

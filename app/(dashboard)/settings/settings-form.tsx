"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

interface SettingsFormProps {
  email: string;
  fullName: string;
  institution: string;
  avatarUrl: string;
}

export function SettingsForm({
  email,
  fullName: initialName,
  institution: initialInstitution,
}: SettingsFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [institution, setInstitution] = useState(initialInstitution);
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("users")
        .update({ full_name: fullName, institution })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil berhasil disimpan");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal mengubah password");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Informasi dasar yang ditampilkan pada modul Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-name">Nama Lengkap</Label>
            <Input
              id="settings-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Nama Dosen, M.Sc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-institution">Institusi</Label>
            <Input
              id="settings-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Universitas / Politeknik"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Simpan Profil
          </Button>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Perbarui password akun Anda. Minimal 8 karakter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-new-pw">Password Baru</Label>
            <Input
              id="settings-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-confirm-pw">Konfirmasi Password</Label>
            <Input
              id="settings-confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru"
            />
          </div>

          <Button onClick={handleChangePassword} disabled={changingPassword}>
            {changingPassword ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 size-4" />
            )}
            Ubah Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

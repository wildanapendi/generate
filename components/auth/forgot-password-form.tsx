"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const supabase = createClient();
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/settings`,
        });
        if (error) {
          toast.error("Tidak dapat mengirim email", {
            description: error.message,
          });
          return;
        }
        setSent(true);
        toast.success("Link reset password telah dikirim");
      } catch {
        toast.error("Tidak dapat menghubungi server", {
          description:
            "Pastikan environment variables Supabase sudah dikonfigurasi.",
        });
      }
    });
  }

  if (sent) {
    return (
      <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
        Email berisi link reset password telah dikirim ke{" "}
        <strong className="text-foreground">{email}</strong>. Periksa inbox
        atau folder spam Anda.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nama@kampus.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim…
          </>
        ) : (
          "Kirim link reset"
        )}
      </Button>
    </form>
  );
}

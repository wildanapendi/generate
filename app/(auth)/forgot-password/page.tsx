import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Reset password akun Anda.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Lupa password?</CardTitle>
        <CardDescription>
          Masukkan email Anda. Kami akan mengirim link untuk reset password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotPasswordForm />
        <p className="text-center text-sm text-muted-foreground">
          Ingat password Anda?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Kembali ke login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke akun Modul Praktikum Generator.",
};

export default function LoginPage() {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Selamat datang kembali</CardTitle>
        <CardDescription>
          Masuk untuk melanjutkan ke dashboard Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

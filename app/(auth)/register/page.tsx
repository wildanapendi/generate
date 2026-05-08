import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Modul Praktikum Generator.",
};

export default function RegisterPage() {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Buat akun baru</CardTitle>
        <CardDescription>
          Mulai membuat modul praktikum profesional dengan AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

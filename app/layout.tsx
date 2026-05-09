import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Modul Praktikum Generator",
    template: "%s | Modul Praktikum Generator",
  },
  description:
    "Platform SaaS akademik untuk dosen membuat, mengedit, dan mengexport modul praktikum profesional dengan dukungan AI.",
  keywords: [
    "modul praktikum",
    "lab module",
    "akademik",
    "dosen",
    "AI generator",
    "Gemini",
  ],
  authors: [{ name: "Modul Praktikum Generator" }],
  openGraph: {
    title: "Modul Praktikum Generator",
    description: "Buat modul praktikum profesional dengan AI dalam hitungan menit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

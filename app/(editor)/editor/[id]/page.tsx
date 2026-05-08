import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModuleEditor } from "@/components/editor/module-editor";
import { getModuleById } from "@/services/modules";

export const metadata: Metadata = { title: "Editor Modul" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { id } = await params;
  const mod = await getModuleById(id);
  if (!mod) notFound();
  return <ModuleEditor module={mod} />;
}

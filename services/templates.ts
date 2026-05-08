import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Template, TemplateInsert } from "@/types/module";
import {
  type TemplateConfig,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";
import type { Json } from "@/types/database";

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as Template[];
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Template | null) ?? null;
}

export async function createTemplate(
  input: Omit<TemplateInsert, "user_id" | "config"> & {
    config?: TemplateConfig;
  },
): Promise<Template> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("UNAUTHENTICATED");

  const config = (input.config ?? DEFAULT_TEMPLATE_CONFIG) as unknown as Json;
  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description ?? null,
      is_default: input.is_default ?? false,
      config,
    })
    .select()
    .single();
  if (error) throw new Error("CREATE_FAILED");
  return data as Template;
}

export async function updateTemplate(
  id: string,
  patch: { name?: string; description?: string | null; config?: TemplateConfig },
) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.config !== undefined)
    update.config = patch.config as unknown as Json;
  const { data, error } = await supabase
    .from("templates")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("UPDATE_FAILED");
  return data as Template;
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw new Error("DELETE_FAILED");
}

export async function duplicateTemplate(id: string): Promise<Template> {
  const original = await getTemplateById(id);
  if (!original) throw new Error("NOT_FOUND");
  return createTemplate({
    name: `${original.name} (Salinan)`,
    description: original.description,
    config: original.config as unknown as TemplateConfig,
  });
}

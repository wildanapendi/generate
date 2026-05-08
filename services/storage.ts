"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "module-assets";

/**
 * Upload an image to Supabase Storage under the user's folder.
 * Returns the public-or-signed URL.
 */
export async function uploadImage(
  file: File,
  userId: string,
): Promise<{ path: string; url: string }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error("UPLOAD_FAILED");

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
  return { path, url: data?.signedUrl ?? "" };
}

export async function deleteImage(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error("DELETE_FAILED");
}

export async function getImageUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // 1 hour
  return data?.signedUrl ?? "";
}

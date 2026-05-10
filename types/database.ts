/**
 * Database types for Supabase.
 * These mirror the schema defined in `supabase/schema.sql`.
 *
 * For production, regenerate with:
 *   supabase gen types typescript --project-id <id> > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          institution: string | null;
          role: "admin" | "lecturer" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          institution?: string | null;
          role?: "admin" | "lecturer" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          institution?: string | null;
          role?: "admin" | "lecturer" | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          title: string;
          code: string | null;
          subject: string | null;
          semester: string | null;
          program: string | null;
          lecturer: string | null;
          lab: string | null;
          academic_year: string | null;
          status: "draft" | "published" | "archived";
          content: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          title: string;
          code?: string | null;
          subject?: string | null;
          semester?: string | null;
          program?: string | null;
          lecturer?: string | null;
          lab?: string | null;
          academic_year?: string | null;
          status?: "draft" | "published" | "archived";
          content?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          config: Json;
          preview_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          config?: Json;
          preview_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["templates"]["Insert"]>;
      };
      exports: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          format: "pdf" | "docx";
          file_path: string | null;
          file_size: number | null;
          status: "pending" | "completed" | "failed";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          format: "pdf" | "docx";
          file_path?: string | null;
          file_size?: number | null;
          status?: "pending" | "completed" | "failed";
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exports"]["Insert"]>;
      };
      generated_logs: {
        Row: {
          id: string;
          user_id: string;
          module_id: string | null;
          prompt: Json;
          tokens_used: number | null;
          model: string | null;
          status: "success" | "failed";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id?: string | null;
          prompt: Json;
          tokens_used?: number | null;
          model?: string | null;
          status?: "success" | "failed";
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["generated_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "lecturer";
    };
  };
}

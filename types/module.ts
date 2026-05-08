import type { Database } from "./database";

export type Module = Database["public"]["Tables"]["modules"]["Row"];
export type ModuleInsert = Database["public"]["Tables"]["modules"]["Insert"];
export type ModuleUpdate = Database["public"]["Tables"]["modules"]["Update"];

export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type TemplateInsert = Database["public"]["Tables"]["templates"]["Insert"];

export type ExportRecord = Database["public"]["Tables"]["exports"]["Row"];
export type GenerateLog = Database["public"]["Tables"]["generated_logs"]["Row"];

export type ModuleStatus = "draft" | "published" | "archived";

export interface ModuleSection {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "table"
    | "image"
    | "code"
    | "formula"
    | "objective"
    | "procedure"
    | "result"
    | "discussion"
    | "reference";
  title?: string;
  content: string;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface ModuleContent {
  sections: ModuleSection[];
  cover?: {
    title?: string;
    subtitle?: string;
    logo?: string;
    background?: string;
  };
  toc?: boolean;
  version?: number;
}

export interface GenerateInput {
  subject: string;
  topic: string;
  semester: string;
  program: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  learningOutcomes: string[];
  templateId?: string;
  duration?: number; // in minutes
  language?: "id" | "en";
}

export interface GenerateOutput {
  title: string;
  code?: string;
  subject: string;
  semester: string;
  program: string;
  content: ModuleContent;
  metadata: {
    generatedAt: string;
    model: string;
    inputs: GenerateInput;
  };
}

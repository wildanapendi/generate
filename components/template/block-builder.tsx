"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Type,
  Heading1,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Quote,
  Code,
  FunctionSquare,
  Hash,
  PenSquare,
} from "lucide-react";

interface BlockTemplate {
  type:
    | "text"
    | "heading"
    | "image"
    | "table"
    | "divider"
    | "quote"
    | "code"
    | "formula"
    | "equation-numbering"
    | "signature";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BLOCKS: BlockTemplate[] = [
  { type: "text", label: "Teks", icon: Type },
  { type: "heading", label: "Heading", icon: Heading1 },
  { type: "image", label: "Gambar", icon: ImageIcon },
  { type: "table", label: "Tabel", icon: TableIcon },
  { type: "divider", label: "Pembatas", icon: Minus },
  { type: "quote", label: "Kutipan", icon: Quote },
  { type: "code", label: "Kode", icon: Code },
  { type: "formula", label: "Rumus / LaTeX", icon: FunctionSquare },
  {
    type: "equation-numbering",
    label: "Penomoran rumus",
    icon: Hash,
  },
  { type: "signature", label: "Tanda tangan", icon: PenSquare },
];

interface BlockBuilderProps {
  onPick?: (type: BlockTemplate["type"]) => void;
}

export function BlockBuilder({ onPick }: BlockBuilderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Block Library</CardTitle>
        <CardDescription>
          Klik untuk menambahkan blok ke template (saat designer dijalankan
          dalam mode bangun template).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.type}
              type="button"
              onClick={() => onPick?.(b.type)}
              className="flex flex-col items-center gap-1.5 rounded-md border bg-background p-3 text-xs transition-colors hover:border-ring hover:bg-muted"
            >
              <Icon className="size-5" />
              {b.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

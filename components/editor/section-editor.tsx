"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { LatexExtension } from "./latex-extension";
import { EditorToolbar } from "./editor-toolbar";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  initialHTML: string;
  placeholder?: string;
  onChange: (html: string) => void;
  className?: string;
}

/**
 * Lightweight rich-text editor for a single module section.
 * Persists changes via `onChange` (caller debounces).
 */
export function SectionEditor({
  initialHTML,
  placeholder = "Tulis konten section di sini…",
  onChange,
  className,
}: SectionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      LatexExtension,
    ],
    content: initialHTML,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-40 px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep external content in sync when section switches.
  useEffect(() => {
    if (editor && initialHTML !== editor.getHTML()) {
      editor.commands.setContent(initialHTML, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHTML]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <EditorToolbar editor={editor} />
      <div className="rounded-md border bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

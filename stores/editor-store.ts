"use client";

import { create } from "zustand";
import type { Module, ModuleContent, ModuleSection } from "@/types/module";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorStoreState {
  module: Module | null;
  content: ModuleContent;
  isDirty: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;

  load: (mod: Module) => void;
  setContent: (content: ModuleContent) => void;
  setSection: (id: string, patch: Partial<ModuleSection>) => void;
  addSection: (section: ModuleSection) => void;
  removeSection: (id: string) => void;
  reorderSections: (ids: string[]) => void;
  setStatus: (status: SaveStatus) => void;
  markSaved: () => void;
}

const EMPTY_CONTENT: ModuleContent = { sections: [], toc: true, version: 1 };

export const useEditorStore = create<EditorStoreState>((set, _get) => ({
  module: null,
  content: EMPTY_CONTENT,
  isDirty: false,
  saveStatus: "idle",
  lastSavedAt: null,

  load: (mod) =>
    set({
      module: mod,
      content:
        ((mod.content as unknown) as ModuleContent) ?? EMPTY_CONTENT,
      isDirty: false,
      saveStatus: "idle",
      lastSavedAt: mod.updated_at,
    }),

  setContent: (content) => set({ content, isDirty: true }),

  setSection: (id, patch) =>
    set((state) => ({
      isDirty: true,
      content: {
        ...state.content,
        sections: state.content.sections.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      },
    })),

  addSection: (section) =>
    set((state) => ({
      isDirty: true,
      content: {
        ...state.content,
        sections: [...state.content.sections, section],
      },
    })),

  removeSection: (id) =>
    set((state) => ({
      isDirty: true,
      content: {
        ...state.content,
        sections: state.content.sections.filter((s) => s.id !== id),
      },
    })),

  reorderSections: (ids) =>
    set((state) => {
      const map = new Map(state.content.sections.map((s) => [s.id, s]));
      const reordered = ids
        .map((id, i) => {
          const s = map.get(id);
          return s ? { ...s, order: i + 1 } : null;
        })
        .filter(Boolean) as ModuleSection[];
      return {
        isDirty: true,
        content: { ...state.content, sections: reordered },
      };
    }),

  setStatus: (saveStatus) => set({ saveStatus }),

  markSaved: () =>
    set({
      isDirty: false,
      saveStatus: "saved",
      lastSavedAt: new Date().toISOString(),
    }),
}));

/** Selector helpers (avoid full re-renders). */
export const selectSections = (s: EditorStoreState) => s.content.sections;
export const selectActiveModule = (s: EditorStoreState) => s.module;
export const selectIsDirty = (s: EditorStoreState) => s.isDirty;

// Re-export getter so components can call get() from outside React.
export const getEditorState = useEditorStore.getState;

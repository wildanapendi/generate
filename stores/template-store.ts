"use client";

import { create } from "zustand";
import {
  type TemplateConfig,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";

type Section = keyof TemplateConfig;

interface TemplateStoreState {
  config: TemplateConfig;
  isDirty: boolean;
  set: <K extends Section>(section: K, patch: Partial<TemplateConfig[K]>) => void;
  load: (config: TemplateConfig) => void;
  reset: () => void;
  markClean: () => void;
}

export const useTemplateStore = create<TemplateStoreState>((set) => ({
  config: DEFAULT_TEMPLATE_CONFIG,
  isDirty: false,

  set: (section, patch) =>
    set((state) => ({
      isDirty: true,
      config: {
        ...state.config,
        [section]: { ...state.config[section], ...patch },
      },
    })),

  load: (config) => set({ config, isDirty: false }),

  reset: () => set({ config: DEFAULT_TEMPLATE_CONFIG, isDirty: true }),

  markClean: () => set({ isDirty: false }),
}));

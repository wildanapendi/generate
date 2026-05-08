"use client";

import { create } from "zustand";
import type { GenerateInput } from "@/types/module";

export type GenerateStage =
  | "idle"
  | "preparing"
  | "drafting"
  | "structuring"
  | "polishing"
  | "saving"
  | "done"
  | "error";

interface GenerateStoreState {
  stage: GenerateStage;
  progress: number;
  error: string | null;
  resultId: string | null;
  retries: number;

  start: () => void;
  setStage: (stage: GenerateStage, progress?: number) => void;
  succeed: (id: string) => void;
  fail: (message: string) => void;
  reset: () => void;
  generate: (
    input: GenerateInput,
  ) => Promise<{ ok: boolean; id?: string; message?: string }>;
}

const STAGE_PROGRESS: Record<GenerateStage, number> = {
  idle: 0,
  preparing: 10,
  drafting: 35,
  structuring: 60,
  polishing: 80,
  saving: 95,
  done: 100,
  error: 100,
};

export const useGenerateStore = create<GenerateStoreState>((set, get) => ({
  stage: "idle",
  progress: 0,
  error: null,
  resultId: null,
  retries: 0,

  start: () =>
    set({ stage: "preparing", progress: STAGE_PROGRESS.preparing, error: null, resultId: null }),

  setStage: (stage, progress) =>
    set({ stage, progress: progress ?? STAGE_PROGRESS[stage] }),

  succeed: (id) =>
    set({ stage: "done", progress: 100, resultId: id, error: null }),

  fail: (message) =>
    set({ stage: "error", progress: 100, error: message }),

  reset: () =>
    set({ stage: "idle", progress: 0, error: null, resultId: null, retries: 0 }),

  generate: async (input) => {
    const { setStage, succeed, fail } = get();
    set({ stage: "preparing", progress: STAGE_PROGRESS.preparing, error: null, resultId: null });

    // simulated progressive UX while server thinks
    const ticker = setInterval(() => {
      const cur = get().stage;
      if (cur === "preparing") setStage("drafting");
      else if (cur === "drafting") setStage("structuring");
      else if (cur === "structuring") setStage("polishing");
    }, 1500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      clearInterval(ticker);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        const msg = body.message ?? "Gagal membuat modul.";
        fail(msg);
        return { ok: false, message: msg };
      }

      setStage("saving");
      const body = (await res.json()) as { id: string };
      succeed(body.id);
      return { ok: true, id: body.id };
    } catch {
      clearInterval(ticker);
      const msg = "Tidak dapat menghubungi server.";
      fail(msg);
      return { ok: false, message: msg };
    }
  },
}));

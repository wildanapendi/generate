"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sigma } from "lucide-react";
import { cn } from "@/lib/utils";

interface SymbolEntry {
  latex: string;
  display: string;
  label?: string;
}

const CATEGORIES: Array<{ key: string; label: string; symbols: SymbolEntry[] }> = [
  {
    key: "arith",
    label: "Aritmatika",
    symbols: [
      { latex: "+", display: "+" },
      { latex: "-", display: "−" },
      { latex: "\\times", display: "×" },
      { latex: "\\div", display: "÷" },
      { latex: "\\pm", display: "±" },
      { latex: "\\cdot", display: "·" },
      { latex: "\\frac{a}{b}", display: "ᵃ⁄ᵦ" },
      { latex: "\\sqrt{x}", display: "√x" },
      { latex: "x^{2}", display: "x²" },
      { latex: "x_{n}", display: "xₙ" },
    ],
  },
  {
    key: "rel",
    label: "Relasi",
    symbols: [
      { latex: "=", display: "=" },
      { latex: "\\neq", display: "≠" },
      { latex: "<", display: "<" },
      { latex: ">", display: ">" },
      { latex: "\\leq", display: "≤" },
      { latex: "\\geq", display: "≥" },
      { latex: "\\approx", display: "≈" },
      { latex: "\\equiv", display: "≡" },
      { latex: "\\propto", display: "∝" },
    ],
  },
  {
    key: "greek",
    label: "Yunani",
    symbols: [
      { latex: "\\alpha", display: "α" },
      { latex: "\\beta", display: "β" },
      { latex: "\\gamma", display: "γ" },
      { latex: "\\delta", display: "δ" },
      { latex: "\\epsilon", display: "ε" },
      { latex: "\\theta", display: "θ" },
      { latex: "\\lambda", display: "λ" },
      { latex: "\\mu", display: "μ" },
      { latex: "\\pi", display: "π" },
      { latex: "\\sigma", display: "σ" },
      { latex: "\\phi", display: "φ" },
      { latex: "\\omega", display: "ω" },
    ],
  },
  {
    key: "calc",
    label: "Kalkulus",
    symbols: [
      { latex: "\\sum_{i=1}^{n}", display: "Σ" },
      { latex: "\\prod_{i=1}^{n}", display: "∏" },
      { latex: "\\int_{a}^{b}", display: "∫" },
      { latex: "\\lim_{x \\to 0}", display: "lim" },
      { latex: "\\partial", display: "∂" },
      { latex: "\\nabla", display: "∇" },
      { latex: "\\infty", display: "∞" },
      { latex: "\\frac{dy}{dx}", display: "ᵈʸ⁄ᵈₓ" },
    ],
  },
  {
    key: "matrix",
    label: "Matriks",
    symbols: [
      { latex: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}", display: "M" },
      { latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", display: "(M)" },
      { latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}", display: "[M]" },
      { latex: "\\det", display: "det" },
    ],
  },
  {
    key: "set",
    label: "Himpunan",
    symbols: [
      { latex: "\\in", display: "∈" },
      { latex: "\\notin", display: "∉" },
      { latex: "\\subset", display: "⊂" },
      { latex: "\\supset", display: "⊃" },
      { latex: "\\cup", display: "∪" },
      { latex: "\\cap", display: "∩" },
      { latex: "\\emptyset", display: "∅" },
      { latex: "\\forall", display: "∀" },
      { latex: "\\exists", display: "∃" },
    ],
  },
];

interface PickerProps {
  onPick: (latex: string) => void;
  trigger?: React.ReactNode;
}

export function LatexSymbolPicker({ onPick, trigger }: PickerProps) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const active = CATEGORIES.find((c) => c.key === activeKey) ?? CATEGORIES[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <Sigma className="size-4" />
            Simbol
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pustaka Simbol LaTeX</DialogTitle>
          <DialogDescription>
            Pilih kategori, lalu klik simbol untuk menyisipkan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[160px_1fr] gap-3">
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveKey(cat.key)}
                className={cn(
                  "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                  cat.key === activeKey
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          <div className="grid grid-cols-4 gap-2">
            {active.symbols.map((sym) => (
              <button
                key={sym.latex}
                type="button"
                onClick={() => {
                  onPick(sym.latex);
                  setOpen(false);
                }}
                className="grid h-12 place-items-center rounded-md border bg-background text-base hover:border-ring hover:bg-muted"
                title={sym.latex}
              >
                {sym.display}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

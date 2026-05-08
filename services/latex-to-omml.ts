/**
 * LaTeX-to-OMML (Office Math Markup Language) converter utility.
 * Used for DOCX export so formulas are editable in Microsoft Word.
 *
 * This is a simplified converter that handles common LaTeX math commands.
 * For complex formulas, falls back to plain text representation.
 */

/** Convert a LaTeX math string to OMML XML string for use inside docx. */
export function latexToOmml(latex: string): string {
  try {
    // Clean whitespace
    const cleaned = latex.trim();
    if (!cleaned) return "";

    // Build OMML structure
    const inner = convertTokens(cleaned);
    return wrapInOmml(inner);
  } catch {
    // Fallback: return plain text wrapped in OMML
    return wrapInOmml(`<m:r><m:t>${escapeXml(latex)}</m:t></m:r>`);
  }
}

/**
 * Detect if a string contains LaTeX math delimiters.
 */
export function containsLatex(text: string): boolean {
  return /\$\$[\s\S]+?\$\$|\$[^$]+?\$/.test(text);
}

/**
 * Extract all LaTeX formulas from text.
 * Returns array of { formula, isBlock } objects.
 */
export function extractLatexFormulas(
  text: string,
): { formula: string; isBlock: boolean; raw: string }[] {
  const results: { formula: string; isBlock: boolean; raw: string }[] = [];

  // Block math: $$...$$
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(text)) !== null) {
    results.push({ formula: match[1], isBlock: true, raw: match[0] });
  }

  // Inline math: $...$  (avoid matching already-captured block math)
  const cleaned = text.replace(/\$\$[\s\S]+?\$\$/g, "");
  const inlineRegex = /\$([^$]+?)\$/g;
  while ((match = inlineRegex.exec(cleaned)) !== null) {
    results.push({ formula: match[1], isBlock: false, raw: match[0] });
  }

  return results;
}

// ── Internal token converter ──────────────────────────────────────────

/** Map common LaTeX commands to OMML equivalents */
const SYMBOL_MAP: Record<string, string> = {
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ",
  "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ",
  "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\rho": "ρ",
  "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ",
  "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ",
  "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Phi": "Φ",
  "\\Psi": "Ψ", "\\Omega": "Ω",
  "\\infty": "∞", "\\partial": "∂", "\\nabla": "∇",
  "\\pm": "±", "\\mp": "∓", "\\times": "×", "\\div": "÷",
  "\\cdot": "·", "\\leq": "≤", "\\geq": "≥", "\\neq": "≠",
  "\\approx": "≈", "\\equiv": "≡", "\\in": "∈", "\\notin": "∉",
  "\\subset": "⊂", "\\supset": "⊃", "\\cup": "∪", "\\cap": "∩",
  "\\forall": "∀", "\\exists": "∃", "\\rightarrow": "→",
  "\\leftarrow": "←", "\\Rightarrow": "⇒", "\\Leftarrow": "⇐",
  "\\ldots": "…", "\\cdots": "⋯",
};

function convertTokens(latex: string): string {
  let result = latex;

  // Replace \\frac{a}{b} with OMML fraction
  result = result.replace(
    /\\frac\{([^}]*)\}\{([^}]*)\}/g,
    (_, num, den) =>
      `<m:f><m:num><m:r><m:t>${escapeXml(num)}</m:t></m:r></m:num><m:den><m:r><m:t>${escapeXml(den)}</m:t></m:r></m:den></m:f>`,
  );

  // Replace \\sqrt{x} and \\sqrt[n]{x}
  result = result.replace(
    /\\sqrt\[([^\]]*)\]\{([^}]*)\}/g,
    (_, n, body) =>
      `<m:rad><m:deg><m:r><m:t>${escapeXml(n)}</m:t></m:r></m:deg><m:e><m:r><m:t>${escapeXml(body)}</m:t></m:r></m:e></m:rad>`,
  );
  result = result.replace(
    /\\sqrt\{([^}]*)\}/g,
    (_, body) =>
      `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e><m:r><m:t>${escapeXml(body)}</m:t></m:r></m:e></m:rad>`,
  );

  // Replace \\sum_{a}^{b}, \\int_{a}^{b}, \\prod_{a}^{b}
  const bigOps: Record<string, string> = {
    "\\sum": "∑", "\\prod": "∏", "\\int": "∫",
    "\\lim": "lim",
  };
  for (const [cmd, sym] of Object.entries(bigOps)) {
    const regex = new RegExp(
      cmd.replace(/\\/g, "\\\\") + "_\\{([^}]*)\\}\\^\\{([^}]*)\\}",
      "g",
    );
    result = result.replace(
      regex,
      (_, sub, sup) =>
        `<m:nary><m:naryPr><m:chr m:val="${sym}"/></m:naryPr><m:sub><m:r><m:t>${escapeXml(sub)}</m:t></m:r></m:sub><m:sup><m:r><m:t>${escapeXml(sup)}</m:t></m:r></m:sup><m:e><m:r><m:t> </m:t></m:r></m:e></m:nary>`,
    );
  }

  // Replace subscript x_{sub}
  result = result.replace(
    /([a-zA-Z0-9])_\{([^}]*)\}/g,
    (_, base, sub) =>
      `<m:sSub><m:e><m:r><m:t>${escapeXml(base)}</m:t></m:r></m:e><m:sub><m:r><m:t>${escapeXml(sub)}</m:t></m:r></m:sub></m:sSub>`,
  );

  // Replace superscript x^{sup}
  result = result.replace(
    /([a-zA-Z0-9])?\^?\{([^}]*)\}/g,
    (_, base, sup) => {
      if (!base) return `<m:r><m:t>${escapeXml(sup)}</m:t></m:r>`;
      return `<m:sSup><m:e><m:r><m:t>${escapeXml(base)}</m:t></m:r></m:e><m:sup><m:r><m:t>${escapeXml(sup)}</m:t></m:r></m:sup></m:sSup>`;
    },
  );

  // Replace known symbols
  for (const [cmd, sym] of Object.entries(SYMBOL_MAP)) {
    result = result.replaceAll(cmd, sym);
  }

  // Remove remaining backslash commands (\\bar, \\hat, etc.) gracefully
  result = result.replace(/\\[a-zA-Z]+/g, "");

  // Wrap remaining plain text tokens
  if (!result.includes("<m:")) {
    result = `<m:r><m:t>${escapeXml(result)}</m:t></m:r>`;
  }

  return result;
}

function wrapInOmml(inner: string): string {
  return `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${inner}</m:oMath>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

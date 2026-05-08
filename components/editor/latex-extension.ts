import { Mathematics } from "@tiptap/extension-mathematics";

/**
 * KaTeX-powered math extension for TipTap.
 * Supports inline `$...$` and block `$$...$$` syntax.
 *
 * Errors render with a red highlight thanks to `throwOnError: false` +
 * KaTeX's `errorColor` option.
 */
export const LatexExtension = Mathematics.configure({
  katexOptions: {
    throwOnError: false,
    errorColor: "#ef4444",
    strict: "ignore",
  },
});

/**
 * Formatter dispatcher
 */

import { CompareResult } from "../types";
import { formatVisualDiff, VisualDiffOptions } from "./visual-formatter";
import { formatStructuredDiff, StructuredFormatOptions } from "./structured-formatter";

export interface FormatOptions {
  /** Show everything without truncation */
  verbose?: boolean;
}

/**
 * Format a CompareResult for display
 * Always shows structured diff + visual diff
 */
export function formatResult(
  result: CompareResult,
  expected: unknown,
  actual: unknown,
  options: FormatOptions = {}
): string {
  const { verbose = false } = options;

  if (result.success) {
    return "Values are equal";
  }

  const parts: string[] = [];

  // Structured diff (path by path)
  parts.push(formatStructuredDiff(result, {
    includeValues: true,
    maxMismatches: verbose ? 100 : 10,
  }));

  // Visual diff (always shown now)
  parts.push("");
  parts.push("Visual diff:");
  parts.push(formatVisualDiff(expected, actual));

  return parts.join("\n");
}

// Re-export individual formatters
export { formatVisualDiff } from "./visual-formatter";
export { formatStructuredDiff } from "./structured-formatter";

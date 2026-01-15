/**
 * Structured diff formatter - path-by-path report
 */

import { CompareResult, MismatchInfo, formatValue } from "../types";

export interface StructuredFormatOptions {
  /** Include actual and expected values in output */
  includeValues?: boolean;
  /** Maximum number of mismatches to show */
  maxMismatches?: number;
  /** Indentation string */
  indent?: string;
}

/**
 * Format a CompareResult as a structured text report
 */
export function formatStructuredDiff(
  result: CompareResult,
  options: StructuredFormatOptions = {}
): string {
  if (result.success) {
    return "Values are equal";
  }

  const {
    includeValues = true,
    maxMismatches = 10,
    indent = "  ",
  } = options;

  const lines: string[] = [];
  const mismatches = result.mismatches.slice(0, maxMismatches);

  lines.push(`Found ${result.mismatches.length} mismatch(es):`);
  lines.push("");

  for (let i = 0; i < mismatches.length; i++) {
    const mismatch = mismatches[i];
    lines.push(formatMismatch(mismatch, includeValues, indent, i + 1));
  }

  if (result.mismatches.length > maxMismatches) {
    lines.push(
      `... and ${result.mismatches.length - maxMismatches} more mismatch(es)`
    );
  }

  return lines.join("\n");
}

/**
 * Format a single mismatch
 */
function formatMismatch(
  mismatch: MismatchInfo,
  includeValues: boolean,
  indent: string,
  index: number
): string {
  const lines: string[] = [];

  // Header with path and kind
  const kindLabel = formatKind(mismatch.kind);
  lines.push(`${index}. [${kindLabel}] at ${mismatch.pathString}`);

  // Message
  lines.push(`${indent}${mismatch.message}`);

  // Values if requested
  if (includeValues) {
    lines.push(`${indent}Expected: ${formatValue(mismatch.expected)}`);
    lines.push(`${indent}Actual:   ${formatValue(mismatch.actual)}`);
  }

  lines.push("");

  return lines.join("\n");
}

/**
 * Format mismatch kind as a human-readable label
 */
function formatKind(kind: MismatchInfo["kind"]): string {
  switch (kind) {
    case "type_mismatch":
      return "Type Mismatch";
    case "value_mismatch":
      return "Value Mismatch";
    case "missing_property":
      return "Missing Property";
    case "extra_property":
      return "Extra Property";
    case "array_length":
      return "Array Length";
    case "matcher_failed":
      return "Matcher Failed";
    case "circular_reference":
      return "Circular Reference";
    case "max_depth_exceeded":
      return "Max Depth";
    case "map_key_missing":
      return "Map Key Missing";
    case "set_value_missing":
      return "Set Value Missing";
    default:
      return "Mismatch";
  }
}

/**
 * Format a summary line for quick overview
 */
export function formatSummary(result: CompareResult): string {
  if (result.success) {
    return "Match: Values are equal";
  }

  const count = result.mismatches.length;
  const first = result.mismatches[0];

  if (count === 1) {
    return `No match: ${first.message} at ${first.pathString}`;
  }

  return `No match: ${count} differences found. First: ${first.message} at ${first.pathString}`;
}

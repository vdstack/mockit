/**
 * Visual diff formatter using jest-diff + pretty-format
 */

import { diffStringsUnified } from "jest-diff";
import { format } from "pretty-format";
import { CompareResult } from "../types";
import { mockitMatcherPlugin } from "./matcher-plugin";

export interface VisualDiffOptions {
  /** Label for expected value */
  aAnnotation?: string;
  /** Label for actual value */
  bAnnotation?: string;
  /** Show full object context */
  expand?: boolean;
  /** Number of context lines to show */
  contextLines?: number;
}

/**
 * Generate a visual diff between expected and actual values
 */
export function formatVisualDiff(
  expected: unknown,
  actual: unknown,
  options: VisualDiffOptions = {}
): string {
  const {
    aAnnotation = "Expected",
    bAnnotation = "Received",
    expand = true,
    contextLines = 5,
  } = options;

  // Serialize with pretty-format using our matcher plugin
  const formatOptions = {
    plugins: [mockitMatcherPlugin],
    printBasicPrototype: false,
  };

  const expectedStr = format(expected, formatOptions);
  const actualStr = format(actual, formatOptions);

  // Diff the serialized strings
  const result = diffStringsUnified(expectedStr, actualStr, {
    aAnnotation,
    bAnnotation,
    expand,
    contextLines,
    includeChangeCounts: true,
    aIndicator: "-",
    bIndicator: "+",
  });

  return result;
}

/**
 * Generate visual diff from a CompareResult
 */
export function formatResultVisualDiff(
  result: CompareResult,
  expected: unknown,
  actual: unknown
): string {
  if (result.success) {
    return "Values are equal";
  }

  const diffOutput = formatVisualDiff(expected, actual);

  return `${diffOutput}`;
}

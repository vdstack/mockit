/**
 * Array comparator
 */

import { CompareContext, CompareResult } from "../types";
import {
  createSuccessResult,
  createFailureResult,
  mergeResults,
} from "../result";
import { pushPath } from "../context";

// Forward declaration - will be set by index.ts to avoid circular imports
let compareValuesDelegate: (
  actual: unknown,
  expected: unknown,
  context: CompareContext
) => CompareResult;

export function setCompareValuesDelegate(
  fn: (
    actual: unknown,
    expected: unknown,
    context: CompareContext
  ) => CompareResult
): void {
  compareValuesDelegate = fn;
}

/**
 * Compare two arrays
 */
export function compareArrays(
  actual: unknown[],
  expected: unknown[],
  context: CompareContext
): CompareResult {
  // Length check for exact matching (not containing)
  if (actual.length !== expected.length) {
    return createFailureResult(context, {
      kind: "array_length",
      message: `Expected array of length ${expected.length}, got length ${actual.length}`,
      actual: actual.length,
      expected: expected.length,
    });
  }

  // Compare element by element
  const results: CompareResult[] = [];

  for (let i = 0; i < expected.length; i++) {
    const itemContext = pushPath(context, { type: "index", index: i });
    const result = compareValuesDelegate(actual[i], expected[i], itemContext);

    if (!result.success) {
      if (!context.options.collectAllMismatches) {
        return result;
      }
      results.push(result);
    }
  }

  if (results.length > 0) {
    return mergeResults(results);
  }

  return createSuccessResult();
}

/**
 * Check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

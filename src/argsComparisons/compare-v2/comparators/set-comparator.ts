/**
 * Set comparator
 */

import { CompareContext, CompareResult, formatValue } from "../types";
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
 * Compare two Sets
 */
export function compareSets(
  actual: Set<unknown>,
  expected: Set<unknown>,
  context: CompareContext
): CompareResult {
  // Size check for exact matching
  if (actual.size !== expected.size) {
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected Set of size ${expected.size}, got size ${actual.size}`,
      actual: actual.size,
      expected: expected.size,
    });
  }

  const results: CompareResult[] = [];
  const actualArray = Array.from(actual.values());

  // For each expected value, find a matching actual value
  for (const expectedValue of expected.values()) {
    const valueContext = pushPath(context, {
      type: "setValue",
      value: expectedValue,
    });

    // Try to find a match in actual
    const found = actualArray.some((actualValue) => {
      const result = compareValuesDelegate(
        actualValue,
        expectedValue,
        valueContext
      );
      return result.success;
    });

    if (!found) {
      const result = createFailureResult(valueContext, {
        kind: "set_value_missing",
        message: `Set is missing value ${formatValue(expectedValue)}`,
        actual: undefined,
        expected: expectedValue,
      });

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
 * Check if a value is a Set
 */
export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set;
}

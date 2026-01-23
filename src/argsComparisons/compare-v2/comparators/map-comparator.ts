/**
 * Map comparator
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
 * Compare two Maps
 */
export function compareMaps(
  actual: Map<unknown, unknown>,
  expected: Map<unknown, unknown>,
  context: CompareContext
): CompareResult {
  // Size check for exact matching
  if (actual.size !== expected.size) {
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected Map of size ${expected.size}, got size ${actual.size}`,
      actual: actual.size,
      expected: expected.size,
    });
  }

  const results: CompareResult[] = [];

  // Check all expected entries exist in actual with matching values
  for (const [key, expectedValue] of expected.entries()) {
    const keyContext = pushPath(context, { type: "mapKey", key });

    if (!actual.has(key)) {
      const result = createFailureResult(keyContext, {
        kind: "map_key_missing",
        message: `Map is missing key ${formatValue(key)}`,
        actual: undefined,
        expected: expectedValue,
      });

      if (!context.options.collectAllMismatches) {
        return result;
      }
      results.push(result);
      continue;
    }

    const actualValue = actual.get(key);
    const result = compareValuesDelegate(actualValue, expectedValue, keyContext);

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
 * Check if a value is a Map
 */
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map;
}

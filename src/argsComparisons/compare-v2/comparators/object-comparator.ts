/**
 * Object comparator with undefined handling
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
 * Compare two plain objects
 */
export function compareObjects(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  context: CompareContext
): CompareResult {
  const { treatUndefinedAsAbsent } = context.options;

  // Get keys from both objects
  const actualKeys = new Set(Object.keys(actual));
  const expectedKeys = new Set(Object.keys(expected));

  // Filter out undefined keys if treatUndefinedAsAbsent is true
  const effectiveActualKeys = treatUndefinedAsAbsent
    ? filterUndefinedKeys(actual, actualKeys)
    : actualKeys;

  const effectiveExpectedKeys = treatUndefinedAsAbsent
    ? filterUndefinedKeys(expected, expectedKeys)
    : expectedKeys;

  const results: CompareResult[] = [];

  // Check all expected keys exist in actual with matching values
  for (const key of effectiveExpectedKeys) {
    const keyContext = pushPath(context, { type: "property", key });

    // Check if key exists in actual (considering undefined handling)
    const actualHasKey = treatUndefinedAsAbsent
      ? effectiveActualKeys.has(key)
      : actualKeys.has(key);

    if (!actualHasKey) {
      const result = createFailureResult(keyContext, {
        kind: "missing_property",
        message: `Missing property "${key}"`,
        actual: undefined,
        expected: expected[key],
      });

      if (!context.options.collectAllMismatches) {
        return result;
      }
      results.push(result);
      continue;
    }

    // Compare values
    const result = compareValuesDelegate(actual[key], expected[key], keyContext);

    if (!result.success) {
      if (!context.options.collectAllMismatches) {
        return result;
      }
      results.push(result);
    }
  }

  // Check for extra keys in actual
  // For strict comparison (not using objectContaining), actual should not have extra keys
  for (const key of effectiveActualKeys) {
    if (!effectiveExpectedKeys.has(key)) {
      const keyContext = pushPath(context, { type: "property", key });
      const result = createFailureResult(keyContext, {
        kind: "extra_property",
        message: `Unexpected property "${key}"`,
        actual: actual[key],
        expected: undefined,
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
 * Filter out keys that have undefined values
 */
function filterUndefinedKeys(
  obj: Record<string, unknown>,
  keys: Set<string>
): Set<string> {
  const result = new Set<string>();
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result.add(key);
    }
  }
  return result;
}

/**
 * Check if a value is a plain object (not array, Map, Set, etc.)
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  if (value instanceof Map || value instanceof Set) {
    return false;
  }
  if (value instanceof Date || value instanceof RegExp) {
    return false;
  }
  // Check for plain object prototype
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

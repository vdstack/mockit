/**
 * Handler for deep containing matchers
 * objectContainingDeep, arrayContainingDeep, mapContainingDeep, setContainingDeep
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";
import { pushPath } from "../context";
import { containingDeep } from "../../../behaviours/containing.deep";

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
 * Handle containingDeep matcher comparison
 */
export function handleContainingDeepMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const original = matcherInfo.payload.original;

  // For primitives, compare directly
  if (typeof original !== "object" || original === null) {
    return compareValuesDelegate(actual, original, context);
  }

  // For arrays, each expected item must match some actual item (deep partial)
  if (Array.isArray(original)) {
    if (!Array.isArray(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected array for arrayContainingDeep(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    for (const expectedItem of original) {
      // Wrap in containingDeep for recursive deep partial matching
      const deepExpected = wrapInContainingDeep(expectedItem);
      const found = actual.some((actualItem) => {
        const result = compareValuesDelegate(actualItem, deepExpected, context);
        return result.success;
      });

      if (!found) {
        return createFailureResult(context, {
          kind: "matcher_failed",
          message: `Array does not contain expected item (deep): ${formatValue(expectedItem)}`,
          actual,
          expected: matcherInfo.payload,
        });
      }
    }

    return createSuccessResult();
  }

  // For Maps
  if (original instanceof Map) {
    if (!(actual instanceof Map)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Map for mapContainingDeep(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    for (const [key, expectedValue] of original.entries()) {
      const keyContext = pushPath(context, { type: "mapKey", key });

      if (!actual.has(key)) {
        return createFailureResult(keyContext, {
          kind: "map_key_missing",
          message: `Map is missing key ${formatValue(key)}`,
          actual: undefined,
          expected: expectedValue,
        });
      }

      const actualValue = actual.get(key);
      const deepExpected = wrapInContainingDeep(expectedValue);
      const result = compareValuesDelegate(actualValue, deepExpected, keyContext);

      if (!result.success) {
        return result;
      }
    }

    return createSuccessResult();
  }

  // For Sets
  if (original instanceof Set) {
    if (!(actual instanceof Set)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Set for setContainingDeep(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    const actualArray = Array.from(actual.values());

    for (const expectedValue of original.values()) {
      const deepExpected = wrapInContainingDeep(expectedValue);
      const found = actualArray.some((actualValue) => {
        const result = compareValuesDelegate(actualValue, deepExpected, context);
        return result.success;
      });

      if (!found) {
        return createFailureResult(context, {
          kind: "set_value_missing",
          message: `Set does not contain expected value (deep): ${formatValue(expectedValue)}`,
          actual,
          expected: matcherInfo.payload,
        });
      }
    }

    return createSuccessResult();
  }

  // For objects
  if (typeof actual !== "object" || actual === null) {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected object for objectContainingDeep(), got ${typeof actual}`,
      actual,
      expected: matcherInfo.payload,
    });
  }

  const actualObj = actual as Record<string, unknown>;
  const expectedObj = original as Record<string, unknown>;

  for (const key of Object.keys(expectedObj)) {
    const keyContext = pushPath(context, { type: "property", key });
    const expectedValue = expectedObj[key];
    const actualValue = actualObj[key];

    // Wrap nested objects in containingDeep
    const deepExpected = wrapInContainingDeep(expectedValue);
    const result = compareValuesDelegate(actualValue, deepExpected, keyContext);

    if (!result.success) {
      return result;
    }
  }

  return createSuccessResult();
}

/**
 * Wrap a value in containingDeep if it's an object (and not already a matcher)
 */
function wrapInContainingDeep(value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  // Check if already a matcher
  if (isMatcher(value)) {
    return value;
  }

  // Wrap in containingDeep
  return containingDeep(value);
}

/**
 * Check if a value is already a matcher
 */
function isMatcher(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const keys = Object.keys(value);
  return keys.some((k) => k.startsWith("mockit__"));
}

/**
 * Format the containing deep matcher for display
 */
export function formatContainingDeepMatcher(matcherInfo: MatcherInfo): string {
  const original = matcherInfo.payload.original;
  if (Array.isArray(original)) return `arrayContainingDeep([...])`;
  if (original instanceof Map) return `mapContainingDeep(Map)`;
  if (original instanceof Set) return `setContainingDeep(Set)`;
  return `objectContainingDeep({...})`;
}

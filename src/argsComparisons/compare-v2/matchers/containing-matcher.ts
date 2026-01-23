/**
 * Handler for shallow containing matchers
 * objectContaining, arrayContaining, mapContaining, setContaining, stringContaining
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";
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
 * Handle containing matcher comparison
 */
export function handleContainingMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const original = matcherInfo.payload.original;

  // String containing
  if (typeof original === "string") {
    if (typeof actual !== "string") {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected string for stringContaining(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    if (actual.includes(original)) {
      return createSuccessResult();
    }

    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Expected string containing "${original}", got "${actual}"`,
      actual,
      expected: matcherInfo.payload,
    });
  }

  // Array containing
  if (Array.isArray(original)) {
    if (!Array.isArray(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected array for arrayContaining(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    for (let i = 0; i < original.length; i++) {
      const expectedItem = original[i];
      const found = actual.some((actualItem) => {
        const result = compareValuesDelegate(actualItem, expectedItem, context);
        return result.success;
      });

      if (!found) {
        return createFailureResult(context, {
          kind: "matcher_failed",
          message: `Array does not contain expected item ${formatValue(expectedItem)}`,
          actual,
          expected: matcherInfo.payload,
        });
      }
    }

    return createSuccessResult();
  }

  // Map containing
  if (original instanceof Map) {
    if (!(actual instanceof Map)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Map for mapContaining(), got ${typeof actual}`,
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
      const result = compareValuesDelegate(actualValue, expectedValue, keyContext);

      if (!result.success) {
        return result;
      }
    }

    return createSuccessResult();
  }

  // Set containing
  if (original instanceof Set) {
    if (!(actual instanceof Set)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Set for setContaining(), got ${typeof actual}`,
        actual,
        expected: matcherInfo.payload,
      });
    }

    const actualArray = Array.from(actual.values());

    for (const expectedValue of original.values()) {
      const found = actualArray.some((actualValue) => {
        const result = compareValuesDelegate(actualValue, expectedValue, context);
        return result.success;
      });

      if (!found) {
        return createFailureResult(context, {
          kind: "set_value_missing",
          message: `Set does not contain expected value ${formatValue(expectedValue)}`,
          actual,
          expected: matcherInfo.payload,
        });
      }
    }

    return createSuccessResult();
  }

  // Object containing (partial match)
  if (typeof original === "object" && original !== null) {
    if (typeof actual !== "object" || actual === null) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected object for objectContaining(), got ${typeof actual}`,
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

      const result = compareValuesDelegate(actualValue, expectedValue, keyContext);

      if (!result.success) {
        return result;
      }
    }

    return createSuccessResult();
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: "Invalid containing matcher",
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Format the containing matcher for display
 */
export function formatContainingMatcher(matcherInfo: MatcherInfo): string {
  const original = matcherInfo.payload.original;
  if (typeof original === "string") return `stringContaining("${original}")`;
  if (Array.isArray(original)) return `arrayContaining([...])`;
  if (original instanceof Map) return `mapContaining(Map)`;
  if (original instanceof Set) return `setContaining(Set)`;
  return `objectContaining({...})`;
}

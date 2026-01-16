/**
 * Handler for instanceOf matcher
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";

/**
 * Handle instanceOf matcher
 */
export function handleInstanceOfMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const expectedClass = matcherInfo.payload.class as new (
    ...args: unknown[]
  ) => unknown;

  if (actual instanceof expectedClass) {
    return createSuccessResult();
  }

  const className = expectedClass.name || "Class";
  const actualType = getActualTypeName(actual);

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Expected instance of ${className}, got ${actualType}`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Get a descriptive type name for the actual value
 */
function getActualTypeName(actual: unknown): string {
  if (actual === null) return "null";
  if (actual === undefined) return "undefined";
  if (typeof actual !== "object") return typeof actual;

  // Try to get constructor name
  const constructor = (actual as object).constructor;
  if (constructor && constructor.name) {
    return constructor.name;
  }

  return "object";
}

/**
 * Format the instanceOf matcher for display
 */
export function formatInstanceOfMatcher(matcherInfo: MatcherInfo): string {
  const expectedClass = matcherInfo.payload.class as { name?: string };
  return `instanceOf(${expectedClass?.name || "Class"})`;
}

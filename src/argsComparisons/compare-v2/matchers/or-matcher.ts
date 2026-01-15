/**
 * Handler for or() and isOneOf() matchers
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";

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
 * Handle or() matcher - matches if ANY option matches
 */
export function handleOrMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const options = matcherInfo.payload.options as unknown[];

  for (const option of options) {
    const result = compareValuesDelegate(actual, option, context);
    if (result.success) {
      return createSuccessResult();
    }
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Value ${formatValue(actual)} did not match any of the ${options.length} options in or()`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Handle isOneOf() matcher - matches if value is in the array of options
 */
export function handleIsOneOfMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const options = matcherInfo.payload.options as unknown[];

  for (const option of options) {
    const result = compareValuesDelegate(actual, option, context);
    if (result.success) {
      return createSuccessResult();
    }
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Value ${formatValue(actual)} is not one of the expected options: ${options.map(formatValue).join(", ")}`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Format the or/isOneOf matcher for display
 */
export function formatOrMatcher(matcherInfo: MatcherInfo): string {
  const options = matcherInfo.payload.options as unknown[];
  if (matcherInfo.type === "isOneOf") {
    return `isOneOf([${options.map(formatValue).join(", ")}])`;
  }
  return `or(${options.length} options)`;
}

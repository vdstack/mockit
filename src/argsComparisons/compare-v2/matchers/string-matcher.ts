/**
 * Handler for string pattern matchers
 * stringStartingWith, stringEndingWith, stringMatching
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";

/**
 * Handle stringStartingWith matcher
 */
export function handleStartsWithMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const prefix = matcherInfo.payload.original as string;

  if (typeof actual !== "string") {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected string for stringStartingWith(), got ${typeof actual}`,
      actual,
      expected: matcherInfo.payload,
    });
  }

  if (actual.startsWith(prefix)) {
    return createSuccessResult();
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Expected string starting with "${prefix}", got "${actual}"`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Handle stringEndingWith matcher
 */
export function handleEndsWithMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const suffix = matcherInfo.payload.original as string;

  if (typeof actual !== "string") {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected string for stringEndingWith(), got ${typeof actual}`,
      actual,
      expected: matcherInfo.payload,
    });
  }

  if (actual.endsWith(suffix)) {
    return createSuccessResult();
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Expected string ending with "${suffix}", got "${actual}"`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Handle stringMatching (regex) matcher
 */
export function handleMatchesRegexMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const regexp = matcherInfo.payload.regexp as RegExp;

  if (typeof actual !== "string") {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected string for stringMatching(), got ${typeof actual}`,
      actual,
      expected: matcherInfo.payload,
    });
  }

  if (regexp.test(actual)) {
    return createSuccessResult();
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Expected string matching ${regexp}, got "${actual}"`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Format the string matcher for display
 */
export function formatStringMatcher(matcherInfo: MatcherInfo): string {
  switch (matcherInfo.type) {
    case "startsWith":
      return `stringStartingWith("${matcherInfo.payload.original}")`;
    case "endsWith":
      return `stringEndingWith("${matcherInfo.payload.original}")`;
    case "matchesRegex":
      return `stringMatching(${matcherInfo.payload.regexp})`;
    default:
      return "stringMatcher()";
  }
}

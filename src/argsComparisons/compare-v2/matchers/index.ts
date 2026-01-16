/**
 * Matcher detection and dispatch
 */

import { CompareContext, CompareResult, MatcherInfo, MatcherType } from "../types";
import { createFailureResult } from "../result";

import { handleAnyMatcher } from "./any-matcher";
import {
  handleContainingMatcher,
  setCompareValuesDelegate as setContainingDelegate,
} from "./containing-matcher";
import {
  handleContainingDeepMatcher,
  setCompareValuesDelegate as setContainingDeepDelegate,
} from "./containing-deep-matcher";
import { handleSchemaMatcher, handleValidateMatcher } from "./validate-matcher";
import {
  handleOrMatcher,
  handleIsOneOfMatcher,
  setCompareValuesDelegate as setOrDelegate,
} from "./or-matcher";
import {
  handleStartsWithMatcher,
  handleEndsWithMatcher,
  handleMatchesRegexMatcher,
} from "./string-matcher";
import { handleInstanceOfMatcher } from "./instance-of-matcher";

/**
 * Initialize matcher delegates with the compareValues function
 */
export function initializeMatchers(
  compareValues: (
    actual: unknown,
    expected: unknown,
    context: CompareContext
  ) => CompareResult
): void {
  setContainingDelegate(compareValues);
  setContainingDeepDelegate(compareValues);
  setOrDelegate(compareValues);
}

/**
 * Detect if a value is a mockit matcher and extract its info
 */
export function detectMatcher(value: unknown): MatcherInfo | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const keys = Object.keys(value);
  const matcherKey = keys.find((k) => k.startsWith("mockit__"));

  if (!matcherKey) {
    return null;
  }

  // Extract type from key: "mockit__any" -> "any"
  const type = matcherKey.replace("mockit__", "") as MatcherType;

  return {
    type,
    payload: value as Record<string, unknown>,
  };
}

/**
 * Check if an object contains any mockit matcher constructs (recursively)
 */
export function containsMockitConstruct(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // Check if this object is a matcher
  const keys = Object.keys(obj);
  if (keys.some((key) => key.startsWith("mockit__"))) {
    return true;
  }

  // Check arrays
  if (Array.isArray(obj)) {
    return obj.some((item) => containsMockitConstruct(item));
  }

  // Check Maps
  if (obj instanceof Map) {
    return Array.from(obj.values()).some((value) =>
      containsMockitConstruct(value)
    );
  }

  // Check Sets
  if (obj instanceof Set) {
    return Array.from(obj.values()).some((value) =>
      containsMockitConstruct(value)
    );
  }

  // Check object properties
  return keys.some((key) => {
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === "object" && value !== null) {
      return containsMockitConstruct(value);
    }
    return false;
  });
}

/**
 * Dispatch to the appropriate matcher handler
 */
export function dispatchToMatcherHandler(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  switch (matcherInfo.type) {
    case "any":
      return handleAnyMatcher(actual, matcherInfo, context);

    case "isContaining":
      return handleContainingMatcher(actual, matcherInfo, context);

    case "isContainingDeep":
      return handleContainingDeepMatcher(actual, matcherInfo, context);

    case "isSchema":
      return handleSchemaMatcher(actual, matcherInfo, context);

    case "validate":
      return handleValidateMatcher(actual, matcherInfo, context);

    case "or_operator":
      return handleOrMatcher(actual, matcherInfo, context);

    case "isOneOf":
      return handleIsOneOfMatcher(actual, matcherInfo, context);

    case "instanceOf":
      return handleInstanceOfMatcher(actual, matcherInfo, context);

    case "startsWith":
      return handleStartsWithMatcher(actual, matcherInfo, context);

    case "endsWith":
      return handleEndsWithMatcher(actual, matcherInfo, context);

    case "matchesRegex":
      return handleMatchesRegexMatcher(actual, matcherInfo, context);

    default:
      return createFailureResult(context, {
        kind: "matcher_failed",
        message: `Unknown matcher type: ${matcherInfo.type}`,
        actual,
        expected: matcherInfo.payload,
      });
  }
}

/**
 * Handler for anyX() matchers
 * anyNumber, anyString, anyBoolean, anyObject, anyArray, anyFunction,
 * anyNullish, anyMap, anySet, anyFalsy, anyTruthy
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";

/**
 * Handle any* matcher comparison
 */
export function handleAnyMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const what = matcherInfo.payload.what as string;
  let matches: boolean;
  let description: string;

  switch (what) {
    case "number":
      matches = typeof actual === "number" && !isNaN(actual);
      description = "anyNumber()";
      break;

    case "string":
      matches = typeof actual === "string";
      description = "anyString()";
      break;

    case "boolean":
      matches = typeof actual === "boolean";
      description = "anyBoolean()";
      break;

    case "object":
      matches =
        typeof actual === "object" &&
        actual !== null &&
        !Array.isArray(actual) &&
        !(actual instanceof Map) &&
        !(actual instanceof Set);
      description = "anyObject()";
      break;

    case "array":
      matches = Array.isArray(actual);
      description = "anyArray()";
      break;

    case "map":
      matches = actual instanceof Map;
      description = "anyMap()";
      break;

    case "set":
      matches = actual instanceof Set;
      description = "anySet()";
      break;

    case "function":
      matches = typeof actual === "function";
      description = "anyFunction()";
      break;

    case "nullish":
      matches = actual == null;
      description = "anyNullish()";
      break;

    case "undefined":
      matches = actual === undefined;
      description = "anyUndefined()";
      break;

    case "falsy":
      matches = !actual;
      description = "anyFalsy()";
      break;

    case "truthy":
      matches = !!actual;
      description = "anyTruthy()";
      break;

    default:
      matches = false;
      description = `any${what}()`;
  }

  if (matches) {
    return createSuccessResult();
  }

  return createFailureResult(context, {
    kind: "matcher_failed",
    message: `Expected ${description}, got ${formatValue(actual)} (${typeof actual})`,
    actual,
    expected: matcherInfo.payload,
  });
}

/**
 * Format the any matcher for display
 */
export function formatAnyMatcher(matcherInfo: MatcherInfo): string {
  const what = matcherInfo.payload.what as string;
  return `any${capitalize(what)}()`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

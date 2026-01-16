/**
 * Compare function - Entry point for argument comparison
 *
 * This module wraps the new compare-v2 implementation while maintaining
 * backward compatibility with the existing boolean-returning API.
 */

import {
  compare as compareV2,
  CompareResult,
  CompareOptions,
} from "./compare-v2";

/**
 * Compare two values for equality.
 * Supports matchers like anyString(), objectContaining(), etc.
 *
 * @param actual The actual value received
 * @param expected The expected value or matcher
 * @returns true if values match, false otherwise
 */
export function compare(actual: any, expected: any): boolean {
  return compareV2(actual, expected).success;
}

/**
 * Compare two values and get detailed results.
 * Use this when you need information about what didn't match.
 *
 * @param actual The actual value received
 * @param expected The expected value or matcher
 * @param options Optional comparison options
 * @returns CompareResult with success status and mismatch details
 */
export function compareDetailed(
  actual: any,
  expected: any,
  options?: Partial<CompareOptions>
): CompareResult {
  return compareV2(actual, expected, options);
}

// Re-export types for advanced usage
export type { CompareResult, CompareOptions } from "./compare-v2";
export type { MismatchInfo, MismatchKind, Path, PathSegment } from "./compare-v2";
export { formatPath, formatValue, DEFAULT_OPTIONS } from "./compare-v2";

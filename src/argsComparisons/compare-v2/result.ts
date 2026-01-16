/**
 * Result builders for compare-v2
 */

import { getCurrentPathString } from "./context";
import {
  CompareContext,
  CompareResult,
  MismatchInfo,
  MismatchKind,
  formatPath,
  formatValue,
} from "./types";

/**
 * Create a successful comparison result
 */
export function createSuccessResult(): CompareResult {
  return {
    success: true,
    mismatches: [],
  };
}

/**
 * Create a failure result with a single mismatch
 */
export function createFailureResult(
  context: CompareContext,
  info: {
    kind: MismatchKind;
    message: string;
    actual: unknown;
    expected: unknown;
  }
): CompareResult {
  const mismatch: MismatchInfo = {
    path: [...context.path],
    pathString: formatPath(context.path),
    actual: info.actual,
    expected: info.expected,
    kind: info.kind,
    message: info.message,
  };

  return {
    success: false,
    mismatches: [mismatch],
  };
}

/**
 * Merge multiple comparison results into one
 * If any result is a failure, the merged result is a failure
 */
export function mergeResults(results: CompareResult[]): CompareResult {
  const allMismatches: MismatchInfo[] = [];
  let allSuccess = true;

  for (const result of results) {
    if (!result.success) {
      allSuccess = false;
      allMismatches.push(...result.mismatches);
    }
  }

  return {
    success: allSuccess,
    mismatches: allMismatches,
  };
}

/**
 * Add a mismatch to an existing result
 */
export function addMismatch(
  result: CompareResult,
  mismatch: MismatchInfo
): CompareResult {
  return {
    success: false,
    mismatches: [...result.mismatches, mismatch],
  };
}

/**
 * Create a mismatch info object
 */
export function createMismatch(
  context: CompareContext,
  kind: MismatchKind,
  actual: unknown,
  expected: unknown,
  message: string
): MismatchInfo {
  return {
    path: [...context.path],
    pathString: formatPath(context.path),
    actual,
    expected,
    kind,
    message,
  };
}

/**
 * Helper to create common mismatch types
 */
export const Mismatches = {
  typeMismatch(
    context: CompareContext,
    actual: unknown,
    expected: unknown
  ): CompareResult {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected type ${typeof expected}, got ${typeof actual}`,
      actual,
      expected,
    });
  },

  valueMismatch(
    context: CompareContext,
    actual: unknown,
    expected: unknown
  ): CompareResult {
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected ${formatValue(expected)}, got ${formatValue(actual)}`,
      actual,
      expected,
    });
  },

  missingProperty(
    context: CompareContext,
    key: string,
    expected: unknown
  ): CompareResult {
    return createFailureResult(context, {
      kind: "missing_property",
      message: `Missing property "${key}"`,
      actual: undefined,
      expected,
    });
  },

  matcherFailed(
    context: CompareContext,
    actual: unknown,
    expected: unknown,
    matcherDescription: string
  ): CompareResult {
    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Expected ${matcherDescription}, got ${formatValue(actual)}`,
      actual,
      expected,
    });
  },

  circularReference(context: CompareContext): CompareResult {
    return createFailureResult(context, {
      kind: "circular_reference",
      message: "Circular reference detected",
      actual: "[Circular]",
      expected: "[Circular]",
    });
  },

  maxDepthExceeded(context: CompareContext): CompareResult {
    return createFailureResult(context, {
      kind: "max_depth_exceeded",
      message: `Maximum comparison depth (${context.options.maxDepth}) exceeded`,
      actual: "[Too Deep]",
      expected: "[Too Deep]",
    });
  },
};

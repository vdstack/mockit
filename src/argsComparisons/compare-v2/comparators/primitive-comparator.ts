/**
 * Primitive value comparator
 * Handles: null, undefined, number, string, boolean, symbol, bigint, function
 */

import { CompareContext, CompareResult, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";

/**
 * Compare two primitive values
 */
export function comparePrimitives(
  actual: unknown,
  expected: unknown,
  context: CompareContext
): CompareResult {
  // Exact equality for primitives
  if (actual === expected) {
    return createSuccessResult();
  }

  // Special case: NaN comparison (NaN !== NaN in JS)
  if (
    typeof actual === "number" &&
    typeof expected === "number" &&
    isNaN(actual) &&
    isNaN(expected)
  ) {
    return createSuccessResult();
  }

  // Type mismatch
  if (typeof actual !== typeof expected) {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected type "${typeof expected}", got "${typeof actual}"`,
      actual,
      expected,
    });
  }

  // Same type but different value
  return createFailureResult(context, {
    kind: "value_mismatch",
    message: `Expected ${formatValue(expected)}, got ${formatValue(actual)}`,
    actual,
    expected,
  });
}

/**
 * Check if a value is a primitive (not an object or array)
 */
export function isPrimitive(value: unknown): boolean {
  if (value === null) return true;
  const type = typeof value;
  return (
    type === "undefined" ||
    type === "boolean" ||
    type === "number" ||
    type === "string" ||
    type === "symbol" ||
    type === "bigint" ||
    type === "function"
  );
}

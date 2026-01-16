/**
 * Comparator dispatcher
 * Routes comparison to the appropriate comparator based on value types
 */

import { CompareContext, CompareResult } from "../types";
import { createSuccessResult, createFailureResult, Mismatches } from "../result";
import {
  isCircularActual,
  isCircularExpected,
  isMaxDepthExceeded,
  markVisited,
} from "../context";

import { comparePrimitives, isPrimitive } from "./primitive-comparator";
import {
  compareArrays,
  isArray,
  setCompareValuesDelegate as setArrayDelegate,
} from "./array-comparator";
import {
  compareObjects,
  isPlainObject,
  setCompareValuesDelegate as setObjectDelegate,
} from "./object-comparator";
import {
  compareMaps,
  isMap,
  setCompareValuesDelegate as setMapDelegate,
} from "./map-comparator";
import {
  compareSets,
  isSet,
  setCompareValuesDelegate as setSetDelegate,
} from "./set-comparator";

// Set up the delegates to avoid circular imports
// This will be called by the main compare function
export function initializeComparators(
  compareValues: (
    actual: unknown,
    expected: unknown,
    context: CompareContext
  ) => CompareResult
): void {
  setArrayDelegate(compareValues);
  setObjectDelegate(compareValues);
  setMapDelegate(compareValues);
  setSetDelegate(compareValues);
}

/**
 * Dispatch to the appropriate comparator based on value types
 * This handles non-matcher values
 */
export function dispatchToComparator(
  actual: unknown,
  expected: unknown,
  context: CompareContext
): CompareResult {
  // Check for max depth
  if (isMaxDepthExceeded(context)) {
    return Mismatches.maxDepthExceeded(context);
  }

  // Handle null/undefined explicitly
  if (expected === null) {
    if (actual === null) {
      return createSuccessResult();
    }
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected null, got ${typeof actual}`,
      actual,
      expected,
    });
  }

  if (expected === undefined) {
    if (actual === undefined) {
      return createSuccessResult();
    }
    // With treatUndefinedAsAbsent, this case should be handled upstream
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected undefined, got ${typeof actual}`,
      actual,
      expected,
    });
  }

  // Primitives (excluding null/undefined handled above)
  if (isPrimitive(expected)) {
    return comparePrimitives(actual, expected, context);
  }

  // From here, expected is an object type

  // Type mismatch: actual is not an object
  if (typeof actual !== "object" || actual === null) {
    return createFailureResult(context, {
      kind: "type_mismatch",
      message: `Expected ${getTypeName(expected)}, got ${actual === null ? "null" : typeof actual}`,
      actual,
      expected,
    });
  }

  // Check for circular references
  if (
    isCircularActual(context, actual as object) ||
    isCircularExpected(context, expected as object)
  ) {
    // Circular reference found - consider them equal if both are circular
    // at the same depth point
    return createSuccessResult();
  }

  // Mark as visited for circular reference tracking
  const visitedContext = markVisited(
    context,
    actual as object,
    expected as object
  );

  // Arrays
  if (isArray(expected)) {
    if (!isArray(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected array, got ${getTypeName(actual)}`,
        actual,
        expected,
      });
    }
    return compareArrays(actual, expected, visitedContext);
  }

  // Maps
  if (isMap(expected)) {
    if (!isMap(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Map, got ${getTypeName(actual)}`,
        actual,
        expected,
      });
    }
    return compareMaps(actual, expected, visitedContext);
  }

  // Sets
  if (isSet(expected)) {
    if (!isSet(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected Set, got ${getTypeName(actual)}`,
        actual,
        expected,
      });
    }
    return compareSets(actual, expected, visitedContext);
  }

  // Plain objects
  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) {
      return createFailureResult(context, {
        kind: "type_mismatch",
        message: `Expected plain object, got ${getTypeName(actual)}`,
        actual,
        expected,
      });
    }
    return compareObjects(actual, expected, visitedContext);
  }

  // Other object types (Date, RegExp, custom classes, etc.)
  // Fall back to strict equality
  if (actual === expected) {
    return createSuccessResult();
  }

  // Try to handle special cases
  if (expected instanceof Date && actual instanceof Date) {
    if (expected.getTime() === actual.getTime()) {
      return createSuccessResult();
    }
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected Date ${expected.toISOString()}, got ${actual.toISOString()}`,
      actual,
      expected,
    });
  }

  if (expected instanceof RegExp && actual instanceof RegExp) {
    if (expected.toString() === actual.toString()) {
      return createSuccessResult();
    }
    return createFailureResult(context, {
      kind: "value_mismatch",
      message: `Expected RegExp ${expected}, got ${actual}`,
      actual,
      expected,
    });
  }

  // Default: not equal
  return createFailureResult(context, {
    kind: "value_mismatch",
    message: `Values are not equal`,
    actual,
    expected,
  });
}

/**
 * Get a human-readable type name for a value
 */
function getTypeName(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  if (value instanceof Map) return "Map";
  if (value instanceof Set) return "Set";
  if (value instanceof Date) return "Date";
  if (value instanceof RegExp) return "RegExp";
  return typeof value;
}

// Re-export type checks for use in other modules
export { isPrimitive, isArray, isPlainObject, isMap, isSet };

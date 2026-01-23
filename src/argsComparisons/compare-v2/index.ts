/**
 * Compare V2 - Main entry point
 *
 * A rewritten comparison function with:
 * - Circular reference handling
 * - undefined = absent key support
 * - Rich error messages with path tracking
 */

import {
  CompareContext,
  CompareOptions,
  CompareResult,
  DEFAULT_OPTIONS,
} from "./types";
import { createContext, pushPath } from "./context";
import { createSuccessResult } from "./result";
import {
  dispatchToComparator,
  initializeComparators,
  isArray,
  isMap,
  isPlainObject,
  isSet,
} from "./comparators";
import {
  detectMatcher,
  dispatchToMatcherHandler,
  containsMockitConstruct,
  initializeMatchers,
} from "./matchers";

// Initialize the delegates
let initialized = false;

function ensureInitialized(): void {
  if (!initialized) {
    initializeComparators(compareValues);
    initializeMatchers(compareValues);
    initialized = true;
  }
}

/**
 * Compare two values and return a detailed result
 *
 * @param actual The actual value received
 * @param expected The expected value or matcher
 * @param options Optional comparison options
 * @returns CompareResult with success status and mismatch details
 */
export function compare(
  actual: unknown,
  expected: unknown,
  options?: Partial<CompareOptions>
): CompareResult {
  ensureInitialized();
  const context = createContext(options);
  return compareValues(actual, expected, context);
}

/**
 * Compare two values for backward compatibility (returns boolean)
 */
export function compareBoolean(actual: unknown, expected: unknown): boolean {
  return compare(actual, expected).success;
}

/**
 * Internal comparison function that handles all value types
 */
function compareValues(
  actual: unknown,
  expected: unknown,
  context: CompareContext
): CompareResult {
  // Check if expected is a matcher
  const matcherInfo = detectMatcher(expected);
  if (matcherInfo) {
    return dispatchToMatcherHandler(actual, matcherInfo, context);
  }

  // If expected contains matchers nested inside, we need to recurse
  if (
    typeof expected === "object" &&
    expected !== null &&
    containsMockitConstruct(expected)
  ) {
    return compareObjectWithMatchers(actual, expected, context);
  }

  // No matchers - use regular comparison
  return dispatchToComparator(actual, expected, context);
}

/**
 * Compare objects that contain matchers nested inside
 */
function compareObjectWithMatchers(
  actual: unknown,
  expected: object,
  context: CompareContext
): CompareResult {
  // Arrays
  if (isArray(expected)) {
    if (!isArray(actual)) {
      return {
        success: false,
        mismatches: [
          {
            path: context.path,
            pathString: context.path.length === 0 ? "<root>" : formatPathString(context.path),
            actual,
            expected,
            kind: "type_mismatch",
            message: `Expected array, got ${typeof actual}`,
          },
        ],
      };
    }

    // Compare element by element
    for (let i = 0; i < expected.length; i++) {
      const itemContext = pushPath(context, { type: "index", index: i });
      const result = compareValues(
        (actual as unknown[])[i],
        expected[i],
        itemContext
      );

      if (!result.success) {
        if (!context.options.collectAllMismatches) {
          return result;
        }
        // Collect mismatches if needed
        return result;
      }
    }

    return createSuccessResult();
  }

  // Maps
  if (isMap(expected)) {
    if (!isMap(actual)) {
      return {
        success: false,
        mismatches: [
          {
            path: context.path,
            pathString: formatPathString(context.path),
            actual,
            expected,
            kind: "type_mismatch",
            message: `Expected Map, got ${typeof actual}`,
          },
        ],
      };
    }

    for (const [key, expectedValue] of expected.entries()) {
      const keyContext = pushPath(context, { type: "mapKey", key });
      const result = compareValues(
        (actual as Map<unknown, unknown>).get(key),
        expectedValue,
        keyContext
      );

      if (!result.success) {
        return result;
      }
    }

    return createSuccessResult();
  }

  // Sets
  if (isSet(expected)) {
    if (!isSet(actual)) {
      return {
        success: false,
        mismatches: [
          {
            path: context.path,
            pathString: formatPathString(context.path),
            actual,
            expected,
            kind: "type_mismatch",
            message: `Expected Set, got ${typeof actual}`,
          },
        ],
      };
    }

    const actualArray = Array.from((actual as Set<unknown>).values());

    for (const expectedValue of expected.values()) {
      const found = actualArray.some((actualValue) => {
        const result = compareValues(actualValue, expectedValue, context);
        return result.success;
      });

      if (!found) {
        return {
          success: false,
          mismatches: [
            {
              path: context.path,
              pathString: formatPathString(context.path),
              actual,
              expected: expectedValue,
              kind: "set_value_missing",
              message: "Set is missing expected value",
            },
          ],
        };
      }
    }

    return createSuccessResult();
  }

  // Plain objects
  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) {
      return {
        success: false,
        mismatches: [
          {
            path: context.path,
            pathString: formatPathString(context.path),
            actual,
            expected,
            kind: "type_mismatch",
            message: `Expected object, got ${typeof actual}`,
          },
        ],
      };
    }

    for (const key of Object.keys(expected)) {
      const keyContext = pushPath(context, { type: "property", key });
      const result = compareValues(
        (actual as Record<string, unknown>)[key],
        (expected as Record<string, unknown>)[key],
        keyContext
      );

      if (!result.success) {
        return result;
      }
    }

    return createSuccessResult();
  }

  // Fallback
  return dispatchToComparator(actual, expected, context);
}

/**
 * Format path to string
 */
function formatPathString(path: CompareContext["path"]): string {
  if (path.length === 0) return "<root>";

  return path.reduce((acc, segment) => {
    switch (segment.type) {
      case "property":
        return acc ? `${acc}.${segment.key}` : segment.key;
      case "index":
        return `${acc}[${segment.index}]`;
      case "mapKey":
        return `${acc}.get(${JSON.stringify(segment.key)})`;
      case "setValue":
        return `${acc}.has(${JSON.stringify(segment.value)})`;
    }
  }, "");
}

// Re-export types
export type {
  CompareResult,
  CompareOptions,
  CompareContext,
  MismatchInfo,
  MismatchKind,
  Path,
  PathSegment,
} from "./types";

export { DEFAULT_OPTIONS, formatPath, formatValue } from "./types";

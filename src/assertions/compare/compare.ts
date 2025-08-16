import { hasher } from "../../hasher";
import { Schema } from "../../behaviours/matchers";
import { containingDeep } from "../../behaviours/containing.deep";

// TODO: schemas in maps & sets & arrays
export function compare(actual: any, expected: any): boolean {
  if (typeof expected === "object" && expected !== null) {
    // fyi, (typeof null) equals "object". I know. #javascript

    const isOROperator = Object.keys(expected).some((key) =>
      key.endsWith("mockit__or_operator")
    );
    if (isOROperator) {
      return expected.options.some((option: any) => compare(actual, option));
    }

    const isInstanceOf = Object.keys(expected).some((key) =>
      key.endsWith("mockit__instanceOf")
    );

    if (isInstanceOf) {
      return actual instanceof expected.class;
    }

    const isSchema = Object.keys(expected).some((key) =>
      key.endsWith("mockit__isSchema")
    );
    if (isSchema) {
      return (expected.schema as Schema).safeParse(actual).success;
    }

    const isValidate = Object.keys(expected).some((key) =>
      key.endsWith("mockit__validate")
    );
    if (isValidate) {
      return expected.validationFunction(actual);
    }

    const isOneOf = Object.keys(expected).some((key) =>
      key.endsWith("mockit__isOneOf")
    );
    if (isOneOf) {
      return expected.options.some((option: unknown) =>
        compare(actual, option)
      );
    }

    const isStartsWith = Object.keys(expected).some((key) =>
      key.endsWith("mockit__startsWith")
    );
    if (isStartsWith) {
      return actual?.startsWith?.(expected.original);
    }

    const isEndsWith = Object.keys(expected).some((key) =>
      key.endsWith("mockit__endsWith")
    );
    if (isEndsWith) {
      return actual?.endsWith?.(expected.original);
    }

    const isRegexp = Object.keys(expected).some((key) =>
      key.endsWith("mockit__matchesRegex")
    );
    if (isRegexp) {
      return expected.regexp?.test?.(actual);
    }

    const isAnyOf = Object.keys(expected).some((key) =>
      key.endsWith("mockit__any")
    );

    if (isAnyOf) {
      switch (expected.what) {
        case "object":
          if (Array.isArray(actual)) {
            return false;
          }

          if (actual == null) {
            return false;
          }

          if (actual instanceof Map) {
            return false;
          }

          if (actual instanceof Set) {
            return false;
          }

          return typeof actual === "object";

        case "function":
        case "undefined":
        case "string":
        case "boolean":
          return typeof actual === expected.what;
        case "number":
          return typeof actual === "number" && !isNaN(actual);
        case "nullish":
          return actual == null;
        case "array":
          return Array.isArray(actual);
        case "map":
          return actual instanceof Map;
        case "set":
          return actual instanceof Set;
        case "falsy":
          return !actual;
        case "truthy":
          return !!actual;
        default:
          return false;
      }
    }

    const isContaining = Object.keys(expected).some((key) =>
      key.endsWith("mockit__isContaining")
    );
    if (isContaining) {
      // arrayContaining
      if (Array.isArray(expected.original)) {
        return expected.original.every((item: unknown, index: number) => {
          return actual?.some((actualItem: unknown) =>
            compare(actualItem, item)
          );
        });
      }

      // mapContaining
      if (expected.original instanceof Map) {
        return Array.from(
          ((expected?.original as Map<unknown, unknown>) ?? []).entries()
        ).every(([key, value]) => {
          return compare(actual.get(key), value);
        });
      }

      // setContaining
      if (expected.original instanceof Set) {
        return Array.from(
          ((expected?.original as Set<unknown>) ?? []).values()
        ).every((value) => {
          return Array.from(actual?.values?.() ?? []).some((actualValue) =>
            compare(actualValue, value)
          );
        });
      }

      // stringContaining
      if (typeof expected?.original === "string") {
        const isContaining = Object.keys(expected).some((key) =>
          key.endsWith("mockit__isContaining")
        );
        if (isContaining) {
          return actual.includes(expected?.original);
        }
      }

      // objectContaining
      return Object.keys(expected.original).every((key) => {
        return compare(actual[key], expected.original[key]);
      });
    }

    const isContainingDeep = Object.keys(expected).some((key) =>
      key.endsWith("mockit__isContainingDeep")
    );
    if (isContainingDeep) {
      if (typeof actual !== "object") {
        return hasher.hash(actual) === hasher.hash(expected.original);
      }

      if (Array.isArray(expected.original)) {
        return expected.original.every((expectedValue: unknown) => {
          return actual?.some((actualValue: unknown) =>
            compare(actualValue, containingDeep(expectedValue))
          );
        });
      }

      if (expected.original instanceof Map) {
        return Array.from(
          ((expected?.original as Map<any, any>) ?? []).entries()
        ).every(([key, expectedVAlue]) => {
          return compare(actual.get(key), containingDeep(expectedVAlue));
        });
      }

      if (expected.original instanceof Set) {
        return Array.from(
          ((expected?.original as Set<any>) ?? []).values()
        ).every((expectedValue) => {
          return Array.from(actual.values()).some((actualValue) =>
            compare(actualValue, containingDeep(expectedValue))
          );
        });
      }

      if (typeof expected.original !== "object" || expected.original === null) {
        // For simple values that were stuck in the containingDeep regression
        return compare(actual, expected.original);
      }

      return Object.keys(expected.original).every((key) => {
        const expectedValue = expected.original[key];
        // If the value is a direct matcher, don't wrap it again
        if (typeof expectedValue === "object" && expectedValue !== null && 
            Object.keys(expectedValue).some(k => k.startsWith("mockit__")) &&
            !Array.isArray(expectedValue) && 
            !(expectedValue instanceof Map) && 
            !(expectedValue instanceof Set)) {
          return compare(actual[key], expectedValue);
        }
        // If the value is a built-in object (Date, RegExp, etc.), compare directly
        if (expectedValue instanceof Date || expectedValue instanceof RegExp) {
          return compare(actual[key], expectedValue);
        }
        return compare(actual[key], containingDeep(expectedValue));
      });
    }

    /**
     *
     * From this point onwards, we're dealing with expected objects that are not first-class constructs
     * (meaning they are not partials, containings, partialDeeps, etc, but they could contain some of those)
     *  ==> we will check if the object contains a construct, we recursively call compare on the object properties
     * depending on its structure:
     * - if it's an array, we call compare on each item
     * - if it's a map, we call compare on each value
     * - if it's a set, we call compare on each value
     * - if it's an object, we call compare on each property
     **/

    // Not sure the containsSchema check is necessary anymore. Should try removing it
    const dataContainsMockitConstruct = containsMockitConstruct(
      expected,
      "mockit__"
    );

    if (dataContainsMockitConstruct) {
      if (Array.isArray(expected)) {
        return expected.every((item, index) => {
          return compare(actual[index], item);
        });
      }

      if (expected instanceof Map) {
        return Array.from(expected.entries()).every(([key, value]) => {
          return compare(actual.get(key), value);
        });
      }

      if (expected instanceof Set) {
        return Array.from(expected.values()).every((expectedValue) => {
          return Array.from(actual?.values?.() ?? []).some((actualValue) =>
            compare(actualValue, expectedValue)
          );
        });
      }

      return Object.keys(expected).every((key) => {
        return compare(actual?.[key], expected?.[key]);
      });
    }
  }

  /**
   * Now we're pretty much left with normal values in a normal context (no constructs).
   * We can compare them directly:
   * - if the typeof is different, we return false
   * - then, we compare the hashes of the actual and expected values (a bit more expensive that a typeof comparison)
   */

  if (typeof actual !== typeof expected) {
    return false;
  }

  return hasher.hash(actual) === hasher.hash(expected);
}

export function containsMockitConstruct(
  obj: any,
  construct:
    | "mockit__"
    | "mockit__isSchema"
    | "mockit__isPartial"
    | "mockit__isContaining"
    | "mockit__isPartialDeep"
    | "mockit__isContainingDeep"
): boolean {
  if (typeof obj !== "object") {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => containsMockitConstruct(item, construct));
  }

  if (obj instanceof Map) {
    return Array.from(obj.values()).some((value) =>
      containsMockitConstruct(value, construct)
    );
  }

  if (obj instanceof Set) {
    return Array.from(obj.values()).some((value) =>
      containsMockitConstruct(value, construct)
    );
  }

  const keys = Object.keys(obj ?? {});
  if (keys.some((key) => key.startsWith(construct))) {
    return true;
  }

  return keys.some((key) => {
    if (typeof obj[key] === "object") {
      return containsMockitConstruct(obj[key], construct);
    }

    return false;
  });
}

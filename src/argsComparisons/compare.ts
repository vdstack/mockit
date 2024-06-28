import { hasher } from "../hasher";
import { Parser, containingDeep, partialDeep } from "../behaviours/constructs";

// TODO: schemas in maps & sets & arrays
export function compare(actual: any, expected: any) {
    if (typeof expected === "object" && expected !== null) {
        // fyi, (typeof null) equals "object". I know. #javascript
        const isSchema = Object.keys(expected).some(key => key.endsWith("mockit__isSchema"));
        if (isSchema) {
            return (expected.schema as Parser).safeParse(actual).success;
        }

        const isPartial = Object.keys(expected).some(key => key.endsWith("mockit__isPartial"));
        if (isPartial) {
            if (Array.isArray(expected.original)) {
                return actual?.every((item) => {
                    return expected.original?.some(expectedItem => compare(item, expectedItem));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from((actual as Map<any, any> ?? [])?.entries()).every(([key, value]) => {
                    return compare(value, expected.original.get(key));
                });
            }

            if (expected.original instanceof Set) {
                return Array.from((actual as Set<any> ?? [])?.values()).every(value => {
                    return Array.from(expected.original?.values()).some(expectedValue => compare(value, expectedValue));
                });
            }

            return Object.keys(actual).every(key => {
                return compare(actual[key], expected.original[key]);
            });
        }

        const isContaining = Object.keys(expected).some(key => key.endsWith("mockit__isContaining"));
        if (isContaining) {
            if (Array.isArray(expected.original)) {
                console.log("expected.original", expected.original);
                return expected.original.every((item, index) => {
                    return actual?.some(actualItem => compare(actualItem, item));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from(((expected?.original as Map<any, any>) ?? []).entries()).every(([key, value]) => {
                    return compare(actual.get(key), value);
                });
            }

            if (expected.original instanceof Set) {
                return Array.from(((expected?.original as Set<any>) ?? []).values()).every(value => {
                    return Array.from(actual.values()).some(actualValue => compare(actualValue, value));
                });
            }

            return Object.keys(expected.original).every(key => {
                return compare(actual[key], expected.original[key]);
            });
        }

        const isPartialDeep = Object.keys(expected).some(key => key.endsWith("mockit__isPartialDeep"));
        if (isPartialDeep) {
            // Numbers, strings, etc.
            if (typeof actual !== "object") {
                return hasher.hash(actual) === hasher.hash(expected.original);
            }

            if (Array.isArray(expected.original)) {
                return actual.every((item) => {
                    return expected.original?.some(expectedItem => compare(item, partialDeep(expectedItem)));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from(((actual as Map<any, any>) ?? [])?.entries()).every(([key, actualValue]) => {
                    return compare(actualValue, partialDeep(expected.original.get(key)));
                });
            }

            if (expected.original instanceof Set) {
                return Array.from((actual as Set<any> ?? new Set()).values()).every(actualValue => {
                    return Array.from(expected.original.values()).some(expectedValue => compare(actualValue, partialDeep(expectedValue)));
                });
            }

            // C'est reparti pour un tour
            return Object.keys(actual).every(key => {
                return compare(actual[key], partialDeep(expected?.original?.[key]));
            });
        }

        const isContainingDeep = Object.keys(expected).some(key => key.endsWith("mockit__isContainingDeep"));
        if (isContainingDeep) {
            if (typeof actual !== "object") {
                return hasher.hash(actual) === hasher.hash(expected.original);
            }

            if (Array.isArray(expected.original)) {
                return expected.original.every((expectedValue) => {
                    // return compare(actual[index], containingDeep(expectedValue));
                    console.log("expectedValue", expectedValue);
                    console.log("actual", actual);
                    console.log(actual?.some(actualValue => compare(actualValue, containingDeep(expectedValue))));
                    return actual?.some(actualValue => compare(actualValue, containingDeep(expectedValue)));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from(((expected?.original as Map<any, any>) ?? []).entries()).every(([key, expectedVAlue]) => {
                    return compare(actual.get(key), containingDeep(expectedVAlue));
                });
            }

            if (expected.original instanceof Set) {
                return Array.from(((expected?.original as Set<any>) ?? []).values()).every(expectedValue => {
                    return Array.from(actual.values()).some(actualValue => compare(actualValue, containingDeep(expectedValue)));
                });
            }

            if (typeof expected.original !== "object") {
                // For simple values that were stuck in the containingDeep regression
                return compare(actual, expected.original);
            }

            return Object.keys(expected.original).every(key => {
                return compare(actual[key], containingDeep(expected.original[key]));
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
        const dataContainsMockitConstruct = containsMockitConstruct(expected, "mockit__");

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
                return Array.from(expected.values()).every(value => {
                    return Array.from(actual.values()).some(actualValue => compare(actualValue, value));
                });
            }

            return Object.keys(expected).every(key => {
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

function containsMockitConstruct(obj: any, construct: "mockit__" | "mockit__isSchema" | "mockit__isPartial" | "mockit__isContaining" | "mockit__isPartialDeep" | "mockit__isContainingDeep") {
    if (typeof obj !== "object") {
        return false;
    }

    if (Array.isArray(obj)) {
        return obj.some((item) => containsMockitConstruct(item, construct));
    }

    if (obj instanceof Map) {
        return Array.from(obj.values()).some((value) => containsMockitConstruct(value, construct));
    }

    if (obj instanceof Set) {
        return Array.from(obj.values()).some((value) => containsMockitConstruct(value, construct));
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

import { z } from "zod";
import { hasher } from "../hasher";

import { Parser, schema } from "../behaviours/constructs";


it("should compare numbers", () => {
    expect(compare(2, 2)).toBe(true);
    expect(compare(2, 3)).toBe(false);
});

it("should compare strings", () => {
    expect(compare("hello", "hello")).toBe(true);
    expect(compare("hello", "world")).toBe(false);
});

it("should compare Maps with the same values", () => {
    const map1 = new Map();
    map1.set("key", "value");

    const map2 = new Map();
    map2.set("key", "value");

    expect(compare(map1, map2)).toBe(true);

    map2.set("key2", "value2");

    expect(compare(map1, map2)).toBe(false);
});

it("should compare Sets", () => {
    const set1 = new Set();
    set1.add("value");

    const set2 = new Set();
    set2.add("value");

    expect(compare(set1, set2)).toBe(true);

    set2.add("value2");

    expect(compare(set1, set2)).toBe(false);
});

it("should compare arrays", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    expect(compare(arr1, arr2)).toBe(true);

    arr2.push(4);

    expect(compare(arr1, arr2)).toBe(false);
});

it("should compare deepArrays", () => {
    const arr1 = [1, [2, [3, [4]]]];
    const arr2 = [1, [2, [3, [4]]]];

    expect(compare(arr1, arr2)).toBe(true);

    arr2[1][1][1].push(5);

    expect(compare(arr1, arr2)).toBe(false);
});

it("should compare objects", () => {
    const obj1 = { key: "value" };
    const obj2 = { key: "value" };

    expect(compare(obj1, obj2)).toBe(true);

    obj2["key2"] = "value2";

    expect(compare(obj1, obj2)).toBe(false);
});

it("should compare deepObjects", () => {
    const obj1 = { key: { key: { key: { key: "value" } } } };
    const obj2 = { key: { key: { key: { key: "value" } } } };

    expect(compare(obj1, obj2)).toBe(true);

    obj2["key"]["key"]["key"]["key2"] = "value2";

    expect(compare(obj1, obj2)).toBe(false);
});

it("should compare arrays containing objects", () => {
    const arr1 = [{ key: "value" }];
    const arr2 = [{ key: "value" }];

    expect(compare(arr1, arr2)).toBe(true);

    arr2.push({ key: "value2" });

    expect(compare(arr1, arr2)).toBe(false);
});

it("should compare objects containing arrays", () => {
    const obj1 = { key: [1, 2, 3] };
    const obj2 = { key: [1, 2, 3] };

    expect(compare(obj1, obj2)).toBe(true);

    obj2["key"].push(4);

    expect(compare(obj1, obj2)).toBe(false);
});

it("should compare undefined & null values", () => {
    expect(compare(undefined, undefined)).toBe(true);
    expect(compare(undefined, null)).toBe(false);
    expect(compare(null, null)).toBe(true);
    expect(compare(null, undefined)).toBe(false);
    expect(compare(undefined, "")).toBe(false);
    expect(compare(null, "")).toBe(false);
    expect(compare(undefined, 0)).toBe(false);
    expect(compare(null, 0)).toBe(false);
});

it("should accept schemas", () => {
    expect(compare(1, schema(z.number().int().positive()))).toBe(true);
    expect(compare(1, schema(z.number().int().negative()))).toBe(false);
});

it("should compare schemas in objects", () => {
    expect(compare(
        { key: 1, z: {
            z: 2
        }},
        {
            key: 1,
            z: {
                z: schema(z.number())
            }
        }
    )).toBe(true);

    expect(compare(
        {
            key: 1,
            z: {
                z: 2
            }
        },
        {
            key: 1,
            z: {
                z: schema(z.string())
            }
        }
    )).toBe(false);
});

it("should compare schemas in arrays", () => {
    expect(compare(
        [1, 2, 3],
        [1, 2, schema(z.number())]
    )).toBe(true);

    expect(compare(
        [1, 2, 3],
        [1, 2, schema(z.string())]
    )).toBe(false);
});

it("should compare schemas in maps", () => {
    const map1 = new Map();
    map1.set("key", 1);

    const map2 = new Map();
    map2.set("key", schema(z.number()));

    expect(compare(map1, map2)).toBe(true);

    map2.set("key2", schema(z.string()));

    expect(compare(map1, map2)).toBe(false);
});

it("should compare schemas in sets", () => {
    const set1 = new Set();
    set1.add(1);

    const set2 = new Set();
    set2.add(schema(z.number()));

    expect(compare(set1, set2)).toBe(true);

    set2.add(schema(z.string()));

    expect(compare(set1, set2)).toBe(false);
});

it("should compare a mix of all the above", () => {
    const actual = {
        key: [
            1,
            2,
            {
                key: new Map([
                    ["key", new Set([1, 2, 3])]
                ])
            }
        ]
    };

    expect(compare(actual, {
        key: [
            1,
            schema(z.number().positive()),
            {
                key: new Map([
                    ["key", schema(z.set(z.number().positive()))]
                ])
            }
        ]
    })).toBe(true);

    expect(compare(actual, {
        key: [
            1,
            schema(z.number().positive()),
            {
                key: new Map([
                    ["key", schema(z.set(z.number().negative()))] // changed to negative
                ])
            }
        ]
    })).toBe(false);
});

// TODO: schemas in maps & sets & arrays

function compare(actual: any, expected: any) {
    if (typeof expected === "object" && expected !== null) {
        // fyi, (typeof null) equals "object". I know. #javascript
        const isSchema = Object.keys(expected).some(key => key.endsWith("mockit__isSchema"));
        if (isSchema) {
            return (expected.schema as Parser).safeParse(actual).success;
        }

        const containsSchema = objectContainsSchema(expected);

        if (containsSchema) {
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
                return compare(actual[key], expected[key]);
            });
        }
    }

    if (typeof actual !== typeof expected) {
        return false;
    }

    return hasher.hash(actual) === hasher.hash(expected);
}


function objectContainsSchema(obj: any) {
    if (typeof obj !== "object") {
      return false;
    }
  
    if (Array.isArray(obj)) {
      return obj.some((item) => objectContainsSchema(item));
    }

    if (obj instanceof Map) {
        return Array.from(obj.values()).some((value) => objectContainsSchema(value));
    }

    if (obj instanceof Set) {
        return Array.from(obj.values()).some((value) => objectContainsSchema(value));
    }
  
    const keys = Object.keys(obj);
    if (keys.some((key) => key.endsWith("mockit__isSchema"))) {
      return true;
    }
  
    return keys.some((key) => {
      if (typeof obj[key] === "object") {
        return objectContainsSchema(obj[key]);
      }
  
      return false;
    });
  }
  
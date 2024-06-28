import { z } from "zod";
import { hasher } from "../hasher";

import { Parser, containing, deepContaining, deepPartial, partial, schema } from "../behaviours/constructs";
import { randomUUID } from "crypto";


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

it("should accept partial arrays constructs", () => {
    expect(compare([1], partial([1, 2, 3]))).toBe(true);
    expect(compare([4], partial([1, 2, 3]))).toBe(false);
});

it("should accept schema in partial arrays", () => {
    expect(compare([1], partial([schema(z.number())]))).toBe(true);
    expect(compare([1], partial([schema(z.string())]))).toBe(false);
});

it("should accept partial objects constructs", () => {
    expect(compare({ key: 1 }, partial({ key: 1, key2: 2 }))).toBe(true);
    expect(compare({ key: 1 }, partial({ key: 2, key2: 2 }))).toBe(false);
});

it("should accept partial maps constructs", () => {
    expect(compare(new Map([["key", 1]]), partial(new Map([["key", 1], ["key2", 2]])))).toBe(true);
    expect(compare(new Map([["key", 1]]), partial(new Map([["key", 2], ["key2", 2]])))).toBe(false);
});

it("should accept partial sets constructs", () => {
    expect(compare(new Set([1]), partial(new Set([1, 2, 3])))).toBe(true);
    expect(compare(new Set([4]), partial(new Set([1, 2, 3])))).toBe(false);
});

it("should accept schemas in partials arrays", () => {
    expect(compare([1], partial([schema(z.number()), schema(z.number())]))).toBe(true);
    expect(compare([1], partial([schema(z.string()), schema(z.string())]))).toBe(false);
});

it("should accept schemas in partials objects", () => {
    expect(compare({ key: 1 }, partial({ key: schema(z.number()), key2: schema(z.number()) }))).toBe(true);
    expect(compare({ key: 1 }, partial({ key: schema(z.string()), key2: schema(z.number()) }))).toBe(false);
});

it("should accept schemas in partials maps", () => {
    expect(compare(new Map([["key", 1]]), partial(new Map([["key", schema(z.number())], ["key2", schema(z.number())]])))).toBe(true);
    expect(compare(new Map([["key", 1]]), partial(new Map([["key", schema(z.string())], ["key2", schema(z.number())]])))).toBe(false);
});

it("should accept schemas in partials sets", () => {
    expect(compare(new Set([1]), partial(new Set([schema(z.number()), schema(z.number())])))).toBe(true); // [1] is a part of [string, number]
    expect(compare(new Set([1]), partial(new Set([schema(z.string()), schema(z.number())])))).toBe(true); // [1] is a part of [string, number]
    expect(compare(new Set([1]), partial(new Set([schema(z.string()), schema(z.string())])))).toBe(false); // [1] is not a part of [string, string]
});

it("should accept schemas in nested partials", () => {
    expect(
        compare(
            {
                x: 1,
                y: {
                    z: {
                        w: new Map([["key", new Set([randomUUID()])]])
                    }
                }
            },
            partial({ 
                x: 1,
                y: {
                    z: {
                        w: new Map([["key", new Set([schema(z.string().uuid())])]])
                    }
                }
            })
        )
    ).toBe(true);

    expect(
        compare(
            {
                x: 1,
                y: {
                    z: {
                        w: new Map([["key", new Set([randomUUID()])]])
                    }
                }
            },
            partial({ 
                x: 1,
                y: {
                    z: {
                        w: new Map([["key", new Set([schema(z.string().email())])]]) // changed to email => should fail
                    }
                }
            })
        )
    ).toBe(false);
});


it("should accept Containing constructs", () => {
    expect(compare(
        { key: 1, key2: 2 },
        containing({ key: 1 }),
    )).toEqual(true);

    expect(compare(
        { key: 1, key2: 2 },
        containing({ key: 2 }),
    )).toEqual(false);
});

it("should accept containing in objects", () => {
    expect(
        compare(
            [1, 2, 3],
            containing([1, 2])
        )
    ).toBe(true);

    expect(
        compare(
            [1, 2, 3],
            containing([1, 4])
        )
    ).toBe(false);
});

it("should accept containing in maps", () => {
    const map = new Map();
    map.set("key", 1);
    map.set("key2", 2);

    expect(
        compare(
            map,
            containing(new Map([["key", 1]]))
        )
    ).toBe(true);

    expect(
        compare(
            map,
            containing(new Map([["key", 2]]))
        )
    ).toBe(false);
});

it("should accept containing in sets", () => {
    const set = new Set();
    set.add(1);
    set.add(2);

    expect(
        compare(
            set,
            containing(new Set([1]))
        )
    ).toBe(true);

    expect(
        compare(
            set,
            containing(new Set([3]))
        )
    ).toBe(false);
});

// difference between containing and partial in arrays
it("should work differently for containing and partial in arrays", () => {
    expect(
        compare(
            [1, 2, 3],
            containing([1, 2])
        )
    ).toBe(true);

    expect(
        compare(
            [1, 2, 3], // 3 is not in the array
            // => [1, 2, 3] is not a part of [1, 2]
            // => should fail
            partial([1, 2])
        )
    ).toBe(false);

    expect(
        compare(
            [1, 2, 3],
            // 1, 2 and 3 are part of [1, 2, 4, 3]
            // => should pass
            partial([1, 2, 4, 3])
        )
    ).toBe(true);
});

it("should combine containing & partials", () => {
    expect(
        compare(
            {
                x: [1, 2, 3],
                y: { key: 1 },
            },
            partial({
                x: containing([1, 2]),
                y: { key: 1 },
                z: 3
            })
        )
    ).toBe(true);

    expect(
        compare(
            {
                x: [1, 2, 3],
                y: { key: 1 },
            },
            partial({
                x: containing([1, 4]), // 4 is not in the array => should fail
                y: { key: 1 },
                z: 3
            })
        )
    ).toBe(false);
});


it("should accept deepPartial in objects", () => {
    expect(
        compare(
            { z: { z: { z: 2 } } },
            deepPartial({ key: 1, z: { z: { z: 2 } }})
        )
    ).toBe(true);

    expect(
        compare(
            { z: { z: { z: 3 } } },
            deepPartial({ key: 1, z: { z: { z: 2 } }})
        )
    ).toBe(false);
});

it("should accept deepPartial in arrays", () => {
    expect(
        compare(
            [{ z: { z: { z: 2 } } }],
            deepPartial([1, 2, { key: 1, z: { z: { z: 2 } } }])
        )
    ).toBe(true);

    expect(
        compare(
            [{ z: { z: { z: 3 } } }],
            deepPartial([1, 2, { key: 1, z: { z: { z: 2 } } }])
        )
    ).toBe(false);
});

it("should accept deepPartial in maps", () => {
    const map = new Map();
    map.set("key", { z: { z: { z: 2 } }});

    expect(
        compare(
            map,
            deepPartial(new Map([["key", { key: 1, z: { z: { z: 2 } } }]]))
        )
    ).toBe(true);

    const map2 = new Map();
    map2.set("key", { z: { z: { z: 3 } }}); // changed to 3 => should fail

    expect(
        compare(
            map2,
            deepPartial(new Map([["key", { key: 1, z: { z: { z: 2 } } }]]))
        )
    ).toBe(false);
});

it("should accept deepPartial in sets", () => {
    const set = new Set();
    set.add({ z: { z: { z: 2 } }});

    expect(
        compare(
            set,
            deepPartial(new Set([{ key: 1, z: { z: { z: 2 } }}]))
        )
    ).toBe(true);

    expect(
        compare(
            set,
            deepPartial(new Set([{ key: 1, z: { z: { z: 5 } }}]))
        )
    ).toBe(false);
});

it("should accept deepContaining constructs in object", () => {
    expect(
        compare(
            { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
            deepContaining({ z: { z: { z: 2 } } })
        )
    ).toBe(true);

    expect(
        compare(
            { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
            deepContaining({ z: { z: { z: 3 } }}) // z changed to 3, but provided a value of 2 => should fail
        )
    ).toBe(false);
});

it("should accept deepContaining constructs in arrays", () => {
    expect(
        compare(
            [1, 2, { z: { z: { z: 2 } } }, 4, 5, 6],
            deepContaining([1, 2, { z: { z: { z: 2 } }}])
        )
    ).toBe(true);

    expect(
        compare(
            [{ z: { z: { z: 2 } }}, 4, 5, 6], // 1 and 2 are not contained in the provided array => should fail
            deepContaining([1, 2, { z: { z: { z: 2 } }}])
        )
    ).toBe(false);
});

it("should accept deepContaining constructs in maps", () => {
    const map = new Map();
    map.set("key", { z: { z: { z: 2 } }});
    map.set("key2", { z: { z: { z: 5 }}});

    expect(
        compare(
            map,
            deepContaining(new Map([["key", { z: { z: { z: 2 } }}]])) // key2 is not contained in the deepContainingMap
            // BUT, the provided value is contained in the map => should pass (containing just checks if the provided value is contained in the map)
        )
    ).toBe(true);
    
    expect(
        compare(
            map,
            deepPartial(new Map([["key", { z: { z: { z: 2 } }}]]) // map contains 5 which is not a part of the map provided in the deepPartial => should fail
        ))
    ).toBe(false)

    expect(
        compare(
            map,
            deepContaining(new Map([["key", { z: { z: { z: 3 } }}]])) // key2 is not contained in the map passed to deepContainingMap => should fail
        )
    ).toBe(false);
});

it("should accept deepContaining constructs in sets", () => {
    const set = new Set();
    set.add({ z: { z: { z: 2 }}});
    set.add({ z: { z: { z: 5 }}});

    expect(
        compare(
            set,
            deepContaining(new Set([{ z: { z: { z: 2 }}}]))
        )
    ).toBe(true);

    expect(
        compare(
            set,
            deepContaining(new Set([{ z: { z: { z: 3 }}}]))
        )
    ).toBe(false);
});

it("should accept schemas in deepContaining", () => {
    expect(
        compare(
            [1, 2, "Victor", { z: { z: { z: 2 }}}, 4, 5, 6],
            deepContaining([1, 2, schema(z.string()), { z: { z: { z: 2 }}}, 4, 5, schema(z.number().refine(n => n === 6))])
        )
    ).toBe(true);

    expect(
        compare(
            [1, 2, "Victor", { z: { z: { z: 2 }}}, 4, 5, 6],
            deepContaining([1, 2, schema(z.string()), { z: { z: { z: 2 }}}, 4, 5, schema(z.number().refine(n => n === 7))]) // 6 !== 7 => should fail
        )
    ).toBe(false);
});

// TODO: schemas in maps & sets & arrays

function compare(actual: any, expected: any) {
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
                console.log("partial: comparing values: ", actual[key], expected.original[key])
                return compare(actual[key], expected.original[key]);
            });
        }

        const isContaining = Object.keys(expected).some(key => key.endsWith("mockit__isContaining"));
        if (isContaining) {
            if (Array.isArray(expected.original)) {
                return expected.original.every((item, index) => {
                    return compare(actual[index], item);
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

        const isDeepPartial = Object.keys(expected).some(key => key.endsWith("mockit__isDeepPartial"));
        if (isDeepPartial) {
            // Numbers, strings, etc.
            if (typeof actual !== "object") {
                return hasher.hash(actual) === hasher.hash(expected.original);
            }

            if (Array.isArray(expected.original)) {
                return actual.every((item) => {
                    return expected.original?.some(expectedItem => compare(item, deepPartial(expectedItem)));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from(((actual as Map<any, any>) ?? [])?.entries()).every(([key, actualValue]) => {
                    return compare(actualValue, deepPartial(expected.original.get(key)));
                });
            }

            if (expected.original instanceof Set) {
                return Array.from((actual as Set<any> ?? new Set()).values()).every(actualValue => {
                    return Array.from(expected.original.values()).some(expectedValue => compare(actualValue, deepPartial(expectedValue)));
                });
            }
            
            // C'est reparti pour un tour
            return Object.keys(actual).every(key => {
                return compare(actual[key], deepPartial(expected?.original?.[key]));
            });
        }

        const isDeepContaining = Object.keys(expected).some(key => key.endsWith("mockit__isDeepContaining"));
        if (isDeepContaining) {
            if (typeof actual !== "object") {
                return hasher.hash(actual) === hasher.hash(expected.original);
            }

            if (Array.isArray(expected.original)) {
                return expected.original.every((expectedValue, index) => {
                    return compare(actual[index], deepContaining(expectedValue));
                });
            }

            if (expected.original instanceof Map) {
                return Array.from(((expected?.original as Map<any, any>) ?? []).entries()).every(([key, expectedVAlue]) => {
                    return compare(actual.get(key), deepContaining(expectedVAlue));
                });
            }

            if (expected.original instanceof Set) {
                return Array.from(((expected?.original as Set<any>) ?? []).values()).every(expectedValue => {
                    return Array.from(actual.values()).some(actualValue => compare(actualValue, deepContaining(expectedValue)));
                });
            }

            return Object.keys(expected.original).every(key => {
                return compare(actual[key], deepContaining(expected.original[key]));
            });
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
  
function objectContainsPartial(obj: any) {
    if (typeof obj !== "object") {
        return false;
    }

    if (Array.isArray(obj)) {
        return obj.some((item) => objectContainsPartial(item));
    }

    if (obj instanceof Map) {
        return Array.from(obj.values()).some((value) => objectContainsPartial(value));
    }

    if (obj instanceof Set) {
        return Array.from(obj.values()).some((value) => objectContainsPartial(value));
    }

    const keys = Object.keys(obj);
    if (keys.some((key) => key.endsWith("mockit__isPartial"))) {
        return true;
    }

    return keys.some((key) => {
        if (typeof obj[key] === "object") {
            return objectContainsPartial(obj[key]);
        }

        return false;
    });
}
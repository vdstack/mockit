import { z } from "zod";

import { containing, partial, schema, containingDeep, partialDeep } from "../behaviours/constructs";
import { randomUUID } from "crypto";
import { compare } from "./compare";


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


it("should accept partialDeep in objects", () => {
    expect(
        compare(
            { z: { z: { z: 2 } } },
            partialDeep({ key: 1, z: { z: { z: 2 } }})
        )
    ).toBe(true);

    expect(
        compare(
            { z: { z: { z: 3 } } },
            partialDeep({ key: 1, z: { z: { z: 2 } }})
        )
    ).toBe(false);
});

it("should accept partialDeep in arrays", () => {
    expect(
        compare(
            [{ z: { z: { z: 2 } } }],
            partialDeep([1, 2, { key: 1, z: { z: { z: 2 } } }])
        )
    ).toBe(true);

    expect(
        compare(
            [{ z: { z: { z: 3 } } }],
            partialDeep([1, 2, { key: 1, z: { z: { z: 2 } } }])
        )
    ).toBe(false);
});

it("should accept partialDeep in maps", () => {
    const map = new Map();
    map.set("key", { z: { z: { z: 2 } }});

    expect(
        compare(
            map,
            partialDeep(new Map([["key", { key: 1, z: { z: { z: 2 } } }]]))
        )
    ).toBe(true);

    const map2 = new Map();
    map2.set("key", { z: { z: { z: 3 } }}); // changed to 3 => should fail

    expect(
        compare(
            map2,
            partialDeep(new Map([["key", { key: 1, z: { z: { z: 2 } } }]]))
        )
    ).toBe(false);
});

it("should accept partialDeep in sets", () => {
    const set = new Set();
    set.add({ z: { z: { z: 2 } }});

    expect(
        compare(
            set,
            partialDeep(new Set([{ key: 1, z: { z: { z: 2 } }}]))
        )
    ).toBe(true);

    expect(
        compare(
            set,
            partialDeep(new Set([{ key: 1, z: { z: { z: 5 } }}]))
        )
    ).toBe(false);
});

it("should accept containingDeep constructs in object", () => {
    expect(
        compare(
            { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
            containingDeep({ z: { z: { z: 2 } } })
        )
    ).toBe(true);

    expect(
        compare(
            { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
            containingDeep({ z: { z: { z: 3 } }}) // z changed to 3, but provided a value of 2 => should fail
        )
    ).toBe(false);
});


it("should accept containingDeep constructs in arrays", () => {
    expect(
        compare(
            [1, 2, { z: { z: { z: 2 } } }, 4, 5, 6],
            containingDeep([1, 2, { z: { z: { z: 2 } }}])
        )
    ).toBe(true);

    expect(
        compare(
            [{ z: { z: { z: 2 } }}, 4, 5, 6], // 1 and 2 are not contained in the provided array => should fail
            containingDeep([1, 2, { z: { z: { z: 2 } }}])
        )
    ).toBe(false);
});

it("should accept containingDeep constructs in maps", () => {
    const map = new Map();
    map.set("key", { z: { z: { z: 2 } }});
    map.set("key2", { z: { z: { z: 5 }}});

    expect(
        compare(
            map,
            containingDeep(new Map([["key", { z: { z: { z: 2 } }}]])) // key2 is not contained in the containingDeepMap
            // BUT, the provided value is contained in the map => should pass (containing just checks if the provided value is contained in the map)
        )
    ).toBe(true);
    
    expect(
        compare(
            map,
            partialDeep(new Map([["key", { z: { z: { z: 2 } }}]]) // map contains 5 which is not a part of the map provided in the partialDeep => should fail
        ))
    ).toBe(false)

    expect(
        compare(
            map,
            containingDeep(new Map([["key", { z: { z: { z: 3 } }}]])) // key2 is not contained in the map passed to containingDeepMap => should fail
        )
    ).toBe(false);
});

it("should accept containingDeep constructs in sets", () => {
    const set = new Set();
    set.add({ z: { z: { z: 2 }}});
    set.add({ z: { z: { z: 5 }}});

    expect(
        compare(
            set,
            containingDeep(new Set([{ z: { z: { z: 2 }}}]))
        )
    ).toBe(true);

    expect(
        compare(
            set,
            containingDeep(new Set([{ z: { z: { z: 3 }}}]))
        )
    ).toBe(false);
});

it("should accept schemas in containingDeep", () => {
    expect(
        compare(
            [1, 2, "Victor", { z: { z: { z: 2 }}}, 4, 5, 6],
            containingDeep([1, 2, schema(z.string()), { z: { z: { z: 2 }}}, 4, 5, schema(z.number().refine(n => n === 6))])
        )
    ).toBe(true);

    expect(
        compare(
            [1, 2, "Victor", { z: { z: { z: 2 }}}, 4, 5, 6],
            containingDeep([1, 2, schema(z.string()), { z: { z: { z: 2 }}}, 4, 5, schema(z.number().refine(n => n === 7))]) // 6 !== 7 => should fail
        )
    ).toBe(false);
});

it("should combine nested containing ", () => {
    expect(
        compare(
            {
                x: {
                    y: {
                        z: { z: { z: 2 } }
                    },
                    w: [1, 2, { name: "Victor", surname: "Dupuy" }]
                }
            },
            {
                x: containing({
                    w: containing([schema(z.number().int().positive()), containing({ name: "Victor" })]),
                })
            },
        )
    ).toBe(true);
});



it("should combine work the same way with containingDeep ", () => {
    expect(
        compare(
            {
                x: {
                    y: {
                        z: { z: { z: 2 } }
                    },
                    w: [1, 2, { name: "Victor", surname: "Dupuy" }]
                }
            },
            {
                x: containingDeep({
                    w: ([schema(z.number().int().positive()), { name: "Victor" }]),
                })
            },
        )
    ).toBe(true);
});

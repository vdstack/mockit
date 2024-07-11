import { z } from "zod";

import { compare } from "./compare";
import { m } from "..";
import { validates } from "../behaviours/matchers";

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
  expect(compare(1, validates(z.number().int().positive()))).toBe(true);
  expect(compare(1, validates(z.number().int().negative()))).toBe(false);
});

it("should compare schemas in objects", () => {
  expect(
    compare(
      {
        key: 1,
        z: {
          z: 2,
        },
      },
      {
        key: 1,
        z: {
          z: validates(z.number()),
        },
      }
    )
  ).toBe(true);

  expect(
    compare(
      {
        key: 1,
        z: {
          z: 2,
        },
      },
      {
        key: 1,
        z: {
          z: validates(z.string()),
        },
      }
    )
  ).toBe(false);
});

it("should compare schemas in arrays", () => {
  expect(compare([1, 2, 3], [1, 2, validates(z.number())])).toBe(true);

  expect(compare([1, 2, 3], [1, 2, validates(z.string())])).toBe(false);
});

it("should compare schemas in maps", () => {
  const map1 = new Map();
  map1.set("key", 1);

  const map2 = new Map();
  map2.set("key", validates(z.number()));

  expect(compare(map1, map2)).toBe(true);

  map2.set("key2", validates(z.string()));

  expect(compare(map1, map2)).toBe(false);
});

it("should compare schemas in sets", () => {
  const set1 = new Set();
  set1.add(1);

  const set2 = new Set();
  set2.add(validates(z.number()));

  expect(compare(set1, set2)).toBe(true);

  set2.add(validates(z.string()));

  expect(compare(set1, set2)).toBe(false);
});

it("should compare a mix of all the above", () => {
  const actual = {
    key: [
      1,
      2,
      {
        key: new Map([["key", new Set([1, 2, 3])]]),
      },
    ],
  };

  expect(
    compare(actual, {
      key: [
        1,
        validates(z.number().positive()),
        {
          key: new Map([["key", validates(z.set(z.number().positive()))]]),
        },
      ],
    })
  ).toBe(true);

  expect(
    compare(actual, {
      key: [
        1,
        validates(z.number().positive()),
        {
          key: new Map([
            ["key", validates(z.set(z.number().negative()))], // changed to negative
          ]),
        },
      ],
    })
  ).toBe(false);
});

it("should accept Containing constructs", () => {
  expect(compare({ key: 1, key2: 2 }, m.objectContaining({ key: 1 }))).toEqual(
    true
  );

  expect(compare({ key: 1, key2: 2 }, m.objectContaining({ key: 2 }))).toEqual(
    false
  );
});

it("should accept containing in objects", () => {
  expect(compare([1, 2, 3], m.arrayContaining([1, 2]))).toBe(true);

  expect(compare([1, 2, 3], m.arrayContaining([1, 4]))).toBe(false);
});

it("should accept containing in maps", () => {
  const map = new Map();
  map.set("key", 1);
  map.set("key2", 2);

  expect(compare(map, m.mapContaining(new Map([["key", 1]])))).toBe(true);

  expect(compare(map, m.mapContaining(new Map([["key", 2]])))).toBe(false);
});

it("should accept containing in sets", () => {
  const set = new Set();
  set.add(1);
  set.add(2);

  expect(compare(set, m.setContaining(new Set([1])))).toBe(true);

  expect(compare(set, m.setContaining(new Set([3])))).toBe(false);
});

it("should accept containingDeep constructs in object", () => {
  expect(
    compare(
      { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
      m.objectContainingDeep({ z: { z: { z: 2 } } })
    )
  ).toBe(true);

  expect(
    compare(
      { x: 1, y: 2, z: { z: { z: 2, y: 3 } } },
      m.objectContainingDeep({ z: { z: { z: 3 } } }) // z changed to 3, but provided a value of 2 => should fail
    )
  ).toBe(false);
});

it("should accept containingDeep constructs in arrays", () => {
  expect(
    compare(
      [1, 2, { z: { z: { z: 2 } } }, 4, 5, 6],
      m.objectContainingDeep([1, 2, { z: { z: { z: 2 } } }])
    )
  ).toBe(true);

  expect(
    compare(
      [{ z: { z: { z: 2 } } }, 4, 5, 6], // 1 and 2 are not contained in the provided array => should fail
      m.objectContainingDeep([1, 2, { z: { z: { z: 2 } } }])
    )
  ).toBe(false);
});

it("should accept containingDeep constructs in maps", () => {
  const map = new Map();
  map.set("key", { z: { z: { z: 2 } } });
  map.set("key2", { z: { z: { z: 5 } } });

  expect(
    compare(
      map,
      m.mapContainingDeep(new Map([["key", { z: { z: { z: 2 } } }]])) // key2 is not contained in the containingDeepMap
      // BUT, the provided value is contained in the map => should pass (containing just checks if the provided value is contained in the map)
    )
  ).toBe(true);

  expect(
    compare(
      map,
      m.mapContainingDeep(new Map([["key", { z: { z: { z: 3 } } }]])) // key2 is not contained in the map passed to containingDeepMap => should fail
    )
  ).toBe(false);
});

it("should accept containingDeep constructs in sets", () => {
  const set = new Set();
  set.add({ z: { z: { z: 2 } } });
  set.add({ z: { z: { z: 5 } } });

  expect(
    compare(set, m.setContainingDeep(new Set([{ z: { z: { z: 2 } } }])))
  ).toBe(true);

  expect(
    compare(set, m.setContainingDeep(new Set([{ z: { z: { z: 3 } } }])))
  ).toBe(false);
});

it("should accept schemas in containingDeep", () => {
  expect(
    compare(
      [1, 2, "Victor", { z: { z: { z: 2 } } }, 4, 5, 6],
      m.arrayContainingDeep([
        1,
        2,
        validates(z.string()),
        { z: { z: { z: 2 } } },
        4,
        5,
        validates(z.number().refine((n) => n === 6)),
      ])
    )
  ).toBe(true);

  expect(
    compare(
      [1, 2, "Victor", { z: { z: { z: 2 } } }, 4, 5, 6],
      m.arrayContainingDeep([
        1,
        2,
        validates(z.string()),
        { z: { z: { z: 2 } } },
        4,
        5,
        validates(z.number().refine((n) => n === 7)),
      ]) // 6 !== 7 => should fail
    )
  ).toBe(false);
});

it("should combine nested containing ", () => {
  expect(
    compare(
      {
        x: {
          y: {
            z: { z: { z: 2 } },
          },
          w: [1, 2, { name: "Victor", surname: "Dupuy" }],
        },
      },
      {
        x: m.objectContaining({
          w: m.objectContaining([
            validates(z.number().int().positive()),
            m.objectContaining({ name: "Victor" }),
          ]),
        }),
      }
    )
  ).toBe(true);
});

it("should combine work the same way with containingDeep ", () => {
  expect(
    compare(
      {
        x: {
          y: {
            z: { z: { z: 2 } },
          },
          w: [1, 2, { name: "Victor", surname: "Dupuy" }],
        },
      },
      {
        x: m.objectContainingDeep({
          w: [validates(z.number().int().positive()), { name: "Victor" }],
        }),
      }
    )
  ).toBe(true);
});

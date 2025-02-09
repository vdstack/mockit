import { m } from "../../";
import {
  arrayContainingDeep,
  mapContainingDeep,
  setContainingDeep,
} from "../../behaviours/matchers";

import { compare } from "./compare";

describe("compare.containingDeep", () => {
  it("should accept containing in deep objects", () => {
    const actual = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4,
        },
      },
    };

    const expected = m.objectContainingDeep({
      b: {
        d: { e: 3 },
      },
    });

    const expectedFalse = m.objectContainingDeep({
      b: {
        d: { e: 4 },
      },
    });

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });

  it("should accept containing in deep arrays", () => {
    const actual = [1, [2, 3, [4, 5]]];

    const expected = arrayContainingDeep([[[5]]]);

    const expectedFalse = [[[6]]];

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });

  it("should accept containing in deep maps", () => {
    const actual = new Map<string, number | Map<any, any>>([
      ["a", 1],
      ["b", 2],
      [
        "c",
        new Map([
          ["d", 3],
          ["e", 4],
        ]),
      ],
    ]);

    const expected = mapContainingDeep(
      new Map<any, any>([["c", new Map<any, any>([["d", 3]])]])
    );

    const expectedFalse = new Map<any, any>([
      ["c", new Map<any, any>([["d", 4]])],
    ]);

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });

  it("should accept containing in deep sets", () => {
    const actual = new Set([1, new Set([2, 3, new Set([4, 5])])]);

    const expected = setContainingDeep(new Set([new Set([new Set([5])])]));

    const expectedFalse = setContainingDeep(new Set([new Set([6])]));
    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });
});

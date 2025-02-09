import {
  arrayContaining,
  mapContaining,
  objectContaining,
  setContaining,
  stringContaining,
} from "../../behaviours/matchers";

import { compare } from "./compare";

describe("compare.containing", () => {
  it("should check that an object contains another object", () => {
    const actual = { a: 1, b: 2, c: 3 };
    const expected = objectContaining({ a: 1, b: 2 });

    expect(compare(actual, expected)).toBe(true);
  });

  it("should check that an object does not contain another object", () => {
    const actual = { a: 1, b: 2, c: 3 };
    const expected = objectContaining({ a: 1, b: "Victor" });

    expect(compare(actual, expected)).toBe(false);
  });

  it("should check that an array contains the elements of another array", () => {
    const actual = [1, 2, 3];
    const expected = arrayContaining([1, 2]);

    expect(compare(actual, expected)).toBe(true);
  });

  it("should check that an array does not contain the elements of another array", () => {
    const actual = [1, 2, 3];
    const expected = arrayContaining([1, "Victor"]);

    expect(compare(actual, expected)).toBe(false);
  });

  it("should check that a Map contains the elements of another Map", () => {
    const actual = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const expected = mapContaining(new Map([["a", 1]]));

    expect(compare(actual, expected)).toBe(true);
  });

  it("should check that a Map does not contain the elements of another Map", () => {
    const actual = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const expected = mapContaining(new Map([["a", "Victor"]]));

    expect(compare(actual, expected)).toBe(false);
  });

  it("should check that a Set contains the elements of another Set", () => {
    const actual = new Set([1, 2, 3]);
    const expected = setContaining(new Set([1, 2]));

    expect(compare(actual, expected)).toBe(true);
  });

  it("should check that a Set does not contain the elements of another Set", () => {
    const actual = new Set([1, 2, 3]);
    const expected = setContaining(new Set([1, "Victor"]));

    expect(compare(actual, expected)).toBe(false);
  });

  it("should check that a String contains the elements of another String", () => {
    const expected = stringContaining("Hello");

    expect(compare("Hello World", expected)).toBe(true);
    expect(compare("World Hello", expected)).toBe(true);
  });

  it("should check that a String does not contain the elements of another String", () => {
    const actual = "Hello, World!";
    const expected = stringContaining("Victor");

    expect(compare(actual, expected)).toBe(false);
  });
});

describe("complex cases", () => {
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

    const expected = {
      a: 1,
      b: {
        c: 2,
        d: objectContaining({ e: 3 }),
      },
    };

    const expectedFalse = {
      a: 1,
      b: {
        c: 2,
        d: objectContaining({ e: 4 }),
      },
    };

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });

  it("should accept containing in deep arrays", () => {
    const actual = [1, [2, 3, [4, 5]]];

    const expected = [1, [2, 3, arrayContaining([5])]];

    const expectedFalse = [1, [2, 3, arrayContaining([6])]];

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

    const expected = new Map<any, any>([
      ["a", 1],
      ["b", 2],
      ["c", mapContaining(new Map<any, any>([["d", 3]]))],
    ]);

    const expectedFalse = new Map<any, any>([
      ["a", 1],
      ["b", 2],
      ["c", mapContaining(new Map<any, any>([["d", 4]]))],
    ]);

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });

  it("should accept containing in deep sets", () => {
    const actual = new Set([1, new Set([2, 3, new Set([4, 5])])]);

    const expected = new Set([1, new Set([2, 3, setContaining(new Set([5]))])]);

    const expectedFalse = new Set([
      1,
      new Set([2, 3, setContaining(new Set([6]))]),
    ]);

    expect(compare(actual, expected)).toBe(true);
    expect(compare(actual, expectedFalse)).toBe(false);
  });
});

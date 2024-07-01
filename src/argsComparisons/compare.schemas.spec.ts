import { z } from "zod";
import { schema } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.schema", () => {
  it("should compare schema and values", () => {
    const actual = "hello world";
    const expected = schema(z.string());

    expect(compare(actual, expected)).toBe(true);

    expect(compare(1, expected)).toBe(false);
  });

  it("should compare schemas in objects", () => {
    const expected = { a: 1, b: schema(z.string()) };

    expect(compare({ a: 1, b: "hello world" }, expected)).toBe(true);

    expect(compare({ a: 1, b: 2 }, expected)).toBe(false);
  });

  it("should compare schemas in arrays", () => {
    const expected = [1, schema(z.string())];

    expect(compare([1, "hello world"], expected)).toBe(true);

    expect(compare([1, 2], expected)).toBe(false);
  });

  it("should compare schemas in maps", () => {
    const actual = new Map<string, any>([
      ["a", 1],
      ["b", "hello world"],
    ]);

    const expected = new Map<string, any>([
      ["a", 1],
      ["b", schema(z.string())],
    ]);

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = new Map<string, any>([
      ["a", 1],
      ["b", 2],
    ]);

    expect(compare(actualFalse, expected)).toBe(false);
  });

  it("should compare schemas in sets", () => {
    const actual = new Set<any>([1, "hello world"]);

    const expected = new Set<any>([1, schema(z.string())]);

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = new Set<any>([1, 2]);

    expect(compare(actualFalse, expected)).toBe(false);
  });

  it("should work very deep in objects", () => {
    const actual = {
      a: { b: { c: { d: { e: 2 } } } },
      x: "Victor",
    };

    const expected = {
      a: { b: { c: { d: { e: schema(z.number()) } } } },
      x: "Victor",
    };

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = {
      a: { b: { c: { d: { e: "not a number" } } } },
      x: "Victor",
    };

    expect(compare(actualFalse, expected)).toBe(false);
  });

  it("should work very deep in arrays", () => {
    const actual = [[[[[2]]]], "Victor"];

    const expected = [[[[[schema(z.number())]]]], "Victor"];

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = [[[[["not a number"]]]], "Victor"];

    expect(compare(actualFalse, expected)).toBe(false);
  });

  it("should work very deep in maps", () => {
    const actual = new Map<string, any>([
      ["a", new Map<string, any>([["b", new Map<string, any>([["c", 2]])]])],
      ["x", "Victor"],
    ]);

    const expected = new Map<string, any>([
      [
        "a",
        new Map<string, any>([
          ["b", new Map<string, any>([["c", schema(z.number())]])],
        ]),
      ],
      ["x", "Victor"],
    ]);

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = new Map<string, any>([
      [
        "a",
        new Map<string, any>([
          ["b", new Map<string, any>([["c", "not a number"]])],
        ]),
      ],
      ["x", "Victor"],
    ]);

    expect(compare(actualFalse, expected)).toBe(false);
  });

  it("should work very deep in sets", () => {
    const actual = new Set<any>([
      new Set<any>([new Set<any>([new Set<any>([2])])]),
      "Victor",
    ]);

    const expected = new Set<any>([
      new Set<any>([new Set<any>([new Set<any>([schema(z.number())])])]),
      "Victor",
    ]);

    expect(compare(actual, expected)).toBe(true);

    const actualFalse = new Set<any>([
      new Set<any>([new Set<any>([new Set<any>(["not a number"])])]),
      "Victor",
    ]);

    expect(compare(actualFalse, expected)).toBe(false);
  });
});

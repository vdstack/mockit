import { any } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.any", () => {
  it("should detect any number", () => {
    expect(compare(2, any.number())).toBe(true);
    expect(compare("2", any.number())).toBe(false);
    expect(compare(NaN, any.number())).toBe(false);
  });

  it("should detect any string", () => {
    expect(compare("hello", any.string())).toBe(true);
    expect(compare(2, any.string())).toBe(false);
  });

  it("should detect any boolean", () => {
    expect(compare(true, any.boolean())).toBe(true);
    expect(compare("true", any.boolean())).toBe(false);
  });

  it("should detect any object", () => {
    expect(compare({}, any.object())).toBe(true);
    expect(compare([], any.object())).toBe(false);
    expect(compare(new Map(), any.object())).toBe(false);
    expect(compare(new Set(), any.object())).toBe(false);
  });

  it("should detect any map", () => {
    expect(compare(new Map(), any.map())).toBe(true);
    expect(compare({}, any.map())).toBe(false);
  });

  it("should detect any set", () => {
    expect(compare(new Set(), any.set())).toBe(true);
    expect(compare({}, any.set())).toBe(false);
  });

  it("should detect any array", () => {
    expect(compare([], any.array())).toBe(true);
    expect(compare({}, any.array())).toBe(false);
  });

  it("should detect any function", () => {
    expect(compare(() => {}, any.function())).toBe(true);
    expect(compare({}, any.function())).toBe(false);
  });

  it("should detect any nullish", () => {
    expect(compare(null, any.nullish())).toBe(true);
    expect(compare(undefined, any.nullish())).toBe(true);
    expect(compare({}, any.nullish())).toBe(false);
  });

  it("should detect any falsy", () => {
    expect(compare(false, any.falsy())).toBe(true);
    expect(compare(null, any.falsy())).toBe(true);
    expect(compare(undefined, any.falsy())).toBe(true);
    expect(compare(0, any.falsy())).toBe(true);
    expect(compare("", any.falsy())).toBe(true);
    expect(compare({}, any.falsy())).toBe(false);
  });

  it("should detect any truthy", () => {
    expect(compare(true, any.truthy())).toBe(true);
    expect(compare(1, any.truthy())).toBe(true);
    expect(compare("hello", any.truthy())).toBe(true);
    expect(compare({}, any.truthy())).toBe(true);
    expect(compare([], any.truthy())).toBe(true);
    expect(compare(new Map(), any.truthy())).toBe(true);
    expect(compare(new Set(), any.truthy())).toBe(true);
    expect(compare(() => {}, any.truthy())).toBe(true);
    expect(compare(null, any.truthy())).toBe(false);
    expect(compare(undefined, any.truthy())).toBe(false);
    expect(compare(false, any.truthy())).toBe(false);
    expect(compare(0, any.truthy())).toBe(false);
    expect(compare("", any.truthy())).toBe(false);
  });
});

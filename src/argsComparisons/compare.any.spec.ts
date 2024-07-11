import { anyArray, anyBoolean, anyFalsy, anyFunction, anyMap, anyNullish, anyNumber, anyObject, anySet, anyString, anyTruthy } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.any", () => {
  it("should detect any number", () => {
    expect(compare(2, anyNumber())).toBe(true);
    expect(compare("2", anyNumber())).toBe(false);
    expect(compare(NaN, anyNumber())).toBe(false);
  });

  it("should detect any string", () => {
    expect(compare("hello", anyString())).toBe(true);
    expect(compare(2, anyString())).toBe(false);
  });

  it("should detect any boolean", () => {
    expect(compare(true, anyBoolean())).toBe(true);
    expect(compare("true", anyBoolean())).toBe(false);
    expect(compare(1, anyBoolean())).toBe(false);
    expect(compare(0, anyBoolean())).toBe(false);
    expect(compare(null, anyBoolean())).toBe(false);
    expect(compare(undefined, anyBoolean())).toBe(false);
    expect(compare("", anyBoolean())).toBe(false);
    expect(compare({}, anyBoolean())).toBe(false);
  });

  it("should detect any object", () => {
    expect(compare({}, anyObject())).toBe(true);
    expect(compare([], anyObject())).toBe(false);
    expect(compare(new Map(), anyObject())).toBe(false);
    expect(compare(new Set(), anyObject())).toBe(false);
  });

  it("should detect any map", () => {
    expect(compare(new Map(), anyMap())).toBe(true);
    expect(compare({}, anyMap())).toBe(false);
  });

  it("should detect any set", () => {
    expect(compare(new Set(), anySet())).toBe(true);
    expect(compare({}, anySet())).toBe(false);
  });

  it("should detect any array", () => {
    expect(compare([], anyArray())).toBe(true);
    expect(compare({}, anyArray())).toBe(false);
  });

  it("should detect any function", () => {
    expect(compare(() => {}, anyFunction())).toBe(true);
    expect(compare({}, anyFunction())).toBe(false);
  });

  it("should detect any nullish", () => {
    expect(compare(null, anyNullish())).toBe(true);
    expect(compare(undefined, anyNullish())).toBe(true);
    expect(compare({}, anyNullish())).toBe(false);
  });

  it("should detect any falsy", () => {
    expect(compare(false, anyFalsy())).toBe(true);
    expect(compare(null, anyFalsy())).toBe(true);
    expect(compare(undefined, anyFalsy())).toBe(true);
    expect(compare(0, anyFalsy())).toBe(true);
    expect(compare("", anyFalsy())).toBe(true);
    expect(compare({}, anyFalsy())).toBe(false);
  });

  it("should detect any truthy", () => {
    expect(compare(true, anyTruthy())).toBe(true);
    expect(compare(1, anyTruthy())).toBe(true);
    expect(compare("hello", anyTruthy())).toBe(true);
    expect(compare({}, anyTruthy())).toBe(true);
    expect(compare([], anyTruthy())).toBe(true);
    expect(compare(new Map(), anyTruthy())).toBe(true);
    expect(compare(new Set(), anyTruthy())).toBe(true);
    expect(compare(() => {}, anyTruthy())).toBe(true);
    expect(compare(null, anyTruthy())).toBe(false);
    expect(compare(undefined, anyTruthy())).toBe(false);
    expect(compare(false, anyTruthy())).toBe(false);
    expect(compare(0, anyTruthy())).toBe(false);
    expect(compare("", anyTruthy())).toBe(false);
  });
});

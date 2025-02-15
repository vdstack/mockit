import { isOneOf } from "../../behaviours/matchers";
import { compare } from "./compare";

describe("compare.oneOf", () => {
  it("should compare a value and the items of an array", () => {
    expect(compare(1, isOneOf([1, 2]))).toBe(true);
    expect(compare(2, isOneOf([1, 2]))).toBe(true);
    expect(compare(3, isOneOf([1, 2]))).toBe(false);
  });

  it("should work deep", () => {
    const actual = {
      x: { y: { z: 1 } },
    };

    expect(compare(actual, { x: { y: { z: isOneOf([1, 2]) } } })).toBe(true);
  });
});

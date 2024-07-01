import { stringEndingWith, stringStartingWith } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.endsWith", () => {
  it("should compare a string and an endsWith construct", () => {
    expect(compare("hello world", stringEndingWith("world"))).toBe(true);
    expect(compare("hello world", stringEndingWith("hello"))).toBe(false);
  });

  it("should compare a string and an endsWith construct deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(
      compare(actual, { x: { y: { z: stringEndingWith("world") } } })
    ).toBe(true);
    expect(
      compare(actual, { x: { y: { z: stringEndingWith("hello") } } })
    ).toBe(false);
  });
});

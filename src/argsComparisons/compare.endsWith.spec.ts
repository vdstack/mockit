import { endsWith, startsWith } from "../behaviours/constructs";
import { compare } from "./compare";

describe("compare.endsWith", () => {
  it("should compare a string and an endsWith construct", () => {
    expect(compare("hello world", endsWith("world"))).toBe(true);
    expect(compare("hello world", endsWith("hello"))).toBe(false);
  });

  it("should compare a string and an endsWith construct deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(compare(actual, { x: { y: { z: endsWith("world") } } })).toBe(true);
    expect(compare(actual, { x: { y: { z: endsWith("hello") } } })).toBe(false);
  });
});

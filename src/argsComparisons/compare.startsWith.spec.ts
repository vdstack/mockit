import { startsWith } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.startsWith", () => {
  it("should compare a string and a startsWith construct", () => {
    expect(compare("hello world", startsWith("hello"))).toBe(true);
    expect(compare("hello world", startsWith("world"))).toBe(false);
  });

  it("should compare a string and a startsWith construct deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(compare(actual, { x: { y: { z: startsWith("hello") } } })).toBe(
      true
    );
  });
});

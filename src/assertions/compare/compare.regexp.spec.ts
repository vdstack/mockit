import { stringMatching } from "../../behaviours/matchers";
import { compare } from "./compare";

describe("compare.stringMatching", () => {
  // TODO: get feedback: should I add a stringMatchesRegex matcher or keep the direct detection?
  it("should compare a string and a regex", () => {
    expect(compare("hello world", stringMatching(/world/))).toBe(true);
    expect(compare("hello world", stringMatching(/hello/))).toBe(true);
    expect(compare("hello world", stringMatching(/aaa/))).toBe(false);
  });

  it("should work deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(
      compare(actual, {
        x: { y: { z: stringMatching(/world/) } },
      })
    ).toBe(true);
    expect(
      compare(actual, {
        x: { y: { z: stringMatching(/hello/) } },
      })
    ).toBe(true);
    expect(compare(actual, { x: { y: { z: stringMatching(/aaa/) } } })).toBe(
      false
    );
  });
});

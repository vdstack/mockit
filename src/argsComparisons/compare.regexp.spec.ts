import { matchers } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.stringMatchingRegex", () => {
  // TODO: get feedback: should I add a stringMatchesRegex matcher or keep the direct detection?
  it("should compare a string and a regex", () => {
    expect(compare("hello world", matchers.stringMatchingRegex(/world/))).toBe(
      true
    );
    expect(compare("hello world", matchers.stringMatchingRegex(/hello/))).toBe(
      true
    );
    expect(compare("hello world", matchers.stringMatchingRegex(/aaa/))).toBe(
      false
    );
  });

  it("should work deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(
      compare(actual, {
        x: { y: { z: matchers.stringMatchingRegex(/world/) } },
      })
    ).toBe(true);
    expect(
      compare(actual, {
        x: { y: { z: matchers.stringMatchingRegex(/hello/) } },
      })
    ).toBe(true);
    expect(
      compare(actual, { x: { y: { z: matchers.stringMatchingRegex(/aaa/) } } })
    ).toBe(false);
  });
});

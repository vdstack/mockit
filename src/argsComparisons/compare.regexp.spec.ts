import { stringMatchingRegex } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.stringMatchingRegex", () => {
  // TODO: get feedback: should I add a stringMatchesRegex matcher or keep the direct detection?
  it("should compare a string and a regex", () => {
    expect(compare("hello world", stringMatchingRegex(/world/))).toBe(
      true
    );
    expect(compare("hello world", stringMatchingRegex(/hello/))).toBe(
      true
    );
    expect(compare("hello world", stringMatchingRegex(/aaa/))).toBe(
      false
    );
  });

  it("should work deep", () => {
    const actual = {
      x: { y: { z: "hello world" } },
    };

    expect(
      compare(actual, {
        x: { y: { z: stringMatchingRegex(/world/) } },
      })
    ).toBe(true);
    expect(
      compare(actual, {
        x: { y: { z: stringMatchingRegex(/hello/) } },
      })
    ).toBe(true);
    expect(
      compare(actual, { x: { y: { z: stringMatchingRegex(/aaa/) } } })
    ).toBe(false);
  });
});

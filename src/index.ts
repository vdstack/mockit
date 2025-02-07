export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

import { Mock } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import * as verifications from "./assertions";
import { when } from "./behaviours";
import { compare } from "./argsComparisons/compare";

class Assertion<T> {
  constructor(private readonly actual: T) {}

  equals(expected: T): void {
    if (!compare(this.actual, expected)) {
      throw new Error(
        `Expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(
          expected
        )}`
      );
    }
  }
}

export const m = {
  ...matchers,
  ...resets,
  ...verifications,
  when,
  Mock,
  assert: <T>(actual: T) => new Assertion(actual),
};

m.assert({
  x: 1,
  y: {
    z: [1, 2, 3],
    w: "Hellaw",
  },
}).equals(
  m.objectContaining({
    x: 1,
    y: {
      w: m.anyString(),
    },
  })
);

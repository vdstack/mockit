import { m } from "..";
import { compare } from "../argsComparisons/compare";

export class Assertion<T> {
  private error: unknown;
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

  toEqual(expected: T): void {
    if (typeof this.actual === "function") {
      try {
        return this.equals(this.actual());
      } catch (err) {
        this.error = err;
      }
    }

    return this.equals(expected);
  }

  toThrow() {
    if (typeof this.actual !== "function") {
      throw new Error(
        "Expected a function to throw: you did not provide a function"
      );
    }

    let didThrow = false;
    let result: unknown;
    try {
      result = this.actual();
    } catch (err) {
      didThrow = true;
    }

    if (!didThrow) {
      throw new Error(
        `Expected a function to throw: the function did not throw but returned: ${JSON.stringify(
          result
        )}`
      );
    }

    return this;
  }

  toContain(expected: T extends Array<infer U> ? U : Partial<T>): void {
    if (Array.isArray(this.actual)) {
      if (!compare(this.actual, m.arrayContaining([expected]))) {
        throw new Error(
          `Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(
            expected
          )}`
        );
      }
    } else if (typeof this.actual === "object") {
      if (!compare(this.actual, m.objectContaining(expected))) {
        throw new Error(
          `Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(
            expected
          )}`
        );
      }
    } else {
      throw new Error(`Expected ${JSON.stringify(this.actual)} to be an array`);
    }
  }

  // toContainDeep(expected: T): void {
  //   let wrapped: unknown;
  //   if (Array.isArray(expected)) {
  //     wrapped = m.arrayContainingDeep(expected);
  //   }

  //   if (typeof expected === "object") {
  //     wrapped = m.objectContainingDeep(expected);
  //   }

  //   if (!wrapped) {
  //     throw new Error(
  //       `Expected ${JSON.stringify(expected)} to be an array or an object`
  //     );
  //   }

  //   if (!compare(this.actual, wrapped)) {
  //     throw new Error(
  //       `Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(
  //         expected
  //       )}`
  //     );
  //   }
  // }
}

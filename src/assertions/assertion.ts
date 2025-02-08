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

    try {
      const result = this.actual();
      throw new Error(
        `Expected a function to throw: the function did not throw but returned: ${JSON.stringify(
          result
        )}`
      );
    } catch (err) {
      this.error = err;
    }

    return this;
  }
}

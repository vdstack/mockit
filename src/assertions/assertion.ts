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

  toThrow(expectedError?: unknown) {
    if (typeof this.actual !== "function") {
      throw new Error(
        "Expected a function to throw: you did not provide a function"
      );
    }

    let didThrow = false;
    let result: unknown;
    let err: unknown;
    try {
      result = this.actual();
    } catch (e) {
      didThrow = true;
      err = e;
    }

    if (!didThrow) {
      throw new Error(
        `Expected the function to throw error matching ${JSON.stringify(
          expectedError
        )}, but it returned: ${JSON.stringify(result)}`
      );
    }

    // arguments.length > 0 is better because expectedError could have undefined value.
    // toThrow() => arguments.length === 0
    // toThrow(undefined) => arguments.length === 1
    if (arguments.length > 0) {
      if (!compare(err, expectedError)) {
        throw new Error(
          `Expected a function to throw: the function threw ${JSON.stringify(
            err
          )} but expected ${JSON.stringify(expectedError)}`
        );
      }
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

  async toResolve(
    expected?: T extends Promise<infer U>
      ? U
      : T extends (...args: any[]) => Promise<infer U>
      ? U
      : T
  ): Promise<void> {
    let result: unknown;

    if (isPromise(this.actual)) {
      result = await this.actual;
    } else if (typeof this.actual === "function") {
      result = await this.actual();
    } else {
      throw new Error("Expected a function or a promise");
    }

    if (arguments.length > 0) {
      if (!compare(result, expected)) {
        throw new Error(
          `Expected ${JSON.stringify(result)} to equal ${JSON.stringify(
            expected
          )}`
        );
      }
    }
  }

  async toReject<R = unknown>(expectedRejection?: R): Promise<Assertion<T>> {
    let didReject = false;
    let caughtRejection: unknown;
    let actualType: "promise" | "function" | "unknown" = "unknown"; // Track the type

    if (isPromise(this.actual)) {
      actualType = "promise";
      try {
        await this.actual;
      } catch (err) {
        didReject = true;
        caughtRejection = err;
      }
    } else if (typeof this.actual === "function") {
      actualType = "function";
      try {
        await this.actual();
      } catch (err) {
        didReject = true;
        caughtRejection = err;
      }
    } else {
      throw new Error("Expected a function or a promise for .toReject()");
    }

    if (!didReject) {
      const typeDescription =
        actualType === "promise"
          ? "promise"
          : actualType === "function"
          ? "function returning a promise"
          : "value";
      throw new Error(
        `Expected a ${typeDescription} to reject, but it resolved.`
      );
    }

    if (arguments.length > 0) {
      if (!compare(caughtRejection, expectedRejection)) {
        throw new Error(
          `Expected promise to reject with value matching ${JSON.stringify(
            expectedRejection
          )}, but it rejected with ${JSON.stringify(caughtRejection)}`
        );
      }
    }

    return this;
  }
}

function isPromise(value: unknown): value is Promise<unknown> {
  return typeof value === "object" && value !== null && "then" in value;
}

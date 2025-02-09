import { Assertion } from "./assertion";

describe("Assertion.toThrow", () => {
  it("throws an error if the actual value is not a function", () => {
    expect(() => {
      // Pass a non-function value
      new Assertion(123).toThrow();
    }).toThrow("Expected a function to throw: you did not provide a function");
  });

  it("throws an error if the function does not throw", () => {
    const fnThatReturns = () => 42;
    const expectedError = "Some error message";
    expect(() => {
      new Assertion(fnThatReturns).toThrow(expectedError);
    }).toThrow(/Expected the function to throw error matching/);
  });

  it("passes when the function throws and no expected error is provided", () => {
    const errorFn = () => {
      throw new Error("oops");
    };

    // The assertion should not throw.
    expect(() => {
      const assertion = new Assertion(errorFn).toThrow();
      expect(assertion).toBeInstanceOf(Assertion);
    }).not.toThrow();
  });

  it("throws an error if the thrown error does not match the expected error", () => {
    // Throw a string error
    const errorFn = () => {
      throw "oops";
    };
    const expectedError = "not oops";
    expect(() => {
      new Assertion(errorFn).toThrow(expectedError);
    }).toThrow(/the function threw "oops" but expected "not oops"/);
  });

  it("passes when the thrown error matches the expected error", () => {
    // Throw a string error
    const errorFn = () => {
      throw "oops";
    };
    const expectedError = "oops";
    expect(() => {
      new Assertion(errorFn).toThrow(expectedError);
    }).not.toThrow();
  });

  it("handles undefined expected error correctly", () => {
    // Case 1: No argument provided (arguments.length === 0)
    const throwUndefined = () => {
      throw undefined;
    };
    expect(() => {
      new Assertion(throwUndefined).toThrow();
    }).not.toThrow();

    // Case 2: undefined is explicitly passed (arguments.length > 0)
    expect(() => {
      new Assertion(throwUndefined).toThrow(undefined);
    }).not.toThrow();

    // Case 3: function throws a value that is not undefined when undefined is expected
    const throwError = () => {
      throw "error";
    };
    expect(() => {
      new Assertion(throwError).toThrow(undefined);
    }).toThrow(/the function threw "error" but expected undefined/);
  });
});

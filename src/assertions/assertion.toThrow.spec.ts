import { Assertion } from "./assertion";

describe("Assertion.toThrow", () => {
  describe("basic functionality", () => {
    it("should pass when function throws", () => {
      const throwingFn = () => {
        throw new Error("test error");
      };

      // This should not throw
      new Assertion(throwingFn).toThrow();
    });

    it("should fail when function does not throw", () => {
      const nonThrowingFn = () => "some result";

      let didThrow = false;
      try {
        new Assertion(nonThrowingFn).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            'Expected a function to throw: the function did not throw but returned: "some result"'
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }
    });

    it("should fail when not given a function", () => {
      let didThrow = false;
      try {
        new Assertion("not a function").toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            "Expected a function to throw: you did not provide a function"
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }
    });
  });

  describe("error handling", () => {
    it("should handle different error types", () => {
      const typeErrorFn = () => {
        throw new TypeError("type error");
      };

      // This should not throw
      new Assertion(typeErrorFn).toThrow();

      const customErrorFn = () => {
        throw { custom: "error" };
      };

      // This should not throw
      new Assertion(customErrorFn).toThrow();
    });

    it("should handle functions returning different values", () => {
      const returnUndefined = () => undefined;
      let didThrow = false;
      try {
        new Assertion(returnUndefined).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            "Expected a function to throw: the function did not throw but returned: undefined"
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }

      const returnNull = () => null;
      didThrow = false;
      try {
        new Assertion(returnNull).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            "Expected a function to throw: the function did not throw but returned: null"
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }

      const returnObject = () => ({ test: "value" });
      didThrow = false;
      try {
        new Assertion(returnObject).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            'Expected a function to throw: the function did not throw but returned: {"test":"value"}'
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle undefined input", () => {
      let didThrow = false;
      try {
        new Assertion(undefined).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            "Expected a function to throw: you did not provide a function"
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }
    });

    it("should handle null input", () => {
      let didThrow = false;
      try {
        new Assertion(null).toThrow();
      } catch (error) {
        didThrow = true;
        if (error instanceof Error) {
          new Assertion(error.message).equals(
            "Expected a function to throw: you did not provide a function"
          );
        }
      }

      if (!didThrow) {
        throw new Error("Expected assertion to throw but it did not");
      }
    });
  });
});

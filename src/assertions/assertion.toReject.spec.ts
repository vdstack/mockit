/** import { Assertion } from "./assertion";
import { m } from "..";

describe("Assertion.toReject", () => {
  describe("with promise-returning functions", () => {
    it("should pass when function rejects with expected error", async () => {
      const fn = async () => {
        throw new Error("test error");
      };
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toReject(new Error("test error"));
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should fail when function rejects with different error", async () => {
      const fn = async () => {
        throw new Error("actual error");
      };
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toReject(new Error("expected error"));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should fail when function resolves instead of rejects", async () => {
      const fn = async () => "success";
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toReject(new Error("expected error"));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should work with matchers", async () => {
      const fn = async () => {
        throw new Error("CUSTOM_ERROR_CODE");
      };
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toReject(
          m.objectContaining({ message: m.stringMatching(/custom_error/i) })
        );
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });
  });

  describe("with direct promises", () => {
    it("should pass when promise rejects with expected error", async () => {
      const promise = Promise.reject(new Error("test error"));
      let didThrow = false;
      try {
        await new Assertion(promise).toReject(new Error("test error"));
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should fail when promise rejects with different error", async () => {
      const promise = Promise.reject(new Error("actual error"));
      let didThrow = false;
      try {
        await new Assertion(promise).toReject(new Error("expected error"));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should fail when promise resolves instead of rejects", async () => {
      const promise = Promise.resolve("success");
      let didThrow = false;
      try {
        await new Assertion(promise).toReject(new Error("expected error"));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should work with complex error objects", async () => {
      const customError = {
        code: "CUSTOM_ERROR",
        message: "Something went wrong",
        details: { field: "username" },
      };
      const promise = Promise.reject(customError);
      let didThrow = false;
      try {
        await new Assertion(promise).toReject(
          m.objectContaining({
            code: "CUSTOM_ERROR",
            details: m.objectContaining({ field: "username" }),
          })
        );
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });
  });

  describe("error cases", () => {
    it("should throw when given a non-function, non-promise value", async () => {
      const nonFunction = "not a function";
      let didThrow = false;
      let errorMessage = "";
      try {
        await new Assertion(nonFunction).toReject(new Error("anything"));
      } catch (err) {
        didThrow = true;
        errorMessage = (err as Error).message;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
      if (errorMessage !== "Expected a function or a promise") {
        throw new Error(
          `Expected error message "Expected a function or a promise" but got "${errorMessage}"`
        );
      }
    });

    it("should fail when function throws synchronously", async () => {
      const fn = () => {
        throw new Error("sync error");
      };
      let didThrow = false;
      try {
        await new Assertion(fn).toReject(new Error("sync error"));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });
  });
});

**/

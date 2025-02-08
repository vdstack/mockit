/** import { Assertion } from "./assertion";
import { m } from "..";

describe("Assertion.toResolve", () => {
  describe("with promise-returning functions", () => {
    it("should pass when function resolves to expected value", async () => {
      const fn = async () => "hello";
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toResolve("hello");
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should fail when function resolves to different value", async () => {
      const fn = async () => "hello";
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toResolve("world");
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should work with matchers", async () => {
      const fn = async () => "HELLO_WORLD";
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toResolve(
          m.stringMatching(/hello_world/i)
        );
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should fail with non-matching matchers", async () => {
      const fn = async () => "HELLO_WORLD";
      let didThrow = false;
      try {
        await new Assertion(() => fn()).toResolve(m.stringMatching(/goodbye/i));
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });
  });

  describe("with direct promises", () => {
    it("should pass when promise resolves to expected value", async () => {
      const promise = Promise.resolve("hello");
      let didThrow = false;
      try {
        await new Assertion(promise).toResolve("hello");
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should fail when promise resolves to different value", async () => {
      const promise = Promise.resolve("hello");
      let didThrow = false;
      try {
        await new Assertion(promise).toResolve("world");
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should work with matchers", async () => {
      const promise = Promise.resolve("HELLO_WORLD");
      let didThrow = false;
      try {
        await new Assertion(promise).toResolve(
          m.stringMatching(/hello_world/i)
        );
      } catch (err) {
        didThrow = true;
      }
      if (didThrow) {
        throw new Error("Expected assertion to pass but it failed");
      }
    });

    it("should work with complex objects", async () => {
      const promise = Promise.resolve({ name: "John", age: 30 });
      let didThrow = false;
      try {
        await new Assertion(promise).toResolve(
          m.objectContaining({ name: "John" })
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
      const nonFunction: () => Promise<string> = "not a function" as any;
      let didThrow = false;
      let errorMessage = "";
      try {
        await new Assertion(nonFunction).toResolve("anything");
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

    it("should fail when promise rejects", async () => {
      const promise: Promise<string> = Promise.reject(new Error("Failed"));
      let didThrow = false;
      try {
        await new Assertion(promise).toResolve("anything");
      } catch (err) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error("Expected assertion to fail but it passed");
      }
    });

    it("should fail when function throws", async () => {
      const fn = () => {
        throw new Error("Failed");
      };
      let didThrow = false;
      try {
        await new Assertion(fn).toResolve("anything");
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

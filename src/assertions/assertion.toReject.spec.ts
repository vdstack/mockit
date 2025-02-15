import { Assertion } from "./assertion";

describe("Assertion.toReject", () => {
  it("throws an error if actual is neither a promise nor a function", async () => {
    await expect(new Assertion(123).toReject()).rejects.toThrow(
      "Expected a function or a promise for .toReject()"
    );
  });

  it("throws an error if a promise resolves (does not reject)", async () => {
    const promiseThatResolves = Promise.resolve("resolved value");
    await expect(new Assertion(promiseThatResolves).toReject()).rejects.toThrow(
      "Expected a promise to reject, but it resolved."
    );
  });

  it("throws an error if a function returning a promise resolves (does not reject)", async () => {
    const fnThatResolves = () => Promise.resolve("resolved value");
    await expect(new Assertion(fnThatResolves).toReject()).rejects.toThrow(
      "Expected a function returning a promise to reject, but it resolved."
    );
  });

  it("passes when a promise rejects without an expected rejection value", async () => {
    const promiseThatRejects = Promise.reject("error");
    // The rejection is caught inside the toReject method, so this should pass.
    const assertion = await new Assertion(promiseThatRejects).toReject();
    expect(assertion).toBeInstanceOf(Assertion);
  });

  it("passes when a function returning a promise rejects without an expected rejection value", async () => {
    const fnThatRejects = () => Promise.reject("error");
    const assertion = await new Assertion(fnThatRejects).toReject();
    expect(assertion).toBeInstanceOf(Assertion);
  });

  it("passes when a promise rejects with a matching expected value", async () => {
    const rejectionValue = { code: 500, message: "Server error" };
    const promiseThatRejects = Promise.reject(rejectionValue);
    const assertion = await new Assertion(promiseThatRejects).toReject(
      rejectionValue
    );
    expect(assertion).toBeInstanceOf(Assertion);
  });

  it("passes when a function returning a promise rejects with a matching expected value", async () => {
    const rejectionValue = "fail";
    const fnThatRejects = () => Promise.reject(rejectionValue);
    const assertion = await new Assertion(fnThatRejects).toReject(
      rejectionValue
    );
    expect(assertion).toBeInstanceOf(Assertion);
  });

  it("throws an error if the promise rejects with a non-matching value when an expected value is provided", async () => {
    const promiseThatRejects = Promise.reject("actual error");
    const expectedRejection = "expected error";
    await expect(
      new Assertion(promiseThatRejects).toReject(expectedRejection)
    ).rejects.toThrow(
      new RegExp(
        `Expected promise to reject with value matching ${JSON.stringify(
          expectedRejection
        )}, but it rejected with ${JSON.stringify("actual error")}`
      )
    );
  });

  it("throws an error if a function returning a promise rejects with a non-matching value when an expected value is provided", async () => {
    const fnThatRejects = () => Promise.reject(123);
    const expectedRejection = 456;
    await expect(
      new Assertion(fnThatRejects).toReject(expectedRejection)
    ).rejects.toThrow(
      new RegExp(
        `Expected promise to reject with value matching ${JSON.stringify(
          expectedRejection
        )}, but it rejected with ${JSON.stringify(123)}`
      )
    );
  });

  it("handles explicit undefined as the expected rejection correctly", async () => {
    // Case 1: Function rejects with undefined and expected rejection is explicitly undefined.
    const fnRejectsUndefined = () => Promise.reject(undefined);
    await expect(
      new Assertion(fnRejectsUndefined).toReject(undefined)
    ).resolves.toBeInstanceOf(Assertion);

    // Case 2: Function rejects with a defined value but expected rejection is explicitly undefined.
    const fnRejectsError = () => Promise.reject("error");
    await expect(
      new Assertion(fnRejectsError).toReject(undefined)
    ).rejects.toThrow(
      new RegExp(
        `Expected promise to reject with value matching ${JSON.stringify(
          undefined
        )}, but it rejected with ${JSON.stringify("error")}`
      )
    );
  });
});

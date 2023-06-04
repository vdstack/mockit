import { z } from "zod";

import { mockFunction } from "../../mockit";
import { verifyThat } from "../../suppose/verifyThat";

function hello(..._args: any[]) {}

describe("Verify that", () => {
  it("should be able to verify how many times a mock was called", () => {
    const mockedFunction = mockFunction(hello);
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.twice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.thrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.nTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled.once();
    verifyThat(mockedFunction).wasCalled.atLeastOnce();
    verifyThat(mockedFunction).wasCalledOnce();
    verifyThat(mockedFunction).wasCalled.nTimes(1);
    expect(() => verifyThat(mockedFunction).wasCalled.twice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.thrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.nTimes(2)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled.twice();
    verifyThat(mockedFunction).wasCalled.atLeastOnce();
    verifyThat(mockedFunction).wasCalled.nTimes(2);
    verifyThat(mockedFunction).wasCalledTwice();
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.thrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.nTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled.thrice();
    verifyThat(mockedFunction).wasCalled.atLeastOnce();
    verifyThat(mockedFunction).wasCalled.nTimes(3);
    verifyThat(mockedFunction).wasCalledThrice();
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.twice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.nTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled.nTimes(4);
    verifyThat(mockedFunction).wasCalled.atLeastOnce();
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.twice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalled.thrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();
  });

  it("should allow to track calls with specific arguments", () => {
    const mockedFunction = mockFunction(hello);
    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello")
    ).toThrow();

    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledTwiceWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasCalledTwiceWith("hello")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello", "world")
    ).toThrow();
  });

  it("should works with safe version as well", () => {
    function hiii(a: string, b: number) {}
    const mockedFunction = mockFunction(hiii);
    mockedFunction("hello", 2222);
    verifyThat(mockedFunction).wasCalledOnceWithSafe("hello", 2222);
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWithSafe("hello", 99999)
    ).toThrow();

    mockedFunction("hello", 2222);
    verifyThat(mockedFunction).wasCalledTwiceWithSafe("hello", 2222);
    expect(() =>
      verifyThat(mockedFunction).wasCalledTwiceWithSafe("hello", 99999)
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWithSafe("hello", 2222)
    ).toThrow();
  });

  it("should work with zod", () => {
    const mockedFunction = mockFunction(hello);
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string())
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string())
    ).toThrow();

    mockedFunction();
    mockedFunction("hello", "world");

    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string())
    ).toThrow();
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());
    verifyThat(mockedFunction).wasCalledOnceWith(z.any(), z.any());
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(
        z.any(),
        z.string(),
        z.number()
      )
    ).toThrow();
  });
});

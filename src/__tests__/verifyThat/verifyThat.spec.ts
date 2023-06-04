import { z } from "zod";

import { mockFunction, verifyThat } from "../../mockit";

function hello(..._args: any[]) {}

describe("Verify that", () => {
  it("should be able to verify how many times a mock was called", () => {
    const mockedFunction = mockFunction(hello);
    verifyThat(mockedFunction).wasCalledNTimes(0);
    verifyThat(mockedFunction).wasNeverCalled();
    expect(() => verifyThat(mockedFunction).wasCalled()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled();
    verifyThat(mockedFunction).wasCalledOnce();
    verifyThat(mockedFunction).wasCalledNTimes(1);
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(2)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled();
    verifyThat(mockedFunction).wasCalledTwice();
    verifyThat(mockedFunction).wasCalledNTimes(2);
    verifyThat(mockedFunction).wasCalledTwice();
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled();
    verifyThat(mockedFunction).wasCalledThrice();
    verifyThat(mockedFunction).wasCalledNTimes(3);
    verifyThat(mockedFunction).wasCalledThrice();
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled();
    verifyThat(mockedFunction).wasCalledNTimes(4);
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
    expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();
  });

  it("should allow to track calls with specific arguments", () => {
    const mockedFunction = mockFunction(hello);
    verifyThat(mockedFunction).wasNeverCalledWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasCalledWith("hello", "world")
    ).toThrow();
    mockedFunction("hello", "world");

    verifyThat(mockedFunction).wasCalledWith("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasNeverCalledWith("hello", "world")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello")
    ).toThrow();

    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledWith("hello", "world");
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
    verifyThat(mockedFunction).wasCalledWithSafe("hello", 2222);
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWithSafe("hello", 99999)
    ).toThrow();

    mockedFunction("hello", 2222);
    verifyThat(mockedFunction).wasCalledWithSafe("hello", 2222);
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
    expect(() =>
      verifyThat(mockedFunction).wasCalledWith(z.string())
    ).toThrow();

    mockedFunction();
    mockedFunction("hello", "world");

    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string())
    ).toThrow();
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());
    verifyThat(mockedFunction).wasCalledOnceWith(z.any(), z.any());
    verifyThat(mockedFunction).wasCalledWith(z.string(), z.string());
    verifyThat(mockedFunction).wasCalledWith(z.any(), z.any());

    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(
        z.any(),
        z.string(),
        z.number()
      )
    ).toThrow();
  });
});

import { z } from "zod";
import { verifyThat, mockFunction, Reset } from "../../mockit";

describe("Reset > verifyThat", () => {
  function hello(...args: any[]) {}

  it("should be able able to reset calls count", () => {
    const mockedFunction = mockFunction(hello);
    mockedFunction();
    verifyThat(mockedFunction).wasCalled.once();
    Reset.completely(mockedFunction);
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalled.once();

    Reset.historyOf(mockedFunction);
    expect(() => verifyThat(mockedFunction).wasCalled.once()).toThrow();
  });

  it("should be able able to reset calls count for specific arguments", () => {
    const mockedFunction = mockFunction(hello);
    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());
    Reset.completely(mockedFunction);

    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello", "world")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string())
    ).toThrow();

    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());

    Reset.historyOf(mockedFunction);
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello", "world")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string())
    ).toThrow();
  });
});

import { z } from "zod";
import { verifyThat, mockFunction, Reset } from "../../mockit";

describe("Reset > verifyThat", () => {
  function hello(...args: any[]) {}

  it("should be able able to reset calls count", () => {
    const mockedFunction = mockFunction(hello);
    verifyThat(mockedFunction).wasNeverCalled();

    mockedFunction();
    verifyThat(mockedFunction).wasCalledOnce();
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();

    Reset.completely(mockedFunction);

    verifyThat(mockedFunction).wasNeverCalled();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();

    mockedFunction();
    verifyThat(mockedFunction).wasCalledOnce();
    expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();

    Reset.historyOf(mockedFunction);

    verifyThat(mockedFunction).wasNeverCalled();
    expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
  });

  it("should be able able to reset calls count for specific arguments", () => {
    const mockedFunction = mockFunction(hello);
    verifyThat(mockedFunction).wasNeverCalledWith("hello", "world");

    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());
    expect(() =>
      verifyThat(mockedFunction).wasNeverCalledWith("hello", "world")
    ).toThrow();
    expect(() => {
      verifyThat(mockedFunction).wasNeverCalledWithSafe("hello", "world");
    }).toThrow();

    Reset.completely(mockedFunction);

    verifyThat(mockedFunction).wasNeverCalledWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello", "world")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string())
    ).toThrow();

    mockedFunction("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith("hello", "world");
    verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string());
    expect(() => {
      verifyThat(mockedFunction).wasNeverCalledWithSafe("hello", "world");
    }).toThrow();

    Reset.historyOf(mockedFunction);
    verifyThat(mockedFunction).wasNeverCalledWith("hello", "world");
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith("hello", "world")
    ).toThrow();
    expect(() =>
      verifyThat(mockedFunction).wasCalledOnceWith(z.string(), z.string())
    ).toThrow();
  });
});

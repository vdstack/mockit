import { mockFunction, when } from "../..";

describe("thenThrow", () => {
  it("should throw anything you provide", () => {
    const mock = mockFunction(() => {});
    when(mock).isCalled.thenThrow("Error");

    expect(() => mock()).toThrow("Error");
  });

  it("should combine default and custom behaviours", () => {
    const mock = mockFunction((...args: any[]) => {});
    when(mock).isCalled.thenThrow("Error");
    when(mock).isCalledWith(2).thenThrow("Victor");

    expect(() => mock()).toThrow("Error");
    expect(() => mock(2)).toThrow("Victor");
  });
});

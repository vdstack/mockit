import { mockFunction, when } from "../../../v3";

describe("thenThrow", () => {
  it("should throw anything you provide", () => {
    const mock = mockFunction(() => {});
    when(mock).isCalled.thenThrow("Error");

    expect(() => mock()).toThrow("Error");
  });
});

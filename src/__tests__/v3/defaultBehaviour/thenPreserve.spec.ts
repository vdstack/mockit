import { mockFunction, when } from "../../../v3";

describe("thenPreserve", () => {
  function hello(...args: any[]) {
    return "hello world" as const;
  }

  function returnNumber() {
    return 2;
  }

  it("should return the original value", () => {
    const mock = mockFunction(returnNumber);
    when(mock).isCalled.thenPreserve();

    expect(mock()).toBe(2);
  });

  it("should return the original value", () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenPreserve();

    expect(mock()).toBe("hello world");
  });
});

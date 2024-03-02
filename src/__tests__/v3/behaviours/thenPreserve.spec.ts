import { mockFunction, when } from "../../../v3";

describe("thenPreserve", () => {
  function hello(...args: any[]) {
    return "hello world" as const;
  }

  it("should return the original value", () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenPreserve();

    expect(mock()).toBe("hello world");
  });

  it("should combine default and custom behaviours", () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenPreserve();
    when(mock)
      .isCalledWith(2)
      .thenCall(() => "Victor");

    expect(mock()).toBe("hello world");
    expect(mock(2)).toBe("Victor");
  });
});

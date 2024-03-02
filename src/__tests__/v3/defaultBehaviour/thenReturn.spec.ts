import { mockFunction, when } from "../../../v3";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber() {
  return 2;
}

describe("thenReturn", () => {
  it("should return undefined by default", () => {
    expect(mockFunction(hello)()).toBe(undefined);
  });

  it("should return the desired value", () => {
    const mock = mockFunction(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturn(999);
    expect(mock()).toBe(999);
  });
});

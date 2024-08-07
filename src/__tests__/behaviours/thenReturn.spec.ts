import { Mock, m, when } from "../..";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber(...args: any[]) {
  return 2;
}

describe("thenReturn", () => {
  it("should return undefined by default", () => {
    expect(Mock(hello)()).toBe(undefined);
  });

  it("should return the desired value", () => {
    const mock = Mock(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturn(999);
    expect(mock()).toBe(999);
  });

  it("should combine default and custom behaviours", () => {
    const mock = m.Mock(returnNumber);

    m.when(mock).isCalled.thenReturn(999);
    m.when(mock).isCalledWith(2).thenReturn(777);

    expect(mock()).toBe(999);
    expect(mock(2)).toBe(777);
  });
});

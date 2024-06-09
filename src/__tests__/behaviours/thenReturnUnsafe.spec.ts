import { Mock, when } from "../..";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber(...args: any[]) {
  return 2;
}

describe("thenReturnUnsafe", () => {
  it("should return any value you provide, even unsafe", () => {
    const mock = Mock(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturnUnsafe("Victor");
    expect(mock()).toBe("Victor");
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(returnNumber);
    when(mock).isCalled.thenReturnUnsafe("Victor");
    when(mock).isCalledWith(2).thenReturnUnsafe("Victor");
    expect(mock()).toBe("Victor");
    expect(mock(2)).toBe("Victor");
  });
});

import { Mock, when } from "../..";
import { unsafe } from "../../behaviours/matchers";

function returnNumber(...args: any[]) {
  return 2;
}

describe("thenReturn", () => {
  it("should return any value you provide, even unsafe", () => {
    const mock = Mock(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturn(unsafe("Victor"));
    expect(mock()).toBe("Victor");
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(returnNumber);
    when(mock).isCalled.thenReturn(unsafe("Victor"));
    when(mock).isCalledWith(2).thenReturn(unsafe("Victor2"));
    expect(mock()).toBe("Victor");
    expect(mock(2)).toBe("Victor2");
  });
});

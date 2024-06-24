import { Mock, when } from "../..";
import { unsafe } from "../../behaviours/constructs";

describe("thenPreserve", () => {
  function hello(...args: any[]) {
    return "hello world" as const;
  }

  it("should return the original value", () => {
    const mock = Mock(hello);
    when(mock).isCalled.thenPreserve();

    expect(mock()).toBe("hello world");
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(hello);
    when(mock).isCalled.thenPreserve();
    when(mock)
      .isCalledWith(2)
      .thenReturn(unsafe("Victor"));

    expect(mock()).toBe("hello world");
    expect(mock(2)).toBe("Victor");
  });
});

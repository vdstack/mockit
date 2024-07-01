import { when } from "../../behaviours";
import { unsafe } from "../../behaviours/matchers";
import { Mock } from "../../mocks";

describe("behaviour setup: unsafe", () => {
  it("should match like a safe value, except that it should compile with anything passed into it", () => {
    function toTest(
      a1: string,
      a2: number,
      a3: boolean,
      a4: { name: string; age: number },
      a5: string[],
      a6: Map<string, number>,
      a7: Set<string>
    ) {
      return "hello world";
    }

    const mock = Mock(toTest);
    when(mock).isCalled.thenReturn("default return value");
    when(mock)
      .isCalledWith(
        unsafe(2),
        unsafe(2),
        unsafe(2),
        unsafe(2),
        unsafe(2),
        unsafe(2),
        unsafe(2)
      )
      .thenReturn("hello world Victor");

    expect(
      mock(
        "Victor",
        20,
        true,
        { name: "Victor", age: 20 },
        ["hello", "world"],
        new Map([["hello", 1]]),
        new Set(["hello", "world"])
      )
    ).toBe("default return value");

    expect(
      mock(unsafe(2), 2, unsafe(2), unsafe(2), unsafe(2), unsafe(2), unsafe(2))
    ).toBe("hello world Victor");
  });
});

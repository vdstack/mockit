import { Reset, mockFunction, resetBehaviour, when } from "../../mockit";

describe("It should permit to reset mock behaviour without touching the call history", () => {
  function hello(...args: any[]) {
    return "world";
  }

  it("should reset default behaviour to undefined return", () => {
    expect(hello()).toBe("world");

    const mock = mockFunction(hello);
    expect(mock()).toBeUndefined();

    when(mock).isCalled.thenReturn("WORLD");
    expect(mock()).toBe("WORLD");

    resetBehaviour(mock);
    expect(mock()).toBeUndefined();
  });

  it("should reset custom behaviours to default behaviour", () => {
    const mock = mockFunction(hello);
    when(mock).isCalledWith("hello").thenReturn("hello");
    when(mock).isCalledWith("world").thenReturn("world");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");

    resetBehaviour(mock);
    expect(mock("hello")).toBeUndefined();
    expect(mock("world")).toBeUndefined();
  });

  it("should be accessible via Reset", () => {
    const mock = mockFunction(hello);
    when(mock).isCalledWith("hello").thenReturn("hello");
    when(mock).isCalledWith("world").thenReturn("world");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");

    Reset.behaviourOf(mock);
    expect(mock("hello")).toBeUndefined();
    expect(mock("world")).toBeUndefined();
  });

  it("should work for multiple mocks at once", () => {
    const mock1 = mockFunction(hello);
    const mock2 = mockFunction(hello);

    when(mock1).isCalledWith("hello").thenReturn("hello");
    when(mock2).isCalledWith("world").thenReturn("world");

    expect(mock1("hello")).toBe("hello");
    expect(mock2("world")).toBe("world");

    resetBehaviour(mock1, mock2);
    expect(mock1("hello")).toBeUndefined();
    expect(mock2("world")).toBeUndefined();
  });
});

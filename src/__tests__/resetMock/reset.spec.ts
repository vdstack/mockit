import {
  mock as mockClass,
  mockFunction,
  when,
  reset,
  spy,
  suppose,
  verify,
  mockInterface,
  mockAbstract,
} from "../../mockit";

function hello(...args: any[]) {
  return "world";
}

describe("Reset mock behaviour", () => {
  it("should reset default behaviour to undefined return", () => {
    expect(hello()).toBe("world");

    const mock = mockFunction(hello);
    expect(mock()).toBeUndefined();

    when(mock).isCalled.thenReturn("WORLD");
    expect(mock()).toBe("WORLD");

    reset(mock);
    expect(mock()).toBeUndefined();
  });

  it("should reset custom behaviours to default behaviour", () => {
    const mock = mockFunction(hello);
    when(mock).isCalledWith("hello").thenReturn("hello");
    when(mock).isCalledWith("world").thenReturn("world");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");

    reset(mock);
    expect(mock("hello")).toBeUndefined();
    expect(mock("world")).toBeUndefined();
  });

  it("should reset spies", () => {
    const mock = mockFunction(hello);
    when(mock).isCalledWith("hello").thenReturn("hello");
    when(mock).isCalledWith("world").thenReturn("world");
    const espion = spy(mock);

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");
    expect(espion.wasCalled.twice).toBe(true);
    expect(espion.wasCalledWith("hello").once).toBe(true);
    expect(espion.wasCalledWith("world").once).toBe(true);

    reset(mock);
    expect(espion.wasCalled.twice).toBe(false);
    expect(espion.wasCalledWith("hello").once).toBe(false);
    expect(espion.wasCalledWith("world").once).toBe(false);
    expect(espion.calls.length).toBe(0);
  });

  it("should reset suppositions", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith("hello").atLeastOnce();

    expect(() => verify(mock)).toThrow();
    mock("hello");
    verify(mock);

    reset(mock);
    verify(mock); // should not throw because the mock was reset
  });

  it("should accept multiple mocks", () => {
    const mock1 = mockFunction(hello);
    const mock2 = mockFunction(hello);

    when(mock1).isCalledWith("hello").thenReturn("hello");
    when(mock2).isCalledWith("world").thenReturn("world");

    expect(mock1("hello")).toBe("hello");
    expect(mock2("world")).toBe("world");

    reset(mock1, mock2);

    expect(mock1("hello")).toBeUndefined();
    expect(mock2("world")).toBeUndefined();
  });

  it("should reset class mocks", () => {
    class HelloClass {
      hello(..._args: any[]): void {}
      HELLAWORLD(..._args: any[]): void {}
    }

    const mock = mockClass(HelloClass);
    when(mock.hello).isCalledWith("hello").thenReturn("hello");
    when(mock.HELLAWORLD).isCalledWith("hello").thenReturn("hello");

    expect(mock.hello("hello")).toBe("hello");
    expect(mock.HELLAWORLD("hello")).toBe("hello");

    reset(mock);
    expect(mock.hello("hello")).toBeUndefined();
    expect(mock.HELLAWORLD("hello")).toBeUndefined();
  });

  it("should reset interface mocks", () => {
    interface HelloInterface {
      hello(..._args: any[]): void;
    }

    const mock = mockInterface<HelloInterface>("hello");
    when(mock.hello).isCalledWith("hello").thenReturn("hello");

    expect(mock.hello("hello")).toBe("hello");

    reset(mock);
    expect(mock.hello("hello")).toBeUndefined();
  });

  it("should reset abstract class mocks", () => {
    abstract class HelloAbstractClass {
      abstract hello(..._args: any[]): void;
    }

    const mock = mockAbstract(HelloAbstractClass, ["hello"]);
    when(mock.hello).isCalledWith("hello").thenReturn("hello");

    expect(mock.hello("hello")).toBe("hello");

    reset(mock);
    expect(mock.hello("hello")).toBeUndefined();
  });
});

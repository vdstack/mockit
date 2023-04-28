import { mockFunction, spy, when } from "../../mockit";

function hello(..._args: any[]): void {}

describe("Spy.reset()", () => {
  it("should reset spies while maintaining behaviour", () => {
    const mock = mockFunction(hello);
    const espion = spy(mock);

    when(mock).isCalledWith("hello").thenReturn("hello");
    when(mock).isCalledWith("world").thenReturn("world");

    expect(espion.calls.length).toEqual(0);
    expect(espion.wasCalled.once).toBe(false);

    mock("hello");
    expect(espion.calls.length).toEqual(1);
    expect(espion.wasCalled.once).toBe(true);

    espion.reset();
    expect(espion.calls.length).toEqual(0);
    expect(espion.wasCalled.once).toBe(false);
    expect(mock("hello")).toEqual("hello");
    expect(espion.calls.length).toEqual(1);
  });
});

import { verify } from "../../mockit";
import { mockFunction, spy } from "../../mockit";
import { Reset, resetCallHistory } from "../../reset";
import { suppose } from "../../suppose";

describe("It should permit to reset the call history without touching the mock behaviour", () => {
  function hello(...args: any[]) {
    return "world";
  }

  it("should reset the call history", () => {
    const mock = mockFunction(hello);
    const mSpy = spy(mock);
    mock(1);
    mock(2);
    mock(3);
    expect(mSpy.calls.length).toBe(3);
    resetCallHistory(mock);
    expect(mSpy.calls.length).toBe(0);
  });

  it("should reset the call history for multiple mocks at once", () => {
    const mock1 = mockFunction(hello);
    const mock2 = mockFunction(hello);
    const mSpy1 = spy(mock1);
    const mSpy2 = spy(mock2);
    mock1(1);
    mock2(1);
    mock1(2);
    mock2(2);
    mock1(3);
    mock2(3);
    expect(mSpy1.calls.length).toBe(3);
    expect(mSpy2.calls.length).toBe(3);
    resetCallHistory(mock1, mock2);
    expect(mSpy1.calls.length).toBe(0);
    expect(mSpy2.calls.length).toBe(0);
  });

  it("should reset the saved assertions", () => {
    const mock = mockFunction(hello);
    const mSpy = spy(mock);
    mock(1);
    mock(2);
    mock(3);
    expect(mSpy.wasCalled.thrice).toBe(true);
    resetCallHistory(mock);
    expect(mSpy.wasCalled.nTimes(0)).toBe(true);
  });

  it("should work with verification & suppositions as well", () => {
    const mock = mockFunction(hello);

    suppose(mock).willBeCalled.thrice();
    suppose(mock).willBeCalledWith(1, 2, 3).once();

    mock(1, 2, 3);
    mock();
    mock();

    verify(mock);

    resetCallHistory(mock);

    expect(() => verify(mock)).toThrow();
  });

  it("should work with Reset", () => {
    const mock = mockFunction(hello);

    suppose(mock).willBeCalled.thrice();
    suppose(mock).willBeCalledWith(1, 2, 3).once();

    mock(1, 2, 3);
    mock();
    mock();

    verify(mock);

    Reset.historyOf(mock);

    expect(() => verify(mock)).toThrow();
  });
});

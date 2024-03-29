import { mockFunction, verify } from "../../mockit";
import { Reset } from "../../reset";
import { suppose } from "../../suppose";

describe("It should permit to reset mock suppositions without touching the call history", () => {
  function hellaw(...args: any[]) {
    return "world";
  }

  it("should reset suppositions and allow to set new ones", () => {
    const mock = mockFunction(hellaw);
    suppose(mock).willBeCalled.twice();

    mock();
    mock();

    verify(mock);

    Reset.suppositionsOn(mock);

    suppose(mock).willBeCalled.thrice();
    expect(() => verify(mock)).toThrowError();

    mock();
    verify(mock);
  });

  it("should combine with resetCallHistory", () => {
    const mock = mockFunction(hellaw);
    suppose(mock).willBeCalled.twice();

    mock();
    mock();

    verify(mock);

    Reset.suppositionsOn(mock);
    Reset.historyOf(mock);

    suppose(mock).willBeCalled.once();
    expect(() => verify(mock)).toThrowError();
    mock();

    verify(mock);
  });

  it("should work with multiple mocks", () => {
    const mock1 = mockFunction(hellaw);
    const mock2 = mockFunction(hellaw);
    suppose(mock1).willBeCalled.once();
    suppose(mock2).willBeCalled.once();

    mock1();
    mock2();

    verify(mock1);
    verify(mock2);

    Reset.suppositionsOn(mock1, mock2);

    suppose(mock1).willBeCalled.once();
    suppose(mock2).willBeCalled.twice();

    verify(mock1);
    expect(() => verify(mock2)).toThrowError();
  });
});

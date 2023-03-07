import { mockFunction, suppose, verify } from "../../mockit";

function hello(...args: any[]) {}

describe("suppose chain", () => {
  test("you should be able to chain suppositions on a single mock in a single suppose call", () => {
    const mock = mockFunction(hello);
    suppose(mock)
      .willBeCalled.atLeastOnce()
      .and.willBeCalledWith(2)
      .once()
      .and.willBeCalledWith(3)
      .twice();

    mock(2);
    mock(3);

    expect(() => verify(mock)).toThrow();

    mock(3);
    verify(mock);
  });
});

import { mockFunction, when } from "../..";

let counter = 0;
function increaseCounter(by: number) {
  counter += by;
}

function multiplyCounter(by: number) {
  counter *= by;
}

describe("thenCall", () => {
  it("should execute the provided function", () => {
    counter = 0;
    const mock = mockFunction((a: number) => {});
    when(mock).isCalled.thenCall(increaseCounter);
    mock(1);

    expect(counter).toBe(1);

    mock(1);
    expect(counter).toBe(2);
  });

  it("should combine default and custom behaviours", () => {
    counter = 0;
    const mock = mockFunction((a: number) => {});
    when(mock).isCalled.thenCall(increaseCounter);
    when(mock).isCalledWith(2).thenCall(multiplyCounter);
    when(mock)
      .isCalledWithUnsafe("Victor")
      .thenCall(() => {
        counter = -5;
      });
    mock(1);
    mock(1);
    expect(counter).toBe(2);

    mock(2);

    expect(counter).toBe(4);

    // @ts-expect-error - this is an unsafety test
    mock("Victor");
    expect(counter).toBe(-5);
  });
});

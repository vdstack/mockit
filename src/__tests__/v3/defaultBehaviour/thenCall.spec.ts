import { mockFunction, when } from "../../../v3";

let counter = 0;
function increaseCounter() {
  counter += 1;
}

describe("thenCall", () => {
  it("should execute the provided function", () => {
    const mock = mockFunction(() => {});
    when(mock).isCalled.thenCall(increaseCounter);
    mock();

    expect(counter).toBe(1);

    mock();
    expect(counter).toBe(2);
  });
});

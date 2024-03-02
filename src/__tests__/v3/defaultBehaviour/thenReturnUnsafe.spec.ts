import { mockFunction, when } from "../../../v3";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber() {
  return 2;
}

describe("thenReturnUnsafe", () => {
  it("should return any value you provide, even unsafe", () => {
    const mock = mockFunction(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturnUnsafe("Victor");
    expect(mock()).toBe("Victor");
  });
});

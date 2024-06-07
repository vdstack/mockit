import { mockFunction, when } from "../..";

function hello(...args: any[]) {
  return "hello world" as const;
}

describe("thenResolveUnsafe", () => {
  it("should resolve any value provided", async () => {
    const mock = mockFunction(hello);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenResolveUnsafe("999s");
    expect(await mock()).toBe("999s");
  });

  it("should combine default and custom behaviours", async () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenResolveUnsafe("999s");
    when(mock).isCalledWith(2).thenResolveUnsafe("777s");

    expect(await mock()).toBe("999s");
    expect(await mock(2)).toBe("777s");
  });
});

import { Mock, when } from "../..";

async function hellaw(...args: any[]) {
  return 42;
}

describe("thenResolve", () => {
  it("should resolve type-safe value", async () => {
    const mock = Mock(hellaw);

    expect(await mock()).toBe(undefined);
    when(mock).isCalled.thenResolve(999);
    expect(await mock()).toBe(999);
  });

  it("should combine default and custom behaviours", async () => {
    const mock = Mock(hellaw);
    when(mock).isCalled.thenResolve(999);
    when(mock).isCalledWith(2).thenResolve(777);

    expect(await mock()).toBe(999);
    expect(await mock(2)).toBe(777);
  });
});

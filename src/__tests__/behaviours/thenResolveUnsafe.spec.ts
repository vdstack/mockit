import { Mock, when } from "../..";

function hello(...args: any[]) {
  return "hello world" as const;
}

describe("unsafe.thenResolve", () => {
  it("should resolve any value provided", async () => {
    const mock = Mock(hello);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.unsafe.thenResolve("999s");
    expect(await mock()).toBe("999s");
  });

  it("should combine default and custom behaviours", async () => {
    const mock = Mock(hello);
    when(mock).isCalled.unsafe.thenResolve("999s");
    when(mock).isCalledWith(2).unsafe.thenResolve("777s");

    expect(await mock()).toBe("999s");
    expect(await mock(2)).toBe("777s");
  });
});

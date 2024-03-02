import { mockFunction, when } from "../../../v3";

function hello() {
  return "hello world" as const;
}

describe("thenResolveUnsafe", () => {
  it("should resolve any value provided", async () => {
    const mock = mockFunction(hello);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenResolveUnsafe("999s");
    expect(await mock()).toBe("999s");
  });
});

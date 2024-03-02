import { mockFunction, when } from "../../../v3";

async function hellaw() {
  return 42;
}

describe("thenResolve", () => {
  it("should resolve type-safe value", async () => {
    const mock = mockFunction(hellaw);

    expect(await mock()).toBe(undefined);
    when(mock).isCalled.thenResolve(999);
    expect(await mock()).toBe(999);
  });
});

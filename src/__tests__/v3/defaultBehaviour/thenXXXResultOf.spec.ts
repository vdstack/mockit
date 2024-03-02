import { mockFunction, when } from "../../../v3";

async function getUserByID(id: number): Promise<Record<string, string>> {
  return { id: "1", name: "John Doe" };
}

it("thenResolveResultOf should resolve the result of a function", async () => {
  const mock = mockFunction(getUserByID);
  expect(await mock(1)).toBe(undefined);
  when(mock).isCalled.thenResolveResultOf(() => ({
    id: "2",
    name: "Jane Doe",
  }));
  expect(await mock(1)).toEqual({ id: "2", name: "Jane Doe" });
});

it("thenRejectResultOf should reject the result of a function", async () => {
  const mock = mockFunction(getUserByID);
  when(mock).isCalled.thenRejectResultOf(() => new Error("User not found"));
  await expect(mock(1)).rejects.toThrow("User not found");
});

it("thenResolveResultOf should resolve the result of a function", async () => {
  const mock = mockFunction(getUserByID);
  expect(await mock(1)).toBe(undefined);
  when(mock).isCalled.thenResolveResultOf(() => ({
    id: "2",
    name: "Jane Doe",
  }));
  expect(await mock(1)).toEqual({ id: "2", name: "Jane Doe" });
});

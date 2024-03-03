import { mockFunction, when } from "../..";

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

it("thenReturnResultOf should combine default and custom behaviours", () => {
  const mock = mockFunction((_x: number) => {});
  when(mock).isCalled.thenReturnResultOf((x: number) => {
    if (x === 1) {
      return {
        id: "2",
        name: "Jane Doe",
      };
    }

    return {
      id: "3",
      name: "Nabu",
    };
  });

  when(mock)
    .isCalledWith(2)
    .thenReturnResultOf(() => ({
      id: "4",
      name: "Victor",
    }));

  expect(mock(1)).toEqual({ id: "2", name: "Jane Doe" });
  expect(mock(2)).toEqual({ id: "4", name: "Victor" });
  expect(mock(3)).toEqual({ id: "3", name: "Nabu" });
});

test("thenRejectResultOf should combine default and custom behaviours", async () => {
  const mock = mockFunction(getUserByID);
  when(mock).isCalled.thenRejectResultOf(() => new Error("User not found"));
  when(mock)
    .isCalledWith(2)
    .thenRejectResultOf(() => new Error("Victor"));

  await expect(mock(1)).rejects.toThrow("User not found");
  await expect(mock(2)).rejects.toThrow("Victor");
});

test("thenResolveResultOf should resolve the result of a function", async () => {
  const mock = mockFunction(getUserByID);
  expect(await mock(1)).toBe(undefined);
  when(mock).isCalled.thenResolveResultOf(() => ({
    id: "2",
    name: "Jane Doe",
  }));
  expect(await mock(1)).toEqual({ id: "2", name: "Jane Doe" });
});

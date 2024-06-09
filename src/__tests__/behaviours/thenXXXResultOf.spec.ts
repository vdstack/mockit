import { Mock, when } from "../..";

async function getUserByID(id: number): Promise<Record<string, string>> {
  return { id: "1", name: "John Doe" };
}

test("thenBehaveLike should plug custom behaviour", () => {
  const mock = Mock(getUserByID);
  let callsCount = 0;
  when(mock).isCalled.thenBehaveLike((id) => {
    callsCount++;
    if (callsCount === 4) {
      throw new Error("User not found");
    }

    return { id: id.toString(), name: "Nabu" };
  });

  expect(mock(1)).toEqual({ id: "1", name: "Nabu" });
  expect(mock(2)).toEqual({ id: "2", name: "Nabu" });
  expect(mock(3)).toEqual({ id: "3", name: "Nabu" });
  expect(() => mock(4)).toThrow("User not found");
});

test("thenBehaviour should plug async custom behaviour", async () => {
  const mock = Mock(getUserByID);
  let callsCount = 0;
  when(mock).isCalled.thenBehaveLike(async (id) => {
    callsCount++;
    if (callsCount === 4) {
      throw new Error("User not found");
    }

    return { id: id.toString(), name: "Nabu" };
  });

  expect(await mock(1)).toEqual({ id: "1", name: "Nabu" });
  expect(await mock(2)).toEqual({ id: "2", name: "Nabu" });
  expect(await mock(3)).toEqual({ id: "3", name: "Nabu" });
  await expect(mock(4)).rejects.toThrow("User not found");
});

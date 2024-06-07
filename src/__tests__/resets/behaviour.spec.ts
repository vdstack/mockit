import { z } from "zod";
import { Reset, mockFunction, when } from "../..";

function add(a: number, b: number): number {
  return a + b;
}

test("resetBehaviour should reset all behaviours", () => {
  const mockAdd = mockFunction(add);

  // default
  when(mockAdd).isCalled.thenReturn(999);

  // custom
  when(mockAdd).isCalledWith(1, 2).thenReturn(12);

  // zod-based
  when(mockAdd).zod.isCalledWith(z.number().int().negative(), 2).thenReturn(22);

  expect(mockAdd(1, 2)).toBe(12);
  expect(mockAdd(3, 2)).toBe(999);
  expect(mockAdd(-1, 2)).toBe(22);

  Reset.behaviourOf(mockAdd);

  expect(mockAdd(1, 2)).toBe(undefined);
  expect(mockAdd(3, 2)).toBe(undefined);
  expect(mockAdd(-1, 2)).toBe(undefined);
});

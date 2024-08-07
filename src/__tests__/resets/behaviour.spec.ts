import { z } from "zod";
import { m, Mock, when } from "../..";
import { resetBehaviourOf } from "../../mocks/mockFunction.reset";

function add(a: number, b: number): number {
  return a + b;
}

test("resetBehaviourOf should reset all behaviours", () => {
  const mockAdd = Mock(add);

  // default
  when(mockAdd).isCalled.thenReturn(999);

  // custom
  when(mockAdd).isCalledWith(1, 2).thenReturn(12);

  // zod-based

  when(mockAdd)
    .isCalledWith(m.validates(z.number().int().negative()), 2)
    .thenReturn(22);

  expect(mockAdd(1, 2)).toBe(12);
  expect(mockAdd(3, 3)).toBe(999);
  expect(mockAdd(-1, 2)).toBe(22);

  resetBehaviourOf(mockAdd);

  expect(mockAdd(1, 2)).toBe(undefined);
  expect(mockAdd(3, 2)).toBe(undefined);
  expect(mockAdd(-1, 2)).toBe(undefined);
});

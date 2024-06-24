import { z } from "zod";
import { Reset, Mock, when, verifyThat } from "../..";
import { schema } from "../../behaviours/constructs";

function add(a: number, b: number): number {
  return a + b;
}

test("resetCompletely should reset all behaviours and history", () => {
  const mockAdd = Mock(add);

  // default
  when(mockAdd).isCalled.thenReturn(999);

  // custom
  when(mockAdd).isCalledWith(1, 2).thenReturn(12);

  // zod-based
  when(mockAdd).isCalledWith(schema(z.number().int().negative()), 2).thenReturn(22);

  expect(mockAdd(1, 2)).toBe(12);
  expect(mockAdd(3, 2)).toBe(999);
  expect(mockAdd(-1, 2)).toBe(22);

  verifyThat(mockAdd).wasCalled();
  verifyThat(mockAdd).wasCalledWith(1, 2);
  verifyThat(mockAdd).wasCalledWith(3, 2);
  verifyThat(mockAdd).wasCalledWith(-1, 2);
  verifyThat(mockAdd).wasCalledNTimes(3);

  Reset.completely(mockAdd);

  verifyThat(mockAdd).wasNeverCalled();

  expect(mockAdd(1, 2)).toBe(undefined);
  expect(mockAdd(3, 2)).toBe(undefined);
  expect(mockAdd(-1, 2)).toBe(undefined);
});

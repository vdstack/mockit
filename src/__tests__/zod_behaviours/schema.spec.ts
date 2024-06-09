/**
 * This file is used to test the new v3 feature of mockit: the ability to setup behaviours
 * based on arguments that would match a zod schema, instead of using custom behaviour based on
 * exact arguments.
 *
 * There is still a need to think about what the priority is for the behaviours:
 * If a set of argument matches both a zod schema and an exact value setup, should we execute
 * the behaviour matching the zod schema or the exact value?
 *
 * For example:
 * function hello(x: number, y: string) {}
 *
 * const mock = Mock(hello);
 *
 * when(mock).calledWith(1, "hello").thenReturn("world");
 * when(mock).calledWith(z.number(), z.string()).thenReturn("zod");
 *
 * hello(1, "hello"); // what should be the return value?
 *
 * For this iteration I decided to give priority to the exact value setup, but I'm open to
 * suggestions.
 */

import { Mock, when } from "../..";

import { z } from "zod";

test("mock should accept zod schemas as arguments", () => {
  const mock = Mock((x: number, y: string) => {
    return y;
  });

  when(mock).zod.isCalledWith(1, z.string()).thenReturn("world");
  when(mock).zod.isCalledWith(z.number(), "hello").thenReturn("zod");
  when(mock).isCalled.thenReturnUnsafe("default");

  expect(mock(1, "hello")).toBe("world");
  expect(mock(2, "hello")).toBe("zod");

  // @ts-expect-error
  expect(mock()).toBe("default");
});

test("complex zod schema", () => {
  function toTest(x: Record<string, unknown>) {
    return x;
  }

  const mock = Mock(toTest);

  when(mock)
    .zod.isCalledWith(
      z.object({
        x: z.number(),
        y: z.string(),
        z: z.object({
          a: z.string(),
        }),
        w: z.array(z.number()),
        r: z.enum(["a", "b", "c"]),
      })
    )
    .thenReturn({ x: 1, y: "hello" });

  when(mock).isCalled.thenReturn({ default: true });

  expect(
    mock({ x: 1, y: "hello", z: { a: "world" }, w: [1, 2, 3], r: "a" })
  ).toEqual({ x: 1, y: "hello" });

  // "invalid" because we switched a number for "Victor" in the array
  expect(
    mock({ x: 1, y: "hello", z: { a: "world" }, w: [1, 2, "Victor"], r: "b" })
  ).toEqual({ default: true });
});

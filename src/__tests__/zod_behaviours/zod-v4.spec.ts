/**
 * Zod v4 no longer exports ZodSchema, so mockit must detect schemas structurally
 * (anything with a safeParse method) rather than with `instanceof ZodSchema`.
 */

import { z } from "zod-v4";
import { z as z3 } from "zod";
import { m, Mock, verifyThat, when } from "../..";
import { unsafe } from "../../behaviours/matchers";

function hello(x: number, y: string) {
  return y;
}

test("m.validates should accept zod v4 schemas in behaviours", () => {
  const mock = Mock(hello);

  when(mock).isCalledWith(1, m.validates(z.string())).thenReturn("world");
  when(mock).isCalledWith(m.validates(z.number()), "hello").thenReturn("zod");
  when(mock).isCalled.thenReturn(unsafe("default"));

  expect(mock(1, "hello")).toBe("world");
  expect(mock(2, "hello")).toBe("zod");
  expect(mock(unsafe("2"), unsafe(3))).toBe("default");
});

test("m.validates should accept zod v4 schemas in assertions", () => {
  const mock = Mock(hello);

  verifyThat(mock).wasNeverCalledWith(
    m.validates(z.number().int().positive()),
    m.validates(z.string())
  );

  mock(1, "hello");

  verifyThat(mock).wasCalledOnceWith(
    m.validates(z.number().int().positive()),
    m.validates(z.string())
  );
  verifyThat(mock).wasNeverCalledWith(
    m.validates(z.number().negative()),
    m.validates(z.string())
  );
});

test("m.validates should accept zod v4 schemas nested in other matchers", () => {
  const mock = Mock((x: { id: number; name: string }) => x.name);

  when(mock)
    .isCalledWith(m.objectContaining({ id: m.validates(z.number().positive()) }))
    .thenReturn("positive");
  when(mock).isCalled.thenReturn("other");

  expect(mock({ id: 1, name: "a" })).toBe("positive");
  expect(mock({ id: -1, name: "a" })).toBe("other");
});

test("zod v3 and v4 schemas can be mixed", () => {
  const mock = Mock(hello);

  when(mock)
    .isCalledWith(m.validates(z3.number()), m.validates(z.string()))
    .thenReturn("mixed");

  expect(mock(1, "a")).toBe("mixed");
});

test("m.validates should still treat functions as validation functions", () => {
  const mock = Mock(hello);

  when(mock)
    .isCalledWith(m.validates((x: number) => x > 0), "a")
    .thenReturn("positive");
  when(mock).isCalled.thenReturn("other");

  expect(mock(1, "a")).toBe("positive");
  expect(mock(-1, "a")).toBe("other");
});

import { randomUUID } from "crypto";
import { z } from "zod";

import { unsafe } from "../../behaviours/matchers";
import { when } from "../../behaviours";
import { Mock, resetCompletely } from "../../mocks";
import { m } from "../..";

test("test new zod comparison", () => {
  function toTest(params: any) {}

  const mock = Mock(toTest);
  expect(mock({ name: -1 })).toBe(undefined);

  when(mock)
    .isCalledWith({ name: m.validates(z.number().int().negative()) })
    .thenReturn(unsafe(999));

  expect(mock({ name: -1 })).toBe(999);

  resetCompletely(mock);

  when(mock)
    .isCalledWith({
      x: m.validates(z.array(z.number().int().positive())),
      y: m.validates(z.array(z.number().int().negative())),
      z: 2,
    })
    .thenReturn(unsafe("ding"));

  expect(mock({ x: [1, 2], y: [-1, -2], z: 2 })).toBe("ding");
  expect(mock({ x: [1, 2], y: [-1, -2], z: 3 })).toBe(undefined);
  expect(mock({ x: ["Victor", "D"], y: [-1, -2], z: 2 })).toBe(undefined);
  expect(mock({ x: [1, 2], y: ["Victor", "D"], z: 2 })).toBe(undefined);

  resetCompletely(mock);

  when(mock)
    .isCalledWith({
      x: m.validates(z.set(z.number().int().positive())),
      y: m.validates(z.set(z.number().int().negative())),
      z: 2,
    })
    .thenReturn(unsafe("ding"));

  expect(mock({ x: new Set([1, 2]), y: new Set([-1, -2]), z: 2 })).toBe("ding");
  expect(mock({ x: new Set(["V", "D"]), y: new Set([-1, -2]), z: 2 })).toBe(
    undefined
  );
  expect(mock({ x: new Set([1, 2]), y: new Set(["V", "D"]), z: 2 })).toBe(
    undefined
  );
  expect(mock({ x: new Set([1, 2]), y: new Set([-1, -2]), z: 3 })).toBe(
    undefined
  );

  resetCompletely(mock);

  when(mock)
    .isCalledWith({
      x: {
        y: {
          z: {
            a: {
              b: {
                c: m.validates(z.string().uuid()),
              },
            },
          },
        },
      },
    })
    .thenReturn(unsafe("ding"));

  expect(mock(1)).toBeUndefined();
  expect(mock("v")).toBeUndefined();
  expect(mock({})).toBeUndefined();

  // this does not work
  expect(
    mock({
      x: {
        y: {
          z: {
            a: {
              b: {
                c: "not an uuid",
              },
            },
          },
        },
      },
    })
  ).toBeUndefined();

  expect(
    mock({
      x: {
        y: {
          z: {
            a: {
              b: {
                c: randomUUID(),
              },
            },
          },
        },
      },
    })
  ).toEqual("ding");
});

import { z } from "zod";
import { Mock } from "../mocks";
import {
  anyArray,
  anyBoolean,
  anyFalsy,
  anyFunction,
  anyMap,
  anyNullish,
  anyNumber,
  anyObject,
  anySet,
  anyString,
  anyTruthy,
  arrayContaining,
  arrayContainingDeep,
  arrayMatching,
  mapContaining,
  mapContainingDeep,
  objectContaining,
  objectContainingDeep,
  objectMatching,
  or,
  setContaining,
  setContainingDeep,
  stringEndingWith,
  stringMatching,
  stringStartingWith,
  unsafe,
  validates,
} from "./matchers";
import { when } from "./when";
import { m } from "..";
/**
 * This test suite is here to test that matchers can take the place of any type of value.
 * We're testing type compilation here, not features. => No assertions needed.
 */
it("should compile with any matcher", () => {
  function toTest(params: Record<string, string>) {}

  const mock = Mock(toTest);

  when(mock).isCalledWith({
    toReplace: anyMap(),
  });

  when(mock).isCalledWith({
    toReplace: mapContaining(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: mapContainingDeep(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: anySet(),
  });

  when(mock).isCalledWith({
    toReplace: setContaining(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: setContainingDeep(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: anyObject(),
  });

  when(mock).isCalledWith({
    toReplace: objectContaining({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: objectContainingDeep({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: objectMatching({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: anyArray(),
  });

  when(mock).isCalledWith({
    toReplace: arrayContaining(["1"]),
  });

  when(mock).isCalledWith({
    toReplace: arrayContainingDeep(["1"]),
  });

  when(mock).isCalledWith({
    toReplace: arrayMatching(["1"]),
  });

  when(mock).isCalledWith({
    toReplace: anyNumber(),
  });

  when(mock).isCalledWith({
    toReplace: anyString(),
  });

  when(mock).isCalledWith({
    toReplace: stringStartingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: stringEndingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: stringMatching(/a/),
  });

  when(mock).isCalledWith({
    toReplace: anyBoolean(),
  });

  when(mock).isCalledWith({
    toReplace: anyFunction(),
  });

  when(mock).isCalledWith({
    toReplace: anyFalsy(),
  });

  when(mock).isCalledWith({
    toReplace: anyTruthy(),
  });

  when(mock).isCalledWith({
    toReplace: anyNullish(),
  });

  when(mock).isCalledWith({
    toReplace: unsafe("yo"),
  });

  when(mock).isCalledWith({
    toReplace: or(anyString(), anyNumber()),
  });
});

function deepToTest(params: {
  x: {
    y: {
      z: string;
    };
  };
}) {}

it("should compile with deep matchers", () => {
  const mock = Mock(deepToTest);

  when(mock).isCalledWith(
    objectContainingDeep({
      x: {
        y: {
          z: stringStartingWith("a"),
        },
      },
    })
  );

  when(mock).isCalledWith(
    objectContaining({
      x: {
        y: {
          z: stringStartingWith("a"),
        },
      },
    })
  );
});

test("typesafe for array containing", () => {
  const values = ["a", "b", "c"] as const;
  const mock = Mock((_params: (typeof values)[number]) => {
    return values;
  });

  // Should auto-complete with the correct values
  when(mock).isCalledWith(arrayContaining(["a", "b"]));
  when(mock).isCalledWith(arrayContainingDeep(["a", "b", "c"]));
});

test("typesafe for validates", () => {
  function toTest(params: { x: number; y: boolean; z: string }) {}

  const mock = Mock(toTest);

  when(mock).isCalledWith(
    validates((value) => {
      return value.x > 0 && value.y && value.z.startsWith("1");
    })
  );

  when(mock).isCalledWith(
    validates(
      z.object({
        x: z.number().positive(),
        y: z.boolean(),
        z: z.string().startsWith("1"),
      })
    )
  );
});

test("typesafe thenReturn partial", () => {
  function toTest(): { a: { b: number; c: string }; d: boolean } {
    return { a: { b: 1, c: "1" }, d: true };
  }

  const mock = Mock(toTest);

  when(mock).isCalled.thenReturn(m.partial({ a: { b: 1 } }));
  expect(mock()).toEqual({ a: { b: 1 } });

  when(mock).isCalled.thenReturn({ a: m.partial({ b: 1 }), d: true });

  expect(mock()).toEqual({ a: { b: 1 }, d: true });
});

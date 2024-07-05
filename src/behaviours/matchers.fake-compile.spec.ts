import { Mock } from "../mocks";
import {
  any,
  arrayContaining,
  arrayContainingDeep,
  mapContaining,
  mapContainingDeep,
  objectContaining,
  objectContainingDeep,
  or,
  setContaining,
  setContainingDeep,
  stringEndingWith,
  stringMatchingRegex,
  stringStartingWith,
  unsafe,
} from "./matchers";
import { when } from "./when";
/**
 * This test suite is here to test that matchers can take the place of any type of value.
 * We're testing type compilation here, not features. => No assertions needed.
 */
it("should compile with any matcher", () => {
  function toTest(params: Record<string, string>) {}

  const mock = Mock(toTest);

  when(mock).isCalledWith({
    toReplace: any.map(),
  });

  when(mock).isCalledWith({
    toReplace: mapContaining(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: mapContainingDeep(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: any.set(),
  });

  when(mock).isCalledWith({
    toReplace: setContaining(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: setContainingDeep(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: any.object(),
  });

  when(mock).isCalledWith({
    toReplace: objectContaining({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: objectContainingDeep({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: any.array(),
  });

  when(mock).isCalledWith({
    toReplace: arrayContaining(["1"]),
  });

  when(mock).isCalledWith({
    toReplace: arrayContainingDeep(["1"]),
  });

  when(mock).isCalledWith({
    toReplace: any.number(),
  });

  when(mock).isCalledWith({
    toReplace: any.string(),
  });

  when(mock).isCalledWith({
    toReplace: stringStartingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: stringEndingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: stringMatchingRegex(/a/),
  });

  when(mock).isCalledWith({
    toReplace: any.boolean(),
  });

  when(mock).isCalledWith({
    toReplace: any.function(),
  });

  when(mock).isCalledWith({
    toReplace: any.falsy(),
  });

  when(mock).isCalledWith({
    toReplace: any.truthy(),
  });

  when(mock).isCalledWith({
    toReplace: any.nullish(),
  });

  when(mock).isCalledWith({
    toReplace: unsafe("yo"),
  });

  when(mock).isCalledWith({
    toReplace: or(any.string(), any.number()),
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

import { Mock } from "../mocks";
import { matchers } from "./matchers";
import { when } from "./when";
/**
 * This test suite is here to test that matchers can take the place of any type of value.
 * We're testing type compilation here, not features.
 */
it("should compile with any matcher", () => {
  function toTest(params: Record<string, string>) {}

  const mock = Mock(toTest);

  when(mock).isCalledWith({
    toReplace: matchers.any.map(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.mapContaining(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: matchers.mapContainingDeep(new Map([["a", 1]])),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.set(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.setContaining(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: matchers.setContainingDeep(new Set([1])),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.object(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.objectContaining({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: matchers.objectContainingDeep({ a: 1 }),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.array(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.arrayContaining([1]),
  });

  when(mock).isCalledWith({
    toReplace: matchers.arrayContainingDeep([1]),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.number(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.string(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.stringStartingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: matchers.stringEndingWith("a"),
  });

  when(mock).isCalledWith({
    toReplace: matchers.stringMatchingRegex(/a/),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.boolean(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.function(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.falsy(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.truthy(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.any.nullish(),
  });

  when(mock).isCalledWith({
    toReplace: matchers.unsafe("yo"),
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
    matchers.objectContainingDeep({
      x: {
        y: {
          z: matchers.stringStartingWith("a"),
        },
      },
    })
  );

  when(mock).isCalledWith(
    matchers.objectContaining({
      x: {
        y: {
          z: matchers.stringStartingWith("a"),
        },
      },
    })
  );
});

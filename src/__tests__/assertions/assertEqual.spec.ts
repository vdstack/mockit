import { z } from "zod";
import { m } from "../..";

/**
 * These two functions use the underlying compare function that is used widely in Mockit.
 * This is why i'm not testing any specific cases because they're already tested at the
 * compare function's unit tests layer.
 *
 * This is why i'm only testing that the functions are typesafe and that they work as expected,
 * aka:
 * - compare if two real values are equal or not
 * - compare a value with a matcher (aka a category of values, or a rule).
 */
describe("assertEqual", () => {
  it("should return true if the values are equal", () => {
    m.assertEqual(1, 1);
  });

  it("should throw an error if the values are not equal", () => {
    expect(() => m.assertEqual(1, 2)).toThrow();
  });

  it("should accept matchers", () => {
    m.assertEqual(1, m.anyNumber());
    expect(() => m.assertEqual(1, m.anyString())).toThrow();

    class X {}
    m.assertEqual(new X(), m.instanceOf(X));

    m.assertEqual(
      { x: 1, y: { w: 3, z: { e: [1, 2, 3], b: 5 } } },
      {
        x: 1,
        y: m.objectContaining({
          z: {
            e: m.arrayContaining([1]),
          },
        }),
      }
    );

    m.assertEqual(
      {
        x: 1,
        y: { z: { e: [1, 2, 3], b: 5 } },
      },
      {
        x: m.validates((value) => value > 0),
        y: {
          z: m.validates(
            z.object({
              e: z.array(z.number().int().positive()),
              b: z.number().int().positive(),
            })
          ),
        },
      }
    );
  });
});

function aaa(x: number) {}

// test :
aaa(m.validates((x) => x !== 2));
m.assertEqual(
  1,
  m.validates((x) => x !== 2)
);
m.assertEqual(
  { x: 1 },
  {
    x: m.validates((x: number) => x > 0 && x < 2),
  }
);

describe("assertNotEqual", () => {
  it("should not throw if the values are not equal", () => {
    m.assertNotEqual(1, m.unsafe("1"));
  });

  it("should throw an error if the values are equal", () => {
    expect(() => m.assertNotEqual(1, 1)).toThrow();
  });

  it("should not throw if provided with valid matchers", () => {
    m.assertNotEqual(1, m.anyString());
  });
});

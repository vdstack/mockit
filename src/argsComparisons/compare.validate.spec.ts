import { z } from "zod";
import { compare } from "./compare";
import { m } from "..";

describe("compare.or", () => {
  it("should be able to apply the 'or' operator when comparing values", () => {
    expect(
      compare(
        1,
        m.validates(
          (value) => z.number().int().positive().safeParse(value).success
        )
      )
    ).toBe(true);

    expect(
      compare(
        1,
        m.validates(
          (value) => z.number().int().negative().safeParse(value).success
        )
      )
    ).toBe(false);

    expect(
      compare(
        1,
        m.validates((value) => value > 0)
      )
    ).toBe(true);

    expect(
      compare(
        0,
        m.validates((value) => value > 0)
      )
    ).toBe(false);
  });

  it("should accept zod schemas", () => {
    expect(compare(1, m.validates(z.number().positive()))).toBe(true);
    expect(compare(0, m.validates(z.number().positive()))).toBe(false);
  });
});

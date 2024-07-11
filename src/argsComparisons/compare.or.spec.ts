import { z } from "zod";
import { or } from "../behaviours/matchers";
import { compare } from "./compare";
import { m } from "..";

describe("compare.or", () => {
  it("should be able to apply the 'or' operator when comparing values", () => {
    expect(
      compare(
        1,
        or(
          m.validates(z.number().int().positive()),
          m.validates(z.number().int().negative())
        )
      )
    ).toBe(true);

    expect(
      compare(
        0,
        or(
          m.validates(z.number().int().positive()),
          m.validates(z.number().int().negative())
        )
      )
    ).toBe(false);

    expect(
      compare(
        -1,
        or(
          m.validates(z.number().int().positive()),
          m.validates(z.number().int().negative())
        )
      )
    ).toBe(true);
  });
});

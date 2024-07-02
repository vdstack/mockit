import { z } from "zod";
import { or, schema } from "../behaviours/matchers";
import { compare } from "./compare";

describe("compare.or", () => {
  it("should be able to apply the 'or' operator when comparing values", () => {
    expect(
      compare(
        1,
        or(
          schema(z.number().int().positive()),
          schema(z.number().int().negative())
        )
      )
    ).toBe(true);

    expect(
      compare(
        0,
        or(
          schema(z.number().int().positive()),
          schema(z.number().int().negative())
        )
      )
    ).toBe(false);

    expect(
      compare(
        -1,
        or(
          schema(z.number().int().positive()),
          schema(z.number().int().negative())
        )
      )
    ).toBe(true);
  });
});

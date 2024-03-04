import { z } from "zod";
import { hasher } from "../hasher";

export function compareArgsWithZodSchemas(
  actual: Array<any>,
  expected: Array<z.ZodType | any>
) {
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((arg, index) => {
    if (expected[index] instanceof z.ZodType) {
      return expected[index].safeParse(arg).success;
    }

    return hasher.hash(arg) === hasher.hash(expected[index]);
  });
}

import { z } from "zod";
import { hasher } from "../hasher";

export function compareArgs(actual: Array<any>, expected: Array<any>) {
  if (actual.length !== expected.length) {
    return false;
  }

  console.log(actual, expected);

  return actual.every((arg, index) => {
    if (
      typeof expected[index] === "object" &&
      expected[index].mockit__isPartial
    ) {
      return partiallyEquals(arg, expected[index], { isDeepPartial: false });
    }

    if (
      typeof expected[index] === "object" &&
      expected[index].mockit__isDeepPartial
    ) {
      return partiallyEquals(arg, expected[index], { isDeepPartial: true });
    }

    if (typeof expected[index] === "object" && expected[index].mockit__isZod) {
      const { schema }: { schema: z.ZodType } = expected[index];
      return schema.safeParse(arg).success;
    }

    if (
      typeof expected[index] === "object" &&
      recursivelyCheckForMockitFlags(expected[index])
    ) {
      return Object.keys(expected[index]).every((key) => {
        return compareArgs([arg?.[key]], [expected[index][key]]);
      });
    }

    return hasher.hash(arg) === hasher.hash(expected[index]);
  });
}

function partiallyEquals(
  obj: any,
  partial: any,
  { isDeepPartial }: { isDeepPartial: boolean }
) {
  if (typeof obj !== "object") {
    return false;
  }

  const keysToCheck = Object.keys(partial).filter(
    (key) => !key.startsWith("mockit__")
  );

  for (let i = 0; i < keysToCheck.length; i++) {
    let equals = false;
    const key = keysToCheck[i];

    const isSchema =
      typeof partial[key] === "object" && partial[key].mockit__isZod;
    const isPartial =
      typeof partial[key] === "object" && partial[key].mockit__isPartial;
    const isDeepPartialStruct =
      typeof partial[key] === "object" && partial[key].mockit__isDeepPartial;
    if (isSchema) {
      // It's important to know if a schema is injected deep in the object
      const { schema }: { schema: z.ZodType } = partial[key];
      equals = schema.safeParse(obj[key]).success;
    } else if (isPartial) {
      // If's important if a partial is injected deep in the object
      equals = partiallyEquals(obj[key], partial[key], { isDeepPartial });
    } else if (isDeepPartialStruct) {
      // If's important if a deep partial is injected deep in the object
      equals = partiallyEquals(obj[key], partial[key], { isDeepPartial: true });
    } else {
      equals =
        isDeepPartial && typeof obj[key] === "object"
          ? partiallyEquals(obj[key], partial[key], { isDeepPartial })
          : hasher.hash(obj[key]) === hasher.hash(partial[key]);
    }

    if (!equals) {
      return false;
    }
  }

  return true;
}

function recursivelyCheckForMockitFlags(obj: any) {
  if (Array.isArray(obj)) {
    return obj.some((item) => recursivelyCheckForMockitFlags(item));
  }

  console.log(obj);
  const keys = Object.keys(obj);
  if (keys.some((key) => key.startsWith("mockit__"))) {
    return true;
  }

  return keys.some((key) => {
    if (typeof obj[key] === "object") {
      return recursivelyCheckForMockitFlags(obj[key]);
    }

    return false;
  });
}

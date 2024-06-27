import { z } from "zod";
import { hasher } from "../hasher";

export function compareArgsForBehaviour(
  actual: Array<any>,
  expected: Array<any>
) {
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

    if (typeof expected[index] === "object" && expected[index].mockit__isSchema) {
      const { schema }: { schema: z.ZodType } = expected[index];
      return schema.safeParse(arg).success;
    }

    if (
      typeof expected[index] === "object" &&
      recursivelyCheckForMockitFlags(expected[index])
    ) {
      return Object.keys(expected[index]).every((key) => {
        return compareArgsForBehaviour([arg?.[key]], [expected[index][key]]);
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
  // console.log("obj", obj);
  // console.log("partial", partial);
  // console.log("isDeepPartial", isDeepPartial);

  const keysToCheck = Object.keys(partial).filter(
    (key) => !key.startsWith("mockit__")
  );

  const parentIsPartial = partial.mockit__isPartial;
  const parentIsDeepPartial = partial.mockit__isDeepPartial;

  for (let i = 0; i < keysToCheck.length; i++) {
    let equals = false;
    const key = keysToCheck[i];

    // console.log("key", key);
    // console.log("obj[key]", obj[key]);
    // console.log("partial[key]", partial[key]);

    const isSchema =
      typeof partial[key] === "object" && !!partial[key]?.mockit__isSchema;
    const isPartial =
      typeof partial[key] === "object" && !!partial[key]?.mockit__isPartial;
    const isDeepPartialStruct =
      typeof partial[key] === "object" && !!partial[key]?.mockit__isDeepPartial;

    // console.log(
    //   "key",
    //   key,
    //   "isSchema",
    //   isSchema,
    //   typeof partial[key] === "object",
    //   partial[key]?.mockit__isSchema
    // );
    // console.log("key", key, "isPartial", isPartial);
    // console.log("key", key, "isDeepPartialStruct", isDeepPartialStruct);

    if (isSchema) {
      // console.log("yo schema");
      // It's important to know if a schema is injected deep in the object
      const { schema }: { schema: z.ZodType } = partial[key];
      equals = schema.safeParse(obj[key]).success;
    } else if (isPartial) {
      // console.log("yo partial");
      // If's important if a partial is injected deep in the object
      equals = partiallyEquals(obj[key], partial[key], { isDeepPartial });
    } else if (isDeepPartialStruct) {
      // console.log("yo deep partial");
      // If's important if a deep partial is injected deep in the object
      equals = partiallyEquals(obj[key], partial[key], { isDeepPartial: true });
    } else {
      // console.log("key", key, "HELLAW");
      // console.log(compareArgsForBehaviour([obj[key]], [partial[key]]));

      /**
       * I recognize that this is not the simplest code to read, but it's the only way I could think of to make it work.
       * I will study it more and try to make it simpler.
       */
      // console.log(
      //   "key",
      //   key,
      //   hasher.hash(obj[key]) === hasher.hash(partial[key])
      // );
      equals =
        isDeepPartial && typeof obj[key] === "object"
          ? partiallyEquals(obj[key], partial[key], { isDeepPartial })
          : recursivelyCheckForMockitFlags(partial[key]) // This makes it work for deeply nested constructs
          ? partiallyEquals(obj[key], partial[key], { isDeepPartial })
          : hasher.hash(obj[key]) === hasher.hash(partial[key]);
    }

    // console.log("key", key, "equals", equals);

    if (!equals) {
      return false;
    }
  }

  return true;
}

function recursivelyCheckForMockitFlags(obj: any) {
  if (typeof obj !== "object") {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => recursivelyCheckForMockitFlags(item));
  }

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

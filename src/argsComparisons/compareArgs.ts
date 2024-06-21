import { z } from "zod";
import { hasher } from "../hasher";

export function compareArgs(actual: Array<any>, expected: Array<any>) {
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((arg, index) => {
    if (typeof expected[index] === "object" && expected[index].mockit__isPartial) {
      return partiallyEquals(arg, expected[index]);
    }
    
    if (typeof expected[index] === "object" && expected[index].mockit__isZod) {
      const { schema }: { schema: z.ZodType } = expected[index];
      return schema.safeParse(arg).success;
    }
    
    // if (typeof expected[index] === "object" && recursivelyCheckForMockitFlags(expected[index])) {
    //   return Object.keys(expected[index]).every((key) => { return compareArgs(arg[key], expected[index][key]) });
    // }

    return hasher.hash(arg) === hasher.hash(expected[index]);
  });
}

// now I want to allow partial comparisons

// Deep partial would be possible with an additional parameter isPartial: boolean
// I would just need a new mockit__isDeepPartial flag to know if I pass it to the this functions or not
// I suggest we don't add it for now, but we can add it later if we need it
function partiallyEquals(obj: any, partial: any) {
  if ((typeof obj) !== "object") {
    return false;
  }
  
  const keysToCheck = Object.keys(partial).filter(
    (key) => !key.startsWith("mockit__")
  )

  for (let i = 0; i < keysToCheck.length; i++) {
    let equals = false;
    const key = keysToCheck[i];

    if (typeof partial[key] === "object" && partial[key].mockit__isZod) {
      const { schema }: { schema: z.ZodType } = partial[key];
      equals = schema.safeParse(obj[key]).success;
    } else if (typeof partial[key] === "object" && partial[key].mockit__isPartial) {
      equals = partiallyEquals(obj[key], partial[key]);
    } else {
      equals = hasher.hash(obj[key]) === hasher.hash(partial[key]);
    }

    if (!equals) {
      return false;
    }
  }

  return true;


  // return objKeys.filter(k => k!== "mockit__isPartial").every((key) => {
  //   if (typeof partial[key] === "object" && partial[key].mockit__isZod) {
  //     console.log("here zod", key, obj?.[key])
  //     console.log("here zod", key, partial[key])
  //     const { schema }: { schema: z.ZodType } = partial[key];
  //     return schema.safeParse(obj?.[key]).success;
  //   }

  //   if (typeof partial[key] === "object" && partial[key].mockit__isPartial) {
  //     console.log("here partial", key, obj?.[key])
  //     console.log("here partial", key, partial[key])
  //     return partiallyEquals(obj?.[key], partial[key]);
  //   }

  //   return hasher.hash(obj?.[key]) === hasher.hash(partial?.[key]);
  // });
}

function recursivelyCheckForMockitFlags(obj: any) {
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
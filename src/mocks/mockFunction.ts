import { z, ZodSchema } from "zod";
import { generateMock } from "@anatine/zod-mock";

import { Call } from "../types";
import { hasher } from "../hasher";
import { Behaviours, NewBehaviourParam } from "../behaviours/behaviours";
import {
  compare,
  containsMockitConstruct,
} from "../assertions/compare/compare";
import { containingDeep } from "../behaviours/containing.deep";

/**
 * This is the function mock, it is taking the place of the function that we want to mock.
 * It is a proxy, so it makes itself look like a function but in reality is a complex object
 * that can catch calls and store multiple behaviours.
 *
 * It's a central piece of the library, because it is used in all mocks (function, class, abstract)
 */

export function mockFunction<T extends (...args: any[]) => any>(
  original: T,
  options: { defaultBehaviour?: NewBehaviourParam<T> } = {}
): T {
  const calls: Call<T>[] = [];
  let defaultBehaviour =
    options?.defaultBehaviour ??
    ({
      kind: Behaviours.Return,
      returnedValue: undefined,
    } as NewBehaviourParam<T>);

  const customBehaviours: Array<{
    args: any[];
    behaviour: NewBehaviourParam<T>;
  }> = [];

  // Each set of arguments will have a list of behaviours, so we can have multiple behaviours for the same set of arguments.
  return new Proxy(original, {
    apply: (original, _thisArg, callArgs) => {
      // What is thisArg ?
      calls.push({
        args: callArgs as unknown as Parameters<T>,
        date: new Date(),
      });

      const customBehaviour = customBehaviours.find(
        (behaviour) => hasher.hash(behaviour.args) === hasher.hash(callArgs)
      );

      if (customBehaviour) {
        switch (customBehaviour.behaviour.kind) {
          case Behaviours.Throw:
            throw customBehaviour.behaviour.error;
          case Behaviours.Call:
            return customBehaviour.behaviour.callback(...callArgs);
          case Behaviours.Return:
            return handleThenReturn(customBehaviour.behaviour.returnedValue);
          case Behaviours.Resolve:
            return Promise.resolve(
              handleThenReturn(customBehaviour.behaviour.resolvedValue)
            );
          case Behaviours.Reject:
            return Promise.reject(customBehaviour.behaviour.rejectedValue);
          case Behaviours.Custom:
            // @ts-expect-error thank the proxy for that one (no type-safety provided by native Proxy)
            return customBehaviour.behaviour.customBehaviour(...callArgs);
          case Behaviours.Preserve:
            return original(...callArgs);
          default:
            throw new Error(
              "Invalid behaviour. This should not happen. Please open an issue on the GitHub repository."
            );
        }
      }

      const constructBasedCustomBehaviour = customBehaviours.find(
        (behaviour) => {
          return compare(callArgs, behaviour.args);
        }
      );

      if (constructBasedCustomBehaviour) {
        switch (constructBasedCustomBehaviour.behaviour.kind) {
          case Behaviours.Throw:
            throw constructBasedCustomBehaviour.behaviour.error;
          case Behaviours.Call:
            return constructBasedCustomBehaviour.behaviour.callback(
              ...callArgs
            );
          case Behaviours.Return:
            return handleThenReturn(
              constructBasedCustomBehaviour.behaviour.returnedValue
            );
          case Behaviours.Resolve:
            return Promise.resolve(
              handleThenReturn(
                constructBasedCustomBehaviour.behaviour.resolvedValue
              )
            );
          case Behaviours.Reject:
            return Promise.reject(
              constructBasedCustomBehaviour.behaviour.rejectedValue
            );
          case Behaviours.Preserve:
            return original(...callArgs);
          case Behaviours.Custom:
            // @ts-expect-error thank the proxy for that one (no type-safety provided by native Proxy)
            return customBehaviour.behaviour.customBehaviour(...callArgs);
          default:
            throw new Error(
              "Invalid behaviour. This should not happen. Please open an issue on the GitHub repository."
            );
        }
      }

      switch (defaultBehaviour.kind) {
        case Behaviours.Throw:
          throw defaultBehaviour.error;
        case Behaviours.Call:
          return defaultBehaviour.callback(...callArgs);
        case Behaviours.Return:
          return handleThenReturn(defaultBehaviour.returnedValue);
        case Behaviours.Resolve:
          return Promise.resolve(
            handleThenReturn(defaultBehaviour.resolvedValue)
          );
        case Behaviours.Reject:
          return Promise.reject(defaultBehaviour.rejectedValue);
        case Behaviours.Preserve:
          return original(...callArgs);
        case Behaviours.Custom:
          // @ts-expect-error thank the proxy for that one (no type-safety provided by native Proxy)
          return defaultBehaviour.customBehaviour(...callArgs);
        default:
          throw new Error(
            "Invalid behaviour. This should not happen. Please open an issue on the GitHub repository."
          );
      }
    },
    get: (target, prop, receiver) => {
      if (prop === "calls") {
        return calls;
      }

      if (prop === "isMockitMock") {
        return true;
      }

      return Reflect.get(target, prop, receiver);
    },
    set: (target, prop, value, receiver) => {
      if (prop === "defaultBehaviour") {
        defaultBehaviour = value;
        return true;
      }

      if (prop === "newCustomBehaviour") {
        customBehaviours.push(
          value as {
            args: any[];
            behaviour: NewBehaviourParam<T>;
          }
        );
        return true;
      }

      if (prop === "resetBehaviourOf") {
        customBehaviours.length = 0;
        defaultBehaviour = {
          kind: Behaviours.Return,
          returnedValue: undefined,
        } as NewBehaviourParam<T>;
        return true;
      }

      if (prop === "resetHistoryOf") {
        calls.length = 0;
        return true;
      }

      return false;
    },
  });
}

function handleThenReturn(returnedValue: unknown): unknown {
  // @Todo: there is a performance hit here, due to the if() checks. Investigate.
  // 1sec hit on the whole test suite.
  // I narrowed it down to the check themselves (even doing nothing inside the if(){} causes the issue).
  // There might be some strange deoptimisation going on here due to the fact that we're working in a Proxy apply
  // This could be changed by adding a new kind of behaviour under the hood when providing a matcher in the when() function.
  // => No if when it's time to return, just on setup.
  if (narrowToZodValidationMatcher(returnedValue)) {
    return generateMock(returnedValue.schema);
  }

  if (narrowToAnyMatcher(returnedValue)) {
    switch (returnedValue.what) {
      case "string":
        return generateMock(z.string());
      case "object":
        return generateMock(z.object({}));
      case "number":
        return generateMock(z.number());
      case "boolean":
        return generateMock(z.boolean());
      case "array":
        return generateMock(z.array(z.any()));
      case "falsy":
        return generateMock(
          z.union([z.literal(0), z.literal(false), z.literal("")])
        );
      case "truthy":
        return generateMock(z.union([z.literal(1), z.literal(true)]));
      case "function":
        return () => {};
      case "map":
        return generateMock(z.map(z.any(), z.any()));
      case "set":
        return new Set([1, 2, 3]);
      case "nullish":
        return generateMock(z.union([z.null(), z.undefined()]));
      default:
        throw new Error(`Invalid any matcher ${returnedValue.what}`);
    }
  }

  if (narrowSomeOtherMatcher(returnedValue)) {
    return handleSomeOtherMatcher(returnedValue as Record<string, unknown>);
  }

  if (
    typeof returnedValue === "object" &&
    containsMockitConstruct(returnedValue, "mockit__")
  ) {
    if (Array.isArray(returnedValue)) {
      return returnedValue.map((item) => {
        return handleThenReturn(item);
      });
    }

    if (returnedValue instanceof Map) {
      return new Map(
        Array.from(returnedValue.entries()).map(([key, value]) => [
          key,
          handleThenReturn(value),
        ])
      );
    }

    if (returnedValue instanceof Set) {
      return new Set(
        Array.from(returnedValue).map((value) => handleThenReturn(value))
      );
    }
    let mock: Record<string, unknown> = {};
    for (const key in returnedValue) {
      // @ts-expect-error
      mock[key] = handleThenReturn(returnedValue[key]);
    }
    return mock;
  }

  return returnedValue;
}

function narrowToZodValidationMatcher(
  value: any
): value is { schema: ZodSchema } {
  return (
    typeof value === "object" &&
    value !== null &&
    "mockit__isSchema" in value &&
    value.mockit__isSchema
  );
}

export type anyWhat =
  | "string"
  | "object"
  | "number"
  | "boolean"
  | "array"
  | "function"
  | "nullish"
  | "falsy"
  | "truthy"
  | "map"
  | "set";

function narrowToAnyMatcher(value: any): value is { what: anyWhat } {
  return typeof value === "object" && value !== null && "mockit__any" in value;
}

function narrowSomeOtherMatcher(value: any) {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).some((key) => key.startsWith("mockit__"))
  );
}

function handleSomeOtherMatcher(value: Record<string, unknown>): unknown {
  if ("mockit__isContainingDeep" in value) {
    // <=> arrayMatching or objectMatching
    if (Array.isArray(value.original)) {
      return value.original.map((item: unknown) => {
        return handleThenReturn(containingDeep(item));
      });
    }

    if (typeof value.original === "object" && value.original !== null) {
      let mock: Record<string, unknown> = {};
      for (const key in value.original) {
        if (typeof value[key] === "object" && value[key] !== null) {
          mock[key] = handleThenReturn(
            containingDeep(
              Array.isArray(value[key]) ? [value[key]] : value[key]
            )
          );
        } else {
          mock[key] = handleThenReturn(value[key]);
        }
      }
      return mock;
    }
  }

  throw new Error(
    `This matcher is not supported as a dummy-data generator: ${value}`
  );
}

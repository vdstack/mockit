import { z } from "zod";

import { Call } from "../types";
import { hasher } from "../hasher";
import { Behaviours, NewBehaviourParam } from "../behaviours/behaviours";
import { compare } from "../assertions/compare/compare";

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
            return customBehaviour.behaviour.returnedValue;
          case Behaviours.Resolve:
            return Promise.resolve(customBehaviour.behaviour.resolvedValue);
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
            return constructBasedCustomBehaviour.behaviour.returnedValue;
          case Behaviours.Resolve:
            return Promise.resolve(
              constructBasedCustomBehaviour.behaviour.resolvedValue
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
          return defaultBehaviour.returnedValue;
        case Behaviours.Resolve:
          return Promise.resolve(defaultBehaviour.resolvedValue);
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

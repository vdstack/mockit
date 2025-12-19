import { Call } from "../types";
import { hasher } from "../hasher";
import { Behaviours, NewBehaviourParam } from "../behaviours/behaviours";
import { compare } from "../argsComparisons/compare";

/**
 * Helper function to execute a behaviour and return the result.
 * Reduces code duplication in the apply trap.
 */
function executeBehaviour<T extends (...args: any[]) => any>(
  behaviour: NewBehaviourParam<T>,
  callArgs: any[],
  original: T
): any {
  switch (behaviour.kind) {
    case Behaviours.Throw:
      throw behaviour.error;
    case Behaviours.Call:
      return behaviour.callback(...callArgs);
    case Behaviours.Return:
      return behaviour.returnedValue;
    case Behaviours.Resolve:
      return Promise.resolve(behaviour.resolvedValue);
    case Behaviours.Reject:
      return Promise.reject(behaviour.rejectedValue);
    case Behaviours.Custom:
      // @ts-expect-error - The type says params but the API expects spread args
      return behaviour.customBehaviour(...callArgs);
    case Behaviours.Preserve:
      return original(...callArgs);
    default:
      throw new Error(
        "Invalid behaviour. This should not happen. Please open an issue on the GitHub repository."
      );
  }
}

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

  // FIFO queue for "once" behaviors - consumed in order, then fallback to default
  const onceBehaviours: NewBehaviourParam<T>[] = [];

  // Each set of arguments will have a list of behaviours, so we can have multiple behaviours for the same set of arguments.
  const proxy = new Proxy(original, {
    apply: (original, _thisArg, callArgs) => {
      calls.push({
        args: callArgs as unknown as Parameters<T>,
        date: new Date(),
      });

      // 1. Check once behaviours first (FIFO - consume from front)
      if (onceBehaviours.length > 0) {
        const onceBehaviour = onceBehaviours.shift()!;
        return executeBehaviour(onceBehaviour, callArgs, original);
      }

      // 2. Check custom behaviours by exact args (hash comparison)
      const customBehaviour = customBehaviours.find(
        (behaviour) => hasher.hash(behaviour.args) === hasher.hash(callArgs)
      );
      if (customBehaviour) {
        return executeBehaviour(customBehaviour.behaviour, callArgs, original);
      }

      // 3. Check custom behaviours by matcher comparison
      const constructBasedCustomBehaviour = customBehaviours.find(
        (behaviour) => compare(callArgs, behaviour.args)
      );
      if (constructBasedCustomBehaviour) {
        return executeBehaviour(constructBasedCustomBehaviour.behaviour, callArgs, original);
      }

      // 4. Fallback to default behaviour
      return executeBehaviour(defaultBehaviour, callArgs, original);
    },
    get: (target, prop, receiver) => {
      // Existing properties
      if (prop === "calls") {
        return calls;
      }
      if (prop === "isMockitMock") {
        return true;
      }

      // Chainable methods for default behavior (Jest-style API)
      if (prop === "mockReturnValue") {
        return (value: any) => {
          defaultBehaviour = { kind: Behaviours.Return, returnedValue: value };
          return proxy;
        };
      }
      if (prop === "mockResolvedValue") {
        return (value: any) => {
          defaultBehaviour = { kind: Behaviours.Resolve, resolvedValue: value };
          return proxy;
        };
      }
      if (prop === "mockRejectedValue") {
        return (value: any) => {
          defaultBehaviour = { kind: Behaviours.Reject, rejectedValue: value };
          return proxy;
        };
      }
      if (prop === "mockImplementation") {
        return (fn: (...args: any[]) => any) => {
          defaultBehaviour = { kind: Behaviours.Custom, customBehaviour: fn };
          return proxy;
        };
      }

      // Chainable methods for once behaviors (FIFO queue)
      if (prop === "mockReturnValueOnce") {
        return (value: any) => {
          onceBehaviours.push({ kind: Behaviours.Return, returnedValue: value });
          return proxy;
        };
      }
      if (prop === "mockResolvedValueOnce") {
        return (value: any) => {
          onceBehaviours.push({ kind: Behaviours.Resolve, resolvedValue: value });
          return proxy;
        };
      }
      if (prop === "mockRejectedValueOnce") {
        return (value: any) => {
          onceBehaviours.push({ kind: Behaviours.Reject, rejectedValue: value });
          return proxy;
        };
      }
      if (prop === "mockImplementationOnce") {
        return (fn: (...args: any[]) => any) => {
          onceBehaviours.push({ kind: Behaviours.Custom, customBehaviour: fn });
          return proxy;
        };
      }

      // Reset methods (Jest naming)
      if (prop === "mockClear") {
        return () => {
          calls.length = 0;
          return proxy;
        };
      }
      if (prop === "mockReset") {
        return () => {
          calls.length = 0;
          onceBehaviours.length = 0;
          customBehaviours.length = 0;
          defaultBehaviour = {
            kind: Behaviours.Return,
            returnedValue: undefined,
          } as NewBehaviourParam<T>;
          return proxy;
        };
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
        onceBehaviours.length = 0;
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

  return proxy;
}

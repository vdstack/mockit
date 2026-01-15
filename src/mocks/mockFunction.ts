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
  original: T,
  thisArg?: any
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
      return behaviour.customBehaviour.call(thisArg, ...callArgs);
    case Behaviours.Preserve:
      return original.call(thisArg, ...callArgs);
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

  // Mock name for debugging
  let mockName = "mockit.fn()";

  // Each set of arguments will have a list of behaviours, so we can have multiple behaviours for the same set of arguments.
  const proxy = new Proxy(original, {
    apply: (original, thisArg, callArgs) => {
      const callDate = new Date();

      // Determine which behaviour to use
      let behaviourToExecute = defaultBehaviour;

      if (onceBehaviours.length > 0) {
        behaviourToExecute = onceBehaviours.shift()!;
      } else {
        const customBehaviour = customBehaviours.find(
          (b) => hasher.hash(b.args) === hasher.hash(callArgs)
        );
        if (customBehaviour) {
          behaviourToExecute = customBehaviour.behaviour;
        } else {
          const matcherBehaviour = customBehaviours.find((b) =>
            compare(callArgs, b.args)
          );
          if (matcherBehaviour) {
            behaviourToExecute = matcherBehaviour.behaviour;
          }
        }
      }

      // Execute and record result
      try {
        const value = executeBehaviour(
          behaviourToExecute,
          callArgs,
          original,
          thisArg
        );
        calls.push({
          args: callArgs as Parameters<T>,
          date: callDate,
          result: { kind: "return", value },
        });
        return value;
      } catch (error) {
        calls.push({
          args: callArgs as Parameters<T>,
          date: callDate,
          result: { kind: "throw", error },
        });
        throw error;
      }
    },
    get: (target, prop, receiver) => {
      // Existing properties
      if (prop === "calls") {
        return calls;
      }
      if (prop === "lastCall") {
        return calls.length > 0 ? calls[calls.length - 1].args : undefined;
      }
      if (prop === "isMockitMock") {
        return true;
      }
      if (prop === "getMockName") {
        return () => mockName;
      }
      if (prop === "mockName") {
        return (newName: string) => {
          mockName = newName;
          return proxy;
        };
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

      if (prop === "mockThrow") {
        return (error: any) => {
          defaultBehaviour = { kind: Behaviours.Throw, error };
          return proxy;
        };
      }

      if (prop === "mockReturnThis") {
        return () => {
          defaultBehaviour = {
            kind: Behaviours.Custom,
            customBehaviour: function () {
              return this;
            },
          };
          return proxy;
        };
      }

      // Chainable methods for once behaviors (FIFO queue)
      if (prop === "mockReturnValueOnce") {
        return (value: any) => {
          onceBehaviours.push({
            kind: Behaviours.Return,
            returnedValue: value,
          });
          return proxy;
        };
      }
      if (prop === "mockResolvedValueOnce") {
        return (value: any) => {
          onceBehaviours.push({
            kind: Behaviours.Resolve,
            resolvedValue: value,
          });
          return proxy;
        };
      }
      if (prop === "mockRejectedValueOnce") {
        return (value: any) => {
          onceBehaviours.push({
            kind: Behaviours.Reject,
            rejectedValue: value,
          });
          return proxy;
        };
      }
      if (prop === "mockImplementationOnce") {
        return (fn: (...args: any[]) => any) => {
          onceBehaviours.push({ kind: Behaviours.Custom, customBehaviour: fn });
          return proxy;
        };
      }

      if (prop === "mockThrowOnce") {
        return (error: any) => {
          onceBehaviours.push({ kind: Behaviours.Throw, error });
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
      if (prop === "mockRestore") {
        return () => {
          calls.length = 0;
          onceBehaviours.length = 0;
          customBehaviours.length = 0;
          defaultBehaviour = { kind: Behaviours.Preserve };
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
  }) as T;

  return proxy;
}

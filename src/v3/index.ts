import hash from "node-object-hash";
import { ZodSchema, z } from "zod";

const hasher = hash({ coerce: { set: true, symbol: true } });

export type Call<T extends (...args: any) => any> = {
  args: Parameters<T>;
  date: Date;
};

export type UnsafeCall = {
  args: any[];
  date: Date;
};

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
          case Behaviours.ReturnResultOf:
            // @ts-expect-error thank the proxy for that one
            return customBehaviour.behaviour.returnedFunction(...callArgs);
          case Behaviours.ResolveResultOf:
            return Promise.resolve(
              // @ts-expect-error
              customBehaviour.behaviour.resolvedFunction(...callArgs)
            );
          case Behaviours.RejectResultOf:
            return Promise.reject(
              // @ts-expect-error
              customBehaviour.behaviour.rejectedFunction(...callArgs)
            );
          case Behaviours.Preserve:
            return original(...callArgs);
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
        case Behaviours.ReturnResultOf:
          // @ts-expect-error
          return defaultBehaviour.returnedFunction(...callArgs);
        case Behaviours.ResolveResultOf:
          return Promise.resolve(
            // @ts-expect-error
            defaultBehaviour.resolvedFunction(...callArgs)
          );
        case Behaviours.RejectResultOf:
          // @ts-expect-error
          return Promise.reject(defaultBehaviour.rejectedFunction(...callArgs));
        case Behaviours.Preserve:
          return original(...callArgs);
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
    },
  });
}

type wasUnsafe = {
  wasCalledOnceWith: (...args: any[]) => boolean;
  wasNeverCalledWith: (...args: any[]) => boolean;
  wasCalledWith: (...args: any[]) => boolean;
  wasCalledNTimesWith: (howMuch: number, args: any[]) => boolean;
};

type wasZod = {
  wasCalledOnceWith: (...args: Array<ZodSchema | any>) => boolean;
  wasNeverCalledWith: (...args: Array<ZodSchema | any>) => boolean;
  wasCalledWith: (...z: Array<ZodSchema | any>) => boolean;
  wasCalledNTimesWith: (
    howMuch: number,
    args: Array<ZodSchema | any>
  ) => boolean;
};

// This spies the mocked functions only !
export function spyMockedFunction<T extends (...args: any[]) => any>(
  mockedFunction: T
): {
  getCalls: () => Call<T>[];
  getUnsafeCalls: () => UnsafeCall;
  wasCalledOnce(): boolean;
  wasCalledOnceWith: (...args: Parameters<T>) => boolean;
  wasCalledNTimes(howMuch: number): boolean;
  wasCalledNTimesWith: (howMuch: number, args: Parameters<T>) => boolean;
  wasCalled: () => boolean;
  wasCalledWith: (...args: Parameters<T>) => boolean;
  wasNeverCalled: () => boolean;
  wasNeverCalledWith: (...args: Parameters<T>) => boolean;
  unsafe: wasUnsafe;
  zod: wasZod;
} {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  const calls = Reflect.get(mockedFunction, "calls") as Call<T>[];
  return {
    getCalls: () => calls,
    getUnsafeCalls: () => calls as unknown as UnsafeCall,
    wasCalledOnce: () => calls.length === 1,
    wasCalledOnceWith: (...expectedArgs: Parameters<T>) => {
      return calls.some((call) => compareArgs(call.args, expectedArgs));
    },
    wasCalledNTimes: (howMuch: number) => calls.length === howMuch,
    wasCalledNTimesWith: (howMuch: number, expectedArgs: Parameters<T>) => {
      return (
        calls.filter((call) => compareArgs(call.args, expectedArgs)).length ===
        howMuch
      );
    },
    wasCalled: () => {
      return calls.length > 0;
    },
    wasCalledWith: (...expectedArgs: Parameters<T>) => {
      return calls.some((call) => compareArgs(call.args, expectedArgs));
    },
    wasNeverCalled: () => calls.length === 0,
    wasNeverCalledWith: (...expectedArgs: Parameters<T>) => {
      return !calls.some((call) => compareArgs(call.args, expectedArgs));
    },
    unsafe: {
      wasCalledOnceWith: (...expectedArgs: any[]) => {
        return calls.some((call) => compareArgs(call.args, expectedArgs));
      },
      wasNeverCalledWith: (...expectedArgs: any[]) => {
        return !calls.some((call) => compareArgs(call.args, expectedArgs));
      },
      wasCalledWith: (...expectedArgs: any[]) => {
        return calls.some((call) => compareArgs(call.args, expectedArgs));
      },
      wasCalledNTimesWith: (howMuch: number, expectedArgs: any[]) => {
        return (
          calls.filter((call) => compareArgs(call.args, expectedArgs))
            .length === howMuch
        );
      },
    },
    zod: {
      wasCalledOnceWith: (...expectedArgs: Array<ZodSchema | any>) => {
        return calls.some((call) =>
          compareArgsWithZodSchemas(call.args, expectedArgs)
        );
      },
      wasNeverCalledWith: (...expectedArgs: Array<ZodSchema | any>) => {
        return !calls.some((call) =>
          compareArgsWithZodSchemas(call.args, expectedArgs)
        );
      },
      wasCalledWith: (...expectedArgs: Array<ZodSchema | any>) => {
        return calls.some((call) =>
          compareArgsWithZodSchemas(call.args, expectedArgs)
        );
      },
      wasCalledNTimesWith: (
        howMuch: number,
        expectedArgs: Array<ZodSchema | any>
      ) => {
        return (
          calls.filter((call) =>
            compareArgsWithZodSchemas(call.args, expectedArgs)
          ).length === howMuch
        );
      },
    },
  };
}

// I'm still wondering if I should just used a restricted string type instead of an enum.
export const Behaviours = {
  Resolve: "resolve",
  Reject: "reject",
  Return: "return",
  Call: "call",
  Throw: "throw",
  ReturnResultOf: "returnResultOf",
  ResolveResultOf: "resolveResultOf",
  RejectResultOf: "rejectResultOf",
  Preserve: "preserve",
} as const;

export type Behaviour = typeof Behaviours[keyof typeof Behaviours];

/**
 * This is a discriminated union type that will be used to define behaviours, either
 * by default or for a call with a specific set of arguments.
 */
export type NewBehaviourParam<T extends (...args) => any> =
  | { kind: typeof Behaviours.Throw; error?: any }
  | { kind: typeof Behaviours.Call; callback: (...args: any[]) => any }
  | { kind: typeof Behaviours.Return; returnedValue: any }
  | { kind: typeof Behaviours.Resolve; resolvedValue: any }
  | { kind: typeof Behaviours.Reject; rejectedValue: any }
  | {
      kind: typeof Behaviours.ReturnResultOf;
      returnedFunction: (params: Parameters<T>) => any;
    }
  | {
      kind: typeof Behaviours.ResolveResultOf;
      resolvedFunction: (params: Parameters<T>) => any;
    }
  | {
      kind: typeof Behaviours.RejectResultOf;
      rejectedFunction: (params: Parameters<T>) => any;
    }
  | { kind: typeof Behaviours.Preserve };

/**
 * What is changing
 *
 * - The behaviour is now a discriminated union type based on the Behaviours object as const
 * - new behaviours
 *  - ReturnResultOf
 *  - ResolveResultOf
 *  - RejectResultOf
 *  - Preserve
 *
 * - The defaultBehaviour is separated from the customBehaviours
 * - the system is WAY simpler to read & maintain.
 *
 * - the spies now require a zod schema OR a value, not zod schemas nested in objects.
 * - this is a breaking change, but it's a good one, because it simplifies everything, is way less error prone, and
 * performs way better.
 * - It requires a bit more work from the user, with .refine calls for exact values.
 * - I split the unsafe and zod based calls assertions, because they're less common cases (we usually check for exact values)
 *
 *
 * - DONE: check both actual & expected args for the zod based assertions (in order !)
 */

const mock = mockFunction((x: number, y: 2) => 3);

mock(1, 2);

const original = function add(x: number, y: number) {
  return x + y;
};

const spy = spyMockedFunction(mockFunction(original));

const mock2 = mockFunction((x: number, y: 2) => 3, {
  defaultBehaviour: { kind: Behaviours.Preserve },
});

function compareArgsWithZodSchemas(
  actual: Array<any>,
  expected: Array<ZodSchema | any>
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

function compareArgs(actual: Array<any>, expected: Array<any>) {
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((arg, index) => {
    return hasher.hash(arg) === hasher.hash(expected[index]);
  });
}

export function when<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  return {
    isCalled: {
      thenReturn: (value: ReturnType<TFunc>) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Return,
          returnedValue: value,
        });
      },
      thenReturnUnsafe: (value: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Return,
          returnedValue: value,
        });
      },
      thenPreserve: () => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Preserve,
        });
      },
      thenCall: (callback: (...args: Parameters<TFunc>) => any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Call,
          callback,
        });
      },
      thenCallUnsafe: (callback: (...args: any[]) => any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Call,
          callback,
        });
      },
      thenThrow: (error: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Throw,
          error,
        });
      },
      thenReturnResultOf: (
        returnedFunction: (...args: Parameters<TFunc>) => any
      ) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.ReturnResultOf,
          returnedFunction,
        });
      },
      thenResolve: (resolvedValue: Awaited<ReturnType<TFunc>>) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Resolve,
          resolvedValue,
        });
      },
      thenResolveUnsafe: (resolvedValue: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Resolve,
          resolvedValue,
        });
      },
      thenResolveResultOf: (
        resolvedFunction: (...args: Parameters<TFunc>) => any
      ) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.ResolveResultOf,
          resolvedFunction,
        });
      },
      thenReject: (rejectedValue: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Reject,
          rejectedValue,
        });
      },
      thenRejectResultOf: (
        rejectedFunction: (...args: Parameters<TFunc>) => any
      ) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.RejectResultOf,
          rejectedFunction,
        });
      },
    },
    isCalledWith(...args: Parameters<TFunc>) {
      return {
        thenReturn: (value: ReturnType<TFunc>) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Return,
              returnedValue: value,
            },
          });
        },
        thenReturnUnsafe: (value: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Return,
              returnedValue: value,
            },
          });
        },
        thenPreserve: () => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Preserve,
            },
          });
        },
        thenCall: (callback: (...args: Parameters<TFunc>) => any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Call,
              callback,
            },
          });
        },
        thenThrow: (error: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Throw,
              error,
            },
          });
        },
        thenReturnResultOf: (
          returnedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.ReturnResultOf,
              returnedFunction,
            },
          });
        },
        thenResolve: (resolvedValue: Awaited<ReturnType<TFunc>>) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Resolve,
              resolvedValue,
            },
          });
        },
        thenResolveUnsafe: (resolvedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Resolve,
              resolvedValue,
            },
          });
        },
        thenResolveResultOf: (
          resolvedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.ResolveResultOf,
              resolvedFunction,
            },
          });
        },
        thenReject: (rejectedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Reject,
              rejectedValue,
            },
          });
        },
        thenRejectResultOf: (
          rejectedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.RejectResultOf,
              rejectedFunction,
            },
          });
        },
      };
    },
    isCalledWithUnsafe(...args: any[]) {
      return {
        thenReturn: (value: ReturnType<TFunc>) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Return,
              returnedValue: value,
            },
          });
        },
        thenPreserve: () => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Preserve,
            },
          });
        },
        thenCall: (callback: (...args: Parameters<TFunc>) => any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Call,
              callback,
            },
          });
        },
        thenThrow: (error: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Throw,
              error,
            },
          });
        },
        thenReturnResultOf: (
          returnedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.ReturnResultOf,
              returnedFunction,
            },
          });
        },
        thenResolve: (resolvedValue: ReturnType<TFunc>) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Resolve,
              resolvedValue,
            },
          });
        },
        thenResolveUnsafe: (resolvedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Resolve,
              resolvedValue,
            },
          });
        },
        thenResolveResultOf: (
          resolvedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.ResolveResultOf,
              resolvedFunction,
            },
          });
        },
        thenReject: (rejectedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Reject,
              rejectedValue,
            },
          });
        },
        thenRejectResultOf: (
          rejectedFunction: (...args: Parameters<TFunc>) => any
        ) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.RejectResultOf,
              rejectedFunction,
            },
          });
        },
      };
    },
  };
}

when(mockFunction(original)).isCalledWith(1, 2).thenReturn(3);

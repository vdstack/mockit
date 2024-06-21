import z from "zod";
import { verifyThat } from "../assertions";
import { Mock } from "../mocks";
import { AllowZodSchemas } from "../types";
import { Behaviours } from "./behaviours";

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
      thenPreserve: () => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Preserve,
        });
      },
      thenThrow: (error: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Throw,
          error,
        });
      },
      thenResolve: (resolvedValue: Awaited<ReturnType<TFunc>>) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Resolve,
          resolvedValue,
        });
      },
      thenBehaveLike(customBehaviour: (...args: Parameters<TFunc>) => any) {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Custom,
          customBehaviour,
        });
      },
      thenReject: (rejectedValue: any) => {
        Reflect.set(mockedFunction, "defaultBehaviour", {
          kind: Behaviours.Reject,
          rejectedValue,
        });
      },
      unsafe: {
        thenReturn: (value: any) => {
          Reflect.set(mockedFunction, "defaultBehaviour", {
            kind: Behaviours.Return,
            returnedValue: value,
          });
        },
        thenResolve: (resolvedValue: any) => {
          Reflect.set(mockedFunction, "defaultBehaviour", {
            kind: Behaviours.Resolve,
            resolvedValue,
          });
        },
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
        thenPreserve: () => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Preserve,
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
        thenResolve: (resolvedValue: Awaited<ReturnType<TFunc>>) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Resolve,
              resolvedValue,
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
        unsafe: {
          thenReturn: (value: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Return,
                returnedValue: value,
              },
            });
          },
          thenResolve: (resolvedValue: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Resolve,
                resolvedValue,
              },
            });
          },
        },
      };
    },
    unsafe: {
      isCalledWith: (...args: any[]) => {
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
          thenBehaveLike(customBehaviour: (...args: Parameters<TFunc>) => any) {
            Reflect.set(mockedFunction, "newCustomBehaviour", {
              kind: Behaviours.Custom,
              args,
              customBehaviour,
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
          thenResolve: (resolvedValue: ReturnType<TFunc>) => {
            Reflect.set(mockedFunction, "newCustomBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Resolve,
                resolvedValue,
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
          unsafe: {
            thenReturn: (value: any) => {
              Reflect.set(mockedFunction, "newZodBehaviour", {
                args,
                behaviour: {
                  kind: Behaviours.Return,
                  returnedValue: value,
                },
              });
            },
            thenResolve: (resolvedValue: any) => {
              Reflect.set(mockedFunction, "newZodBehaviour", {
                args,
                behaviour: {
                  kind: Behaviours.Resolve,
                  resolvedValue,
                },
              });
            },
          },
        };
      },
    },
    zod: {
      isCalledWith: (...args: AllowZodSchemas<Parameters<TFunc>>) => {
        return {
          thenReturn: (value: ReturnType<TFunc>) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Return,
                returnedValue: value,
              },
            });
          },
          
          thenPreserve: () => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Preserve,
              },
            });
          },
          thenBehaveLike(
            customBehaviour: (
              ...args: AllowZodSchemas<Parameters<TFunc>>
            ) => any
          ) {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              kind: Behaviours.Custom,
              args,
              customBehaviour,
            });
          },
          thenThrow: (error: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Throw,
                error,
              },
            });
          },
          thenResolve: (resolvedValue: ReturnType<TFunc>) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Resolve,
                resolvedValue,
              },
            });
          },
          thenReject: (rejectedValue: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Reject,
                rejectedValue,
              },
            });
          },
          unsafe: {
            thenReturn: (value: any) => {
              Reflect.set(mockedFunction, "newZodBehaviour", {
                args,
                behaviour: {
                  kind: Behaviours.Return,
                  returnedValue: value,
                },
              });
            },
            thenResolve: (resolvedValue: any) => {
              Reflect.set(mockedFunction, "newZodBehaviour", {
                args,
                behaviour: {
                  kind: Behaviours.Resolve,
                  resolvedValue,
                },
              });
            },
          },
        };
      },
    },
  };
}


/**
 * V5 objectives
 * - Allow partial zod usage. Like this:
 *    verifyThat(myMockedFunction).zod.wasCalledWithPartial({ name: z.string(), age: 20 })
 * 
 * - Allow partial matching like jest.toMatchObject or jest.objectContaining
 *   myMockedFunction({ name: "John", age: 20 })
 *   verifyThat(myMockedFunction).wasCalledWith({ name: "John" }) // should pass
 */

export const partial = <T>(mock: Partial<NoInfer<T>>): T => {
  return new Proxy({
    ...mock,
    mockit__isPartial: true,
  }, {
    get(target, prop) {
      return target[prop]
    },
  }) as any;
};

export const schema = <T, U extends z.ZodSchema>(mock: U | NoInfer<T>): T => {
  return new Proxy({
    schema: mock,
    mockit__isZod: true,
  }, {
    get(target, prop) {
      return target[prop]
    },
  }) as T;
}

export const unsafe = <T, U>(mock: U | NoInfer<T>): T => {
  return mock as T;
};

export type NoInfer<T> = [T][T extends any ? 0 : never];

/**
 * Adapted from type-fest's PartialDeep
 */
export type PartialDeep<T> = T extends (...args: any[]) => any
  ? PartialDeepObject<T> | undefined
  : T extends object
  ? T extends ReadonlyArray<infer ItemType> // Test for arrays/tuples, per https://github.com/microsoft/TypeScript/issues/35156
    ? ItemType[] extends T // Test for arrays (non-tuples) specifically
      ? readonly ItemType[] extends T // Differentiate readonly and mutable arrays
        ? ReadonlyArray<PartialDeep<ItemType | undefined>>
        : Array<PartialDeep<ItemType | undefined>>
      : PartialDeepObject<T> // Tuples behave properly
    : PartialDeepObject<T>
  : T;

export type PartialDeepObject<ObjectType extends object> = {
  [KeyType in keyof ObjectType]?: PartialDeep<ObjectType[KeyType]>;
};

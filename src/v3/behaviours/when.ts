import { AllowZodSchemas } from "../types";
import { Behaviours } from "./behaviours";

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
          thenCall: (callback: (...args: Parameters<TFunc>) => any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Call,
                callback,
              },
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
          thenReturnResultOf: (
            returnedFunction: (...args: Parameters<TFunc>) => any
          ) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.ReturnResultOf,
                returnedFunction,
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
          thenResolveUnsafe: (resolvedValue: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
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
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.ResolveResultOf,
                resolvedFunction,
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
          thenRejectResultOf: (
            rejectedFunction: (...args: Parameters<TFunc>) => any
          ) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.RejectResultOf,
                rejectedFunction,
              },
            });
          },
        };
      },
    },
  };
}

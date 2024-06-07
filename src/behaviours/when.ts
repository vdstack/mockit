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
        thenReject: (rejectedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Reject,
              rejectedValue,
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
        thenBehaveLike(customBehaviour: (...args: Parameters<TFunc>) => any) {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            kind: Behaviours.Custom,
            args,
            customBehaviour,
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
        thenReject: (rejectedValue: any) => {
          Reflect.set(mockedFunction, "newCustomBehaviour", {
            args,
            behaviour: {
              kind: Behaviours.Reject,
              rejectedValue,
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
          thenReject: (rejectedValue: any) => {
            Reflect.set(mockedFunction, "newZodBehaviour", {
              args,
              behaviour: {
                kind: Behaviours.Reject,
                rejectedValue,
              },
            });
          },
        };
      },
    },
  };
}

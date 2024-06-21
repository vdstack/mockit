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

import { Behaviours } from "./behaviours";

/**
 * Interface for the chainable isCalled API.
 * All methods return the API itself for chaining.
 */
interface IsCalledApi<TFunc extends (...args: any[]) => any> {
  // Default behaviours
  thenReturn(value: ReturnType<TFunc>): IsCalledApi<TFunc>;
  thenThrow(error: any): IsCalledApi<TFunc>;
  thenResolve(resolvedValue: Awaited<ReturnType<TFunc>>): IsCalledApi<TFunc>;
  thenReject(rejectedValue: any): IsCalledApi<TFunc>;
  thenBehaveLike(fn: (...args: Parameters<TFunc>) => any): IsCalledApi<TFunc>;
  thenPreserve(): IsCalledApi<TFunc>;

  // Once behaviours (FIFO queue)
  thenReturnOnce(value: ReturnType<TFunc>): IsCalledApi<TFunc>;
  thenThrowOnce(error: any): IsCalledApi<TFunc>;
  thenResolveOnce(
    resolvedValue: Awaited<ReturnType<TFunc>>
  ): IsCalledApi<TFunc>;
  thenRejectOnce(rejectedValue: any): IsCalledApi<TFunc>;
  thenBehaveLikeOnce(
    fn: (...args: Parameters<TFunc>) => any
  ): IsCalledApi<TFunc>;
  thenPreserveOnce(): IsCalledApi<TFunc>;
}

export function when<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  const isCalledApi: IsCalledApi<TFunc> = {
    // Default behaviours
    thenReturn(value: ReturnType<TFunc>) {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Return,
        returnedValue: value,
      });
      return isCalledApi;
    },
    thenThrow(error: any) {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Throw,
        error,
      });
      return isCalledApi;
    },
    thenResolve(resolvedValue: Awaited<ReturnType<TFunc>>) {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Resolve,
        resolvedValue,
      });
      return isCalledApi;
    },
    thenReject(rejectedValue: any) {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Reject,
        rejectedValue,
      });
      return isCalledApi;
    },
    thenBehaveLike(customBehaviour: (...args: Parameters<TFunc>) => any) {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Custom,
        customBehaviour,
      });
      return isCalledApi;
    },
    thenPreserve() {
      Reflect.set(mockedFunction, "defaultBehaviour", {
        kind: Behaviours.Preserve,
      });
      return isCalledApi;
    },

    // Once behaviours (FIFO queue)
    thenReturnOnce(value: ReturnType<TFunc>) {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Return,
        returnedValue: value,
      });
      return isCalledApi;
    },
    thenThrowOnce(error: any) {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Throw,
        error,
      });
      return isCalledApi;
    },
    thenResolveOnce(resolvedValue: Awaited<ReturnType<TFunc>>) {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Resolve,
        resolvedValue,
      });
      return isCalledApi;
    },
    thenRejectOnce(rejectedValue: any) {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Reject,
        rejectedValue,
      });
      return isCalledApi;
    },
    thenBehaveLikeOnce(customBehaviour: (...args: Parameters<TFunc>) => any) {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Custom,
        customBehaviour,
      });
      return isCalledApi;
    },
    thenPreserveOnce() {
      Reflect.set(mockedFunction, "newOnceBehaviour", {
        kind: Behaviours.Preserve,
      });
      return isCalledApi;
    },
  };

  return {
    isCalled: isCalledApi,
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
      };
    },
  };
}

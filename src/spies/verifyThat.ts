import { spyMockedFunction } from "./mockedFunction";

import type { AllowZodSchemas } from "../types";

export function verifyThat<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  return {
    wasCalled() {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalled()) {
        throw new Error(`Function was never called.`);
      }
    },
    wasCalledWith(...args: Parameters<TFunc>) {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalledWith(...args)) {
        throw new Error(`Function was not called with parameters ${args}`);
      }
    },
    wasCalledOnce() {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalledOnce()) {
        throw new Error(`Function was not called exactly once.`);
      }
    },
    wasCalledOnceWith(...args: Parameters<TFunc>) {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalledOnceWith(...args)) {
        throw new Error(
          `Function was not called exactly once with parameters ${args}`
        );
      }
    },
    wasCalledNTimes(howMuch: number) {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalledNTimes(howMuch)) {
        throw new Error(`Function was not called exactly ${howMuch} times.`);
      }
    },
    wasCalledNTimesWith({
      args,
      howMuch,
    }: {
      howMuch: number;
      args: Parameters<TFunc>;
    }) {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasCalledNTimesWith({ args, howMuch })) {
        throw new Error(
          `Function was not called exactly ${howMuch} times with parameters ${args}`
        );
      }
    },
    wasNeverCalled() {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasNeverCalled()) {
        throw new Error(`Function was called.`);
      }
    },
    wasNeverCalledWith(...args: Parameters<TFunc>) {
      const spy = spyMockedFunction(mockedFunction);
      if (!spy.wasNeverCalledWith(...args)) {
        throw new Error(`Function was called with parameters ${args}`);
      }
    },
    unsafe: {
      wasCalledOnceWith(...args: any[]) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.unsafe.wasCalledOnceWith(...args)) {
          throw new Error(
            `Function was not called exactly once with parameters ${args}`
          );
        }
      },
      wasNeverCalledWith(...args: any[]) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.unsafe.wasNeverCalledWith(...args)) {
          throw new Error(`Function was called with parameters ${args}`);
        }
      },
      wasCalledWith(...args: any[]) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.unsafe.wasCalledWith(...args)) {
          throw new Error(`Function was not called with parameters ${args}`);
        }
      },
      wasCalledNTimesWith({ args, howMuch }: { howMuch: number; args: any[] }) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.unsafe.wasCalledNTimesWith({ args, howMuch })) {
          throw new Error(
            `Function was not called exactly ${howMuch} times with parameters ${args}`
          );
        }
      },
    },
    zod: {
      wasCalledOnceWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.zod.wasCalledOnceWith(...args)) {
          throw new Error(
            `Function was not called exactly once with parameters ${args}`
          );
        }
      },
      wasNeverCalledWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.zod.wasNeverCalledWith(...args)) {
          throw new Error(`Function was called with parameters ${args}`);
        }
      },
      wasCalledWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.zod.wasCalledWith(...args)) {
          throw new Error(`Function was not called with parameters ${args}`);
        }
      },
      wasCalledNTimesWith({
        args,
        howMuch,
      }: {
        howMuch: number;
        args: AllowZodSchemas<Parameters<TFunc>>;
      }) {
        const spy = spyMockedFunction(mockedFunction);
        if (!spy.zod.wasCalledNTimesWith({ args, howMuch })) {
          throw new Error(
            `Function was not called exactly ${howMuch} times with parameters ${args}`
          );
        }
      },
    },
  };
}

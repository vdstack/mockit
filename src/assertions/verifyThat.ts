import { getMockHistory } from "./getMockHistory";

import type { AllowZodSchemas } from "../types";

export function verifyThat<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  const mockHistory = getMockHistory(mockedFunction);
  return {
    wasCalled() {
      if (!mockHistory.wasCalled()) {
        throw new Error(`Function was never called.`);
      }
    },
    wasCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledWith(...args)) {
        throw new Error(`Function was not called with parameters ${args}`);
      }
    },
    wasCalledOnce() {
      if (!mockHistory.wasCalledOnce()) {
        throw new Error(`Function was not called exactly once.`);
      }
    },
    wasCalledOnceWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledOnceWith(...args)) {
        throw new Error(
          `Function was not called exactly once with parameters ${args}`
        );
      }
    },
    wasCalledNTimes(howMuch: number) {
      if (!mockHistory.wasCalledNTimes(howMuch)) {
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
      if (!mockHistory.wasCalledNTimesWith({ args, howMuch })) {
        throw new Error(
          `Function was not called exactly ${howMuch} times with parameters ${args}`
        );
      }
    },
    wasNeverCalled() {
      if (!mockHistory.wasNeverCalled()) {
        throw new Error(`Function was called.`);
      }
    },
    wasNeverCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasNeverCalledWith(...args)) {
        throw new Error(`Function was called with parameters ${args}`);
      }
    },
    unsafe: {
      wasCalledOnceWith(...args: any[]) {
        if (!mockHistory.unsafe.wasCalledOnceWith(...args)) {
          throw new Error(
            `Function was not called exactly once with parameters ${args}`
          );
        }
      },
      wasNeverCalledWith(...args: any[]) {
        if (!mockHistory.unsafe.wasNeverCalledWith(...args)) {
          throw new Error(`Function was called with parameters ${args}`);
        }
      },
      wasCalledWith(...args: any[]) {
        if (!mockHistory.unsafe.wasCalledWith(...args)) {
          throw new Error(`Function was not called with parameters ${args}`);
        }
      },
      wasCalledNTimesWith({ args, howMuch }: { howMuch: number; args: any[] }) {
        if (!mockHistory.unsafe.wasCalledNTimesWith({ args, howMuch })) {
          throw new Error(
            `Function was not called exactly ${howMuch} times with parameters ${args}`
          );
        }
      },
    },
    zod: {
      wasCalledOnceWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        if (!mockHistory.zod.wasCalledOnceWith(...args)) {
          throw new Error(
            `Function was not called exactly once with parameters ${args}`
          );
        }
      },
      wasNeverCalledWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        if (!mockHistory.zod.wasNeverCalledWith(...args)) {
          throw new Error(`Function was called with parameters ${args}`);
        }
      },
      wasCalledWith(...args: AllowZodSchemas<Parameters<TFunc>>) {
        if (!mockHistory.zod.wasCalledWith(...args)) {
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
        if (!mockHistory.zod.wasCalledNTimesWith({ args, howMuch })) {
          throw new Error(
            `Function was not called exactly ${howMuch} times with parameters ${args}`
          );
        }
      },
    },
  };
}

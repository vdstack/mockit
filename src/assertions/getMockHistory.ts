import { ZodSchema, z } from "zod";

import { Call, UnsafeCall } from "../types";
import { compare } from "./compare/compare";

// This spies the mocked functions only !

export function getMockHistory<T extends (...args: any[]) => any>(
  mockedFunction: T
): {
  getCalls: () => Call<T>[];
  getUnsafeCalls: () => UnsafeCall;
  wasCalledOnce(): boolean;
  wasCalledOnceWith: (...args: Parameters<T>) => boolean;
  wasCalledNTimes(howMuch: number): boolean;
  wasCalledNTimesWith: (params: {
    howMuch: number;
    args: Parameters<T>;
  }) => boolean;
  wasCalled: () => boolean;
  wasCalledWith: (...args: Parameters<T>) => boolean;
  wasNeverCalled: () => boolean;
  wasNeverCalledWith: (...args: Parameters<T>) => boolean;
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
      return calls.some((call) => compare(call.args, expectedArgs));
    },
    wasCalledNTimes: (howMuch: number) => calls.length === howMuch,
    wasCalledNTimesWith: ({
      args: expectedArgs,
      howMuch,
    }: {
      howMuch: number;
      args: Parameters<T>;
    }) => {
      return (
        calls.filter((call) => compare(call.args, expectedArgs)).length ===
        howMuch
      );
    },
    wasCalled: () => {
      return calls.length > 0;
    },
    wasCalledWith: (...expectedArgs: Parameters<T>) => {
      return calls.some((call) => compare(call.args, expectedArgs));
    },
    wasNeverCalled: () => calls.length === 0,
    wasNeverCalledWith: (...expectedArgs: Parameters<T>) => {
      return !calls.some((call) => compare(call.args, expectedArgs));
    },
  };
}

type wasUnsafe = {
  wasCalledOnceWith: (...args: any[]) => boolean;
  wasNeverCalledWith: (...args: any[]) => boolean;
  wasCalledWith: (...args: any[]) => boolean;
  wasCalledNTimesWith: (params: { howMuch: number; args: any[] }) => boolean;
};

type wasZod = {
  wasCalledOnceWith: (...args: Array<ZodSchema | any>) => boolean;
  wasNeverCalledWith: (...args: Array<ZodSchema | any>) => boolean;
  wasCalledWith: (...z: Array<ZodSchema | any>) => boolean;
  wasCalledNTimesWith: (params: {
    howMuch: number;
    args: Array<ZodSchema | any>;
  }) => boolean;
};

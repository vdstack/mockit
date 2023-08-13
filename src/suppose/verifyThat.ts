import { FunctionSpy } from "../internal";
import { MockGetters } from "../internal/functionMock/accessors";

import { parseCallsText } from "./verify";

type WasCalledFunctions<Params extends any[]> = {
  wasNeverCalled: () => void;
  wasNeverCalledWith: (...params: Params) => void;
  wasNeverCalledWithUnsafe: (...params: any[]) => void;
  wasCalledAtLeastOnce: () => void;
  wasCalledAtLeastOnceWith: (...params: Params) => void;
  wasCalledAtLeastOnceWithUnsafe: (...params: any[]) => void;
  wasCalledOnce: (...params: any[]) => void;
  wasCalledOnceWith: (...params: Params) => void;
  wasCalledOnceWithUnsafe: (...params: any[]) => void;
  wasCalledTwice: (...params: any[]) => void;
  wasCalledTwiceWith: (...params: Params) => void;
  wasCalledTwiceWithUnsafe: (...params: any[]) => void;
  wasCalledThrice: (...params: any[]) => void;
  wasCalledThriceWith: (...params: Params) => void;
  wasCalledThriceWithUnsafe: (...params: any[]) => void;
  wasCalledNTimes: (howMuch: number) => void;
  wasCalledNTimesWith: (howMuch: number, ...params: Params) => void;
  wasCalledNTimesWithUnsafe: (howMuch: number, ...params: any[]) => void;
};

/**
 *
 * This function should either: use the spy, or build upon the verify & suppositions system.
 * I don't know which one is better yet.
 */
export function verifyThat<Params extends any[], Result>(
  mock: (...args: Params) => Result
): WasCalledFunctions<Params>;
export function verifyThat<Params extends any[], Result>(
  mockedFunction: (...args: Params) => Result
): WasCalledFunctions<Params> {
  const spy = new FunctionSpy(mockedFunction);

  const calls = MockGetters(mockedFunction).callsMap;
  const functionName = MockGetters(mockedFunction).functionName;
  const callsText = parseCallsText(calls);

  const helpText =
    "Small hint: You can setup a spy and use it to access the history arguments yourself.";
  const suffix = `\n${callsText}\n\n${helpText}`;
  return {
    wasCalledAtLeastOnceWithUnsafe: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was not called with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledAtLeastOnceWith: (...params: Params) => {
      if (!spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was not called with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledAtLeastOnce: () => {
      if (!spy.wasCalled.atLeastOnce) {
        throw new Error(`Function "${functionName}" was never called.`);
      }
    },
    wasCalledOnce: () => {
      if (!spy.wasCalled.once) {
        throw new Error(
          `Function "${functionName}" was not called exactly once.${suffix}`
        );
      }
    },
    wasCalledOnceWithUnsafe: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function "${functionName}" was not called exactly once with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledOnceWith: (...params: Params) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function "${functionName}" was not called exactly once with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledTwice: () => {
      if (!spy.wasCalled.twice) {
        throw new Error(
          `Function "${functionName}" was not called exactly twice${suffix}`
        );
      }
    },
    wasCalledTwiceWithUnsafe: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function "${functionName}" was not called exactly twice with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledTwiceWith: (...params: Params) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function "${functionName}" was not called exactly twice with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledThrice: () => {
      if (!spy.wasCalled.thrice) {
        throw new Error(
          `Function "${functionName}" was not called exactly thrice${suffix}`
        );
      }
    },
    wasCalledThriceWithUnsafe: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function "${functionName}" was not called exactly thrice with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledThriceWith: (...params: Params) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function "${functionName}" was not called exactly thrice with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledNTimes: (howMuch: number) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function "${functionName}" was called not called ${howMuch} times.${suffix}`
        );
      }
    },
    wasCalledNTimesWithUnsafe: (howMuch: number, ...params: any[]) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function "${functionName}" was called ${howMuch} times.${suffix}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function "${functionName}" was not called ${howMuch} times with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasCalledNTimesWith: (howMuch: number, ...params: Params) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function "${functionName}" was called ${howMuch} times.${suffix}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function "${functionName}" was not called ${howMuch} times with parameters ${readableParams(
            params
          )}${suffix}`
        );
      }
    },
    wasNeverCalled: () => {
      if (spy.calls.length !== 0) {
        throw new Error(
          `You expected the function ${functionName} to never be called. ${suffix}`
        );
      }
    },
    wasNeverCalledWithUnsafe: (...params: any[]) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was called with parameters ${readableParams(
            params
          )}. ${suffix}`
        );
      }
    },
    wasNeverCalledWith: (...params: Params) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was called with parameters ${readableParams(
            params
          )}. ${suffix}`
        );
      }
    },
  };
}

function readableParams(params: any) {
  if (params === undefined) {
    return "no arguments";
  }

  if (params === null) {
    return "null";
  }

  return JSON.stringify(params, null, 2);
}

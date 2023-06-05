import { FunctionSpy } from "../internal";
import { MockGetters } from "../internal/functionMock/accessors";

import { parseCallsText } from "./verify";

/**
 *
 * This function should either: use the spy, or build upon the verify & suppositions system.
 * I don't know which one is better yet.
 */
export function verifyThat<Params extends any[], Result>(
  mock: (...args: Params) => Result
): {
  wasNeverCalled: () => void;
  wasNeverCalledWith: (...params: any[]) => void;
  wasNeverCalledWithSafe: (...params: Params) => void;
  wasCalledAtLeastOnce: () => void;
  wasCalledAtLeastOnceWith: (...params: any[]) => void;
  wasCalledAtLeastOnceWithSafe: (...params: Params) => void;
  wasCalledOnce: (...params: any[]) => void;
  wasCalledOnceWith: (...params: any[]) => void;
  wasCalledOnceWithSafe: (...params: Params) => void;
  wasCalledTwice: (...params: any[]) => void;
  wasCalledTwiceWith: (...params: any[]) => void;
  wasCalledTwiceWithSafe: (...params: Params) => void;
  wasCalledThrice: (...params: any[]) => void;
  wasCalledThriceWith: (...params: any[]) => void;
  wasCalledThriceWithSafe: (...params: Params) => void;
  wasCalledNTimes: (howMuch: number) => void;
  wasCalledNTimesWith: (howMuch: number, ...params: any[]) => void;
  wasCalledNTimesWithSafe: (howMuch: number, ...params: Params) => void;
};
export function verifyThat<Params extends any[], Result>(
  mockedFunction: (...args: Params) => Result
) {
  const spy = new FunctionSpy(mockedFunction);

  const calls = MockGetters(mockedFunction).callsMap;
  const functionName = MockGetters(mockedFunction).functionName;
  const callsText = parseCallsText(calls);

  const helpText =
    "Small hint: You can setup a spy and use it to access the history arguments yourself.";
  const suffix = `\n${callsText}\n\n${helpText}`;
  return {
    wasCalledAtLeastOnceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was not called with parameters ${params}${suffix}`
        );
      }
    },
    wasCalledAtLeastOnceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was not called with parameters ${params}${suffix}`
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
    wasCalledOnceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function "${functionName}" was not called exactly once with parameters ${params}${suffix}`
        );
      }
    },
    wasCalledOnceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function "${functionName}" was not called exactly once with parameters ${params}${suffix}`
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
    wasCalledTwiceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function "${functionName}" was not called exactly twice with parameters ${params}${suffix}`
        );
      }
    },
    wasCalledTwiceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function "${functionName}" was not called exactly twice with parameters ${params}${suffix}`
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
    wasCalledThriceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function "${functionName}" was not called exactly thrice with parameters ${params}${suffix}`
        );
      }
    },
    wasCalledThriceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function "${functionName}" was not called exactly thrice with parameters ${params}${suffix}`
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
    wasCalledNTimesWith: (howMuch: number, ...params: any[]) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function "${functionName}" was called ${howMuch} times.${suffix}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function "${functionName}" was not called ${howMuch} times with parameters ${params}${suffix}`
        );
      }
    },
    wasCalledNTimesWithSafe: (howMuch: number, ...params: Params) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function "${functionName}" was called ${howMuch} times.${suffix}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function "${functionName}" was not called ${howMuch} times with parameters ${params}${suffix}`
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
    wasNeverCalledWith: (...params: any[]) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was called with parameters ${params}. ${suffix}`
        );
      }
    },
    wasNeverCalledWithSafe: (...params: Params) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function "${functionName}" was called with parameters ${params}. ${suffix}`
        );
      }
    },
  };
}

// TODO: should we rework the wasCalledNTimesWith function API ?

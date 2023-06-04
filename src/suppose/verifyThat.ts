import { FunctionSpy } from "../internal";

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
  wasCalledWithSafe: (...params: Params) => void;
  wasCalledWith: (...params: any[]) => void;
  wasCalled: () => void;
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
  return {
    wasCalledWith: (...params: any[]) => {
      return spy.wasCalledWith(...params);
    },
    wasCalledWithSafe: (...params: Params) => {
      return spy.wasCalledWith(...params);
    },
    wasCalled: () => {
      if (!spy.wasCalled.atLeastOnce) {
        throw new Error(
          `Function was not called, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledOnce: () => {
      if (!spy.wasCalled.once) {
        throw new Error(
          `Function was not called exactly once, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledOnceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function was not called exactly once with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledOnceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).once) {
        throw new Error(
          `Function was not called exactly once with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledTwice: () => {
      if (!spy.wasCalled.twice) {
        throw new Error(
          `Function was not called exactly twice, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledTwiceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function was not called exactly twice with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledTwiceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).twice) {
        throw new Error(
          `Function was not called exactly twice with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledThrice: () => {
      if (!spy.wasCalled.thrice) {
        throw new Error(
          `Function was not called exactly thrice, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledThriceWith: (...params: any[]) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function was not called exactly thrice with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledThriceWithSafe: (...params: Params) => {
      if (!spy.wasCalledWith(...params).thrice) {
        throw new Error(
          `Function was not called exactly thrice with ${params}, but ${spy.calls.length} times`
        );
      }
    },
    wasCalledNTimes: (howMuch: number) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function was called ${spy.calls.length} times, expected ${howMuch}`
        );
      }
    },
    wasCalledNTimesWith: (howMuch: number, ...params: any[]) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function was called ${spy.calls.length} times, expected ${howMuch}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function was not called ${howMuch} times with ${params}`
        );
      }
    },
    wasCalledNTimesWithSafe: (howMuch: number, ...params: Params) => {
      if (spy.calls.length !== howMuch) {
        throw new Error(
          `Function was called ${spy.calls.length} times, expected ${howMuch}`
        );
      }
      if (!spy.wasCalledWith(...params).nTimes) {
        throw new Error(
          `Function was not called ${howMuch} times with ${params}`
        );
      }
    },
    wasNeverCalled: () => {
      if (spy.calls.length !== 0) {
        throw new Error(
          `Function was called ${spy.calls.length} times, expected 0`
        );
      }
    },
    wasNeverCalledWith: (...params: any[]) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function was called with ${params}, but it should not have been`
        );
      }
    },
    wasNeverCalledWithSafe: (...params: Params) => {
      if (spy.wasCalledWith(...params).atLeastOnce) {
        throw new Error(
          `Function was called with ${params}, but it should not have been`
        );
      }
    },
  };
}

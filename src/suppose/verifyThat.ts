import { FunctionSpy } from "../internal";

/**
 *
 * This function should either: use the spy, or build upon the verify & suppositions system.
 * I don't know which one is better yet.
 */
export function verifyThat<Params extends any[], Result>(
  mock: (...args: Params) => Result
): {
  wasCalledWithSafe: (...params: Params) => void;
  wasCalledWith: (...params: any[]) => void;
  wasCalled: () => void;
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
      return spy.wasCalled.atLeastOnce;
    },
  };
}

function mockedFunction(a: string, number: number) {
  return "a";
}

function test2(
  a: string,
  b: number,
  c: string,
  d: number,
  e: string,
  f: number,
  z: { x: 1 },
  g: string
) {
  return "a";
}

function test3(a: { x: number; fullName: string }, email: string) {
  return "a";
}

verifyThat(mockedFunction).wasCalledWithSafe("azezae", 1);

verifyThat(test2).wasCalledWithSafe(
  "azea",
  1,
  "azeaz",
  2,
  "azeae",
  3,
  { x: 1 },
  "hello"
);

verifyThat(test3).wasCalledWithSafe(
  {
    fullName: "azeaze",
    x: 1,
  },
  "victor"
);

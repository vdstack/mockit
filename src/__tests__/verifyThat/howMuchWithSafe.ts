/**
 * This file aims to test a more advanced usecase of Mockit's verification
 * system:
 *  - its capability to verify that a mocked function was called with
 * a specific set of arguments.
 *  - how many times it happened.
 *
 * We recommend that you use the type-safe methods like wasNeverCalledWith(),
 * or wasCalledTwiceWith(), as they will provide a better DX and help you avoid
 * regressions easily.
 *
 * In the case helpful of complex arguments that will not be executed in your specific test,
 * you might want to use the unsafe versions.
 * There is probably a problem with the code under test's testability, though.
 *
 * There is one usecase where you need to use the unsafe version: the integration with
 * the Zod library. It is temporary as we work on a better solution.
 */

import { mockFunction, verifyThat } from "../../mockit";

it("should works with safe version as well", () => {
  function hiii(a: string, b: number) {}
  const mockedFunction = mockFunction(hiii);
  mockedFunction("hello", 2222);
  verifyThat(mockedFunction).wasCalledOnceWith("hello", 2222);
  verifyThat(mockedFunction).wasCalledAtLeastOnceWith("hello", 2222);
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWith("hello", 99999)
  ).toThrow();

  mockedFunction("hello", 2222);
  verifyThat(mockedFunction).wasCalledAtLeastOnceWith("hello", 2222);
  verifyThat(mockedFunction).wasCalledTwiceWith("hello", 2222);
  expect(() =>
    verifyThat(mockedFunction).wasCalledTwiceWith("hello", 99999)
  ).toThrow();
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWith("hello", 2222)
  ).toThrow();
});

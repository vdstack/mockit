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
 * you might want to use the unsafe versions (which are the purpose of this test).
 * There is probably a problem with the code under test's testability, though.
 *
 * There is one usecase where you need to use the unsafe version: the integration with
 * the Zod library. It is temporary as we work on a better solution.
 */
import { mockFunction, verifyThat } from "../../mockit";

function hello(x: number) {
  return 2;
}

it("should allow to track calls with specific arguments", () => {
  const mockedFunction = mockFunction(hello);
  verifyThat(mockedFunction).wasNeverCalledWithUnsafe("hello", "world");
  expect(() =>
    verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe("hello", "world")
  ).toThrow();
  // @ts-expect-error We are testing the unsafe arguments on purpose
  mockedFunction("hello", "world");

  verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe("hello", "world");
  verifyThat(mockedFunction).wasCalledOnceWithUnsafe("hello", "world");
  expect(() =>
    verifyThat(mockedFunction).wasNeverCalledWithUnsafe("hello", "world")
  ).toThrow();
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe("hello")
  ).toThrow();

  // @ts-expect-error We are testing the unsafe arguments on purpose
  mockedFunction("hello", "world");
  verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe("hello", "world");
  verifyThat(mockedFunction).wasCalledTwiceWithUnsafe("hello", "world");
  expect(() =>
    verifyThat(mockedFunction).wasCalledTwiceWithUnsafe("hello")
  ).toThrow();
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe("hello", "world")
  ).toThrow();
});

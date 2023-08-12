/**
 * This file aims to test Mockit's capability to verify
 * how its mock functions were called.
 *
 * .verifyThat(mock) is an assertive function, meaning that it will actually throw
 * an error if the supposition your built within it is not passed.
 *
 * It will display an detailed error message indicating which supposition you
 * were expecting, and how the functions was actually called: it will list the arguments
 * of all the recorded calls so that you can use it in your tests.
 *
 */

import { mockFunction, verifyThat } from "../../mockit";

function hello() {
  return 2;
}

it("should be able to verify how many times a mock was called", () => {
  const mockedFunction = mockFunction(hello);
  verifyThat(mockedFunction).wasCalledNTimes(0);
  verifyThat(mockedFunction).wasNeverCalled();
  expect(() => verifyThat(mockedFunction).wasCalledAtLeastOnce()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

  mockedFunction();
  verifyThat(mockedFunction).wasCalledAtLeastOnce();
  verifyThat(mockedFunction).wasCalledOnce();
  verifyThat(mockedFunction).wasCalledNTimes(1);
  expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledNTimes(2)).toThrow();

  mockedFunction();
  verifyThat(mockedFunction).wasCalledAtLeastOnce();
  verifyThat(mockedFunction).wasCalledTwice();
  verifyThat(mockedFunction).wasCalledNTimes(2);
  expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

  mockedFunction();
  verifyThat(mockedFunction).wasCalledAtLeastOnce();
  verifyThat(mockedFunction).wasCalledThrice();
  verifyThat(mockedFunction).wasCalledNTimes(3);
  expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();

  mockedFunction();
  verifyThat(mockedFunction).wasCalledAtLeastOnce();
  verifyThat(mockedFunction).wasCalledNTimes(4);
  expect(() => verifyThat(mockedFunction).wasNeverCalled()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledOnce()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledTwice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledThrice()).toThrow();
  expect(() => verifyThat(mockedFunction).wasCalledNTimes(1)).toThrow();
});

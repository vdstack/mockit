/**
 * This file aims to test Mockit's capability to make mocked functions
 * execute a callback on execution.
 *
 * It is an advanced usecase that is not used frequently, but it can help debug
 * your tests by passing a callback that will, for example, store internal state
 * so that you can access it in your tests.
 *
 */

import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
  verifyThat,
  when,
} from "../../mockit";

function hello() {
  return 42 as const;
}

class Person {
  public hello() {
    return 42 as const;
  }
}

abstract class AbstractPerson {
  public abstract hello(): number;
}

interface IPerson {
  hello(): number;
}

type TPerson = {
  hello(): number;
};

describe("Behaviour, thenCall", () => {
  it("should trigger the callback when the mocked function is called", () => {
    const callBack = mockFunction(() => {});

    const mockkedFunc = mockFunction(hello);
    when(mockkedFunc).isCalled.thenCall(callBack);

    mockkedFunc();

    verifyThat(callBack).wasCalledOnce();
  });

  it("should work with a class method", () => {
    const callBack = mockFunction(() => {});
    const mockPerson = mock(Person);

    when(mockPerson.hello).isCalled.thenCall(callBack);
    mockPerson.hello();

    verifyThat(callBack).wasCalledOnce();
  });

  it("should work with an abstrat class method", () => {
    const callback = mockFunction(() => {});
    const mockPerson = mockAbstract(AbstractPerson, ["hello"]);

    when(mockPerson.hello).isCalled.thenCall(callback);
    mockPerson.hello();

    verifyThat(callback).wasCalledOnce();
  });

  it("should work with an interface", () => {
    const callback = mockFunction(() => {});
    const mockPerson = mockInterface<IPerson>("hello");

    when(mockPerson.hello).isCalled.thenCall(callback);
    mockPerson.hello();

    verifyThat(callback).wasCalledOnce();
  });

  it("should work with a type", () => {
    const callback = mockFunction(() => {});
    const mockPerson = mockInterface<TPerson>("hello");

    when(mockPerson.hello).isCalled.thenCall(callback);
    mockPerson.hello();

    verifyThat(callback).wasCalledOnce();
  });
});

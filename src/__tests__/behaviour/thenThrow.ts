/**
 * This file aims to test Mockit's capability to make mocked functions
 * throw exceptions on command.
 *
 * It is useful to test error cases, since you're able to manipulate dependencies
 * in ways that should theorically cascade into exception, and verify if your code
 * handles them correctly.
 */

import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
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

describe("Behaviour, thenThrow", () => {
  it("should allow to throw an error when the mocked function is called", () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenThrow(new Error("Hello world"));

    expect(() => mock()).toThrow("Hello world");
  });

  it("should work with a class method", () => {
    const mockPerson = mock(Person);
    when(mockPerson.hello).isCalled.thenThrow(new Error("Hello world"));

    expect(() => mockPerson.hello()).toThrow("Hello world");
  });

  it("should work with an abstract class method", () => {
    const mockPerson = mockAbstract(AbstractPerson, ["hello"]);
    when(mockPerson.hello).isCalled.thenThrow(new Error("Hello world"));

    expect(() => mockPerson.hello()).toThrow("Hello world");
  });

  it("should work with an interface", () => {
    const mockPerson = mockInterface<IPerson>("hello");
    when(mockPerson.hello).isCalled.thenThrow(new Error("Hello world"));

    expect(() => mockPerson.hello()).toThrow("Hello world");
  });
});

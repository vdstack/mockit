/**
 * This file aims to test Mockit's capability to make ASYNCHRONOUS
 * mocked functions reject promises on command.
 *
 * It is useful to test error cases, since you're able to manipulate dependencies
 * in ways that should theorically cascade into exception, and verify if your code
 * handles them correctly.
 *
 * Note: this file is very similar to src\__tests__\behaviour\thenReject.ts
 * but it is important to test both cases separately, since the implementation
 * is different.
 */

import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
  when,
} from "../../mockit";

async function asyncHello() {
  return 42 as const;
}

class Person {
  public async asyncHello() {
    return 42 as const;
  }
}

abstract class AbstractPerson {
  public abstract asyncHello(): Promise<number>;
}

interface IPerson {
  asyncHello(): Promise<number>;
}

type TPerson = {
  asyncHello(): Promise<number>;
};

describe("Behaviour, thenReject", () => {
  it("should allow to throw an error when the mocked function is called", () => {
    const mock = mockFunction(asyncHello);
    when(mock).isCalled.thenReject(new Error("Hello world"));

    expect(() => mock()).rejects.toThrow("Hello world");
  });

  it("should work with a class method", () => {
    const mockPerson = mock(Person);
    when(mockPerson.asyncHello).isCalled.thenReject(new Error("Hello world"));

    expect(() => mockPerson.asyncHello()).rejects.toThrow("Hello world");
  });

  it("should work with an abstract class method", () => {
    const mockPerson = mockAbstract(AbstractPerson, ["asyncHello"]);
    when(mockPerson.asyncHello).isCalled.thenReject(new Error("Hello world"));

    expect(() => mockPerson.asyncHello()).rejects.toThrow("Hello world");
  });

  it("should work with an interface", () => {
    const mockPerson = mockInterface<IPerson>("asyncHello");
    when(mockPerson.asyncHello).isCalled.thenReject(new Error("Hello world"));

    expect(() => mockPerson.asyncHello()).rejects.toThrow("Hello world");
  });

  it("should work with a type", () => {
    const mockPerson = mockInterface<TPerson>("asyncHello");
    when(mockPerson.asyncHello).isCalled.thenReject(new Error("Hello world"));

    expect(() => mockPerson.asyncHello()).rejects.toThrow("Hello world");
  });
});

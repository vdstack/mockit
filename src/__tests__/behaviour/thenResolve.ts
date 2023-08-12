/**
 * This file aims to test the capability of Mockit to control the RESOLVED value
 * of a mocked asynchronous function.
 *
 * This version .thenResolve() is type-safe, meaning it forces you to provide
 * a value of the same type as the mocked function's signature's response.
 *
 * This is quite useful to tests happy paths, as you can be sure that the mocked
 * function will resolve a value of the same type as the original function.
 *
 * It helps you to avoid the following situation:
 *  - You mock a function
 *  - You mock incorrectly but your incorrect mocks is enough to pass the test
 *  - After a while, you change the implementation of the original function
 *  - Your mock is now incorrect even though your test code was never changed.
 *
 * This is a very common situation, and it's very hard to debug, because you have
 * to find the mock that is incorrect, and neither your test runner neither your IDE
 * will help you with that, UNLESS you have a type-safe mock.
 *
 * There are cases where you don't want to use type-safe mocks, for example when
 * you want to test error cases, or when you want to test that your code handles
 * unexpected values correctly.
 *
 * In this case, you can use the .thenResolveUnsafe() method, which is not type-safe and allows
 * you to resolve any value you want.
 */

import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
  when,
} from "../../mockit";
import { Equal, Expect } from "../../utils/testing-types";

async function hello(...args: any[]) {
  return "hello world" as const;
}

async function resolveNumber() {
  return 2;
}

describe("Behaviour, type-safe thenResolve", () => {
  it("should allow to return a typesafe value", () => {
    const mock = mockFunction(hello);
    const { thenResolve } = when(mock).isCalled;
    when(mock).isCalled.thenResolve("hello world");

    /** Hello, if you've never seen this before, this is type-level testing
     * and it's pretty cool. It's a bit like unit testing, but for types.
     * Here, I want to verify that the thenResolveSafe & thenResolveSafe helpers provided by Mockit
     * are actually forcing the user to mock a type safe value.
     */
    type Assertions = [
      Expect<Equal<Parameters<typeof thenResolve>[0], "hello world">>
    ];

    expect(true).toBe(true); // This is just to avoid a warning from Jest about no tests
  });

  it("should actually resolve the desired value", () => {
    const mockedReturnNumber = mockFunction(resolveNumber);
    when(mockedReturnNumber).isCalled.thenResolve(27);

    expect(mockedReturnNumber()).resolves.toBe(27);
  });

  it("should work with a class method", () => {
    const mockPerson = mock(Person);
    when(mockPerson.hello).isCalled.thenResolve(28);

    expect(mockPerson.hello()).resolves.toBe(28);
  });

  it("should work with an interface", () => {
    interface PersonInterface {
      hello(): number;
    }
    const mockPerson = mockInterface<PersonInterface>("hello");
    when(mockPerson.hello).isCalled.thenResolve(28);

    expect(mockPerson.hello()).resolves.toBe(28);
  });

  it("should work with a type", () => {
    type PersonType = {
      hello(): number;
    };

    const mockPerson = mockInterface<PersonType>("hello");
    when(mockPerson.hello).isCalled.thenResolve(28);

    expect(mockPerson.hello()).resolves.toBe(28);
  });

  it("should work with an abstract class", () => {
    abstract class PersonAbstract {
      abstract hello(): number;
    }

    const mockPerson = mockAbstract(PersonAbstract, ["hello"]);
    when(mockPerson.hello).isCalled.thenResolve(28);

    expect(mockPerson.hello()).resolves.toBe(28);
  });
});

class Person {
  constructor() {}
  public hello() {
    return 2;
  }
}

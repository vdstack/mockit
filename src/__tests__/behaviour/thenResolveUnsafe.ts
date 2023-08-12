/**
 * This file aims to test Mockit's capability to mock unsafe RESOLVE values of mocked ASYNCHRONOUS functions.
 *
 * This version .thenResolveUnsafe() is not type-safe, meaning it allows you to provide
 * any value you want, even if it's not of the same type as the mocked function's signature's response.
 *
 * This is quite useful to test error paths, since you're able to manipulate dependencies
 * in ways that should result in errors, and verify that your code handles them correctly.
 *
 * There are cases where you want to use type-safe mocks, for example when you want to test
 * happy paths, as you can be sure that the mocked function will resolve a value of the same type
 * as the original function.
 *
 * If you need to test happy paths, you can use the .thenResolve() method, which is type-safe by default.
 *
 */

import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
  when,
} from "../../mockit";

function hello() {
  return "hello world" as const;
}

describe("Behaviour, thenResolveUnSafe", () => {
  it("should allow to return a value that does not respect the function signature", () => {
    const mock = mockFunction(hello);
    when(mock).isCalled.thenResolveUnSafe(42);
    expect(mock()).resolves.toBe(42);
  });

  it("should work with a class method", () => {
    class Test {
      public hello() {
        return "hello world";
      }
    }

    const mockedClass = mock(Test);
    when(mockedClass.hello).isCalled.thenResolveUnSafe(42);
    expect(mockedClass.hello()).resolves.toBe(42);
  });

  it("should work with an abstract class method", () => {
    abstract class Test {
      public abstract hello(): string;
    }

    const mockedClass = mockAbstract(Test, ["hello"]);
    when(mockedClass.hello).isCalled.thenResolveUnSafe(42);
    expect(mockedClass.hello()).resolves.toBe(42);
  });

  it("should work with an interface method", () => {
    interface Test {
      hello(): string;
    }

    const mockedClass = mockInterface<Test>("hello");
    when(mockedClass.hello).isCalled.thenResolveUnSafe(42);
    expect(mockedClass.hello()).resolves.toBe(42);
  });

  it("should work with a type method", () => {
    type Test = {
      hello(): string;
    };

    const mockedClass = mockInterface<Test>("hello");
    when(mockedClass.hello).isCalled.thenResolveUnSafe(42);
    expect(mockedClass.hello()).resolves.toBe(42);
  });
});

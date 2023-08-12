import { Mockit, when } from "../../mockit";

import { Equal, Expect } from "../../utils/testing-types";

it("should allow to return a typesafe value", () => {
  function hello(...args: any[]) {
    return "hello world" as const;
  }

  function asyncHello(...args: any[]) {
    return Promise.resolve("hello world" as const);
  }

  const mock = Mockit.mockFunction(hello);
  const asyncMock = Mockit.mockFunction(asyncHello);

  const { thenReturn, thenResolveSafe } = Mockit.when(mock).isCalled;
  const {
    thenReturn: thenReturnSafeAsync,
    thenResolveSafe: thenResolveSafeAsync,
  } = Mockit.when(asyncMock).isCalled;

  when(mock).isCalled.thenReturn("hello world");
  when(asyncMock);

  /** Hello, if you've never seen this before, this is type-level testing
   * and it's pretty cool. It's a bit like unit testing, but for types.
   * Here, I want to verify that the thenReturnSafe & thenResolveSafe helpers provided by Mockit
   * are actually forcing the user to mock a type safe value.
   */
  const prom = Promise.resolve("hello world" as const);
  type Assertions = [
    Expect<Equal<Parameters<typeof thenReturn>[0], "hello world">>,
    Expect<Equal<Parameters<typeof thenResolveSafe>[0], "hello world">>,
    Expect<Equal<Parameters<typeof thenReturnSafeAsync>[0], typeof prom>>,
    Expect<Equal<Parameters<typeof thenResolveSafeAsync>[0], "hello world">>
  ];

  expect(true).toBe(true);
});

it("should allow a typesafe value for isCalledWithArgs as well", () => {
  function hello(...args: any[]) {
    return "hello world" as const;
  }

  function asyncHello(...args: any[]) {
    return Promise.resolve("hello world" as const);
  }

  const mock = Mockit.mockFunction(hello);
  const asyncMock = Mockit.mockFunction(asyncHello);
  const { thenReturn, thenResolveSafe } = when(mock).isCalledWith("hello");
  const {
    thenReturn: thenReturnSafeAsync,
    thenResolveSafe: thenResolveSafeAsync,
  } = Mockit.when(asyncMock).isCalledWith("hello");

  /** Hello, if you've never seen this before, this is type-level testing
   * and it's pretty cool. It's a bit like unit testing, but for types.
   * Here, I want to verify that the thenReturnSafe & thenResolveSafe helpers provided by Mockit
   * are actually forcing the user to mock a type safe value.
   */
  const prom = Promise.resolve("hello world" as const);
  type Assertions = [
    Expect<Equal<Parameters<typeof thenReturn>[0], "hello world">>,
    Expect<Equal<Parameters<typeof thenResolveSafe>[0], "hello world">>,
    Expect<Equal<Parameters<typeof thenReturnSafeAsync>[0], typeof prom>>,
    Expect<Equal<Parameters<typeof thenResolveSafeAsync>[0], "hello world">>
  ];

  expect(true).toBe(true);
});

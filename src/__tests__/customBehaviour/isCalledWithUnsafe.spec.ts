/**
 * This file aims to test Mockit's capability to mock a function
 * and to execute custom behaviour when the function is called
 * with a specific set of arguments.
 *
 * We recommend that you use the `isCalledWith` method, which is type-safe.
 * It really helps with DX as it will help you provide valid arguments.
 *
 * In the case helpful of complex arguments that will not be executed in your specific test,
 * you might want to avoid passing real implementations.
 * For this, we created the `isCalledWithUnsafe` method.
 *
 * We still do not recommend using it, as it will not help you in the long term.
 * Usually, when you need to use isCalledWithUnsafe, it means that your code is not easily testable.
 *
 * We will not test all the .thenXXX methods here, since they all share the same mechanism
 * for setting up custom behaviour, and are tested unitarily in their respective files
 * in the defaultBehaviour test folder.
 */

import { mockFunction, when } from "../../mockit";

function hello(x: string, y: number, z: "Victor") {
  return 2;
}

describe("isCalledWithUnsafe", () => {
  it("should return the custom value if the parameters are met", () => {
    const mockedHello = mockFunction(hello);

    // Here we test that a specific set of parameters will be caught.
    when(mockedHello).isCalledWithUnsafe(2).thenReturn(22);
    // @ts-expect-error - We're passing invalid stuff on purpose here
    expect(mockedHello(2)).toEqual(22);
  });

  it("should work in tandem with default behaviour", () => {
    const mockedHello = mockFunction(hello);

    // Here we set a default behaviour AND a custom behaviour.
    when(mockedHello).isCalled.thenReturn(666);
    when(mockedHello).isCalledWithUnsafe(2).thenReturn(22);

    // The custom behaviour should be executed when the parameters are met.
    // Otherwise, the default behaviour should be executed.
    expect(mockedHello("aaaaa", 999, "Victor")).toEqual(666);
    // @ts-expect-error - We're passing invalid stuff on purpose here
    expect(mockedHello(2)).toEqual(22);
  });
});

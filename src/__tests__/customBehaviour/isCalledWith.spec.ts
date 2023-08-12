/**
 * This file aims to test Mockit's capability to mock a function
 * and to execute custom behaviour when the function is called
 * with a specific set of arguments.
 *
 * This is done by using the `isCalledWith` method.
 * It really helps with DX as it will help you provide arguments that match
 * the mocked function's signature.
 * The `isCalledWithUnsafe` method is also available if you want to pass any arguments without type-checking.
 * This can be helpful in the case of complex arguments that will not be executed in your specific test.
 * We still do not recommend using it, as it will not help you in the long term.
 *
 * This choice was made to avoid the following scenario:
 *  - You mock a function with a specific signature
 *  - You call the `isCalledWith` method with arguments that initially match the mocked function's signature
 *  - A while later, you change the mocked function's signature.
 *  - Nothing in your IDE or test runner will tell you than the arguments you passed to `isCalledWith` are no longer valid.
 *
 *
 * We will not test all the .thenXXX methods here, since they all share the same mechanism
 * for setting up custom behaviour, and are tested unitarily in their respective files
 * in the defaultBehaviour test folder.
 */

import { mockFunction, when } from "../../mockit";

function hello(x: string, y: number, z: "Victor") {
  return 2;
}

describe("isCalledWith", () => {
  it("should return the custom value if the parameters are met", () => {
    const mockedHello = mockFunction(hello);

    // Here we test that a specific set of parameters will be caught.
    when(mockedHello).isCalledWith("1", 2, "Victor").thenReturn(22);
    expect(mockedHello("1", 2, "Victor")).toEqual(22);
  });

  it("should work in tandem with default behaviour", () => {
    const mockedHello = mockFunction(hello);

    // Here we set a default behaviour AND a custom behaviour.
    when(mockedHello).isCalled.thenReturn(666);
    when(mockedHello).isCalledWith("1", 2, "Victor").thenReturn(22);

    // The custom behaviour should be executed when the parameters are met.
    // Otherwise, the default behaviour should be executed.
    expect(mockedHello("aaaaa", 999, "Victor")).toEqual(666);
    expect(mockedHello("1", 2, "Victor")).toEqual(22);
  });
});

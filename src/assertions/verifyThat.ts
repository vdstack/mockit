import { MockedFunction, MockedObject } from "../types";
import { getMockHistory } from "./getMockHistory";

/**
 * Returns a list of assertion methods on the behaviour of a mocked function.
 * @param mockedFunction the mocked function whose behaviour you want to assert on
 * @returns nothing: this function will throw an error if the assertion fails
 *
 * @example
 * ```ts
 * function myFunction(...args: any[]) { return; }
 *
 * const mock = Mock(myFunction);
 *
 * verifyThat(mock).wasNeverCalled();

 * mock("hello", "world");
 * mock(1, 22, 333, 4444);
 *
 * verifyThat(mock).wasCalled();
 * verifyThat(mock).wasCalledWith("hello", "world");
 * verifyThat(mock).wasCalledWith(1, 22, 333, 4444);
 * verifyThat(mock).wasNeverCalledWith(777);
 * ```
 */
export function verifyThat<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  const mockHistory = getMockHistory(mockedFunction);
  return {
    /**
     * Asserts that the mocked function was called at least once.
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     * mock();
     * verifyThat(mock).wasCalled();
     * ```
     */
    wasCalled() {
      if (!mockHistory.wasCalled()) {
        throw new Error(`Function was never called.`);
      }
    },
    /**
     * Asserts that the mocked function was called with the specified arguments.
     * @param args the arguments that the mocked function should have been called with
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * mock("hello", "world");
     *
     * verifyThat(mock).wasCalledWith("hello", "world");
     * ```
     */
    wasCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledWith(...args)) {
        throw new Error(`Function was not called with parameters ${args}`);
      }
    },
    /**
     * Asserts that the mocked function was called exactly once.
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * mock();
     *
     * verifyThat(mock).wasCalledOnce();
     *
     * mock();
     *
     * // this will throw an error
     * verifyThat(mock).wasCalledOnce();
     * ```
     */
    wasCalledOnce() {
      if (!mockHistory.wasCalledOnce()) {
        throw new Error(`Function was not called exactly once.`);
      }
    },
    /**
     * Asserts that the mocked function was called exactly once with the specified arguments.
     * @param args the arguments that the mocked function should have been called with
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * mock("hello", "world");
     *
     * verifyThat(mock).wasCalledOnceWith("hello", "world");
     * ```
     */
    wasCalledOnceWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledOnceWith(...args)) {
        throw new Error(
          `Function was not called exactly once with parameters ${args}`
        );
      }
    },
    /**
     * Asserts that the mocked function was called exactly n times.
     * @param howMuch the number of times the mocked function should have been called
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * mock();
     * mock();
     *
     * verifyThat(mock).wasCalledNTimes(2);
     *
     * mock();
     *
     * // this will throw an error
     * verifyThat(mock).wasCalledNTimes(2);
     * ```
     */
    wasCalledNTimes(howMuch: number) {
      if (!mockHistory.wasCalledNTimes(howMuch)) {
        throw new Error(`Function was not called exactly ${howMuch} times.`);
      }
    },
    /**
     * Asserts that the mocked function was called exactly n times with the specified arguments.
     * @param howMuch the number of times the mocked function should have been called
     * @param args the arguments that the mocked function should have been called with
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * mock("hello", "world");
     *
     * verifyThat(mock).wasCalledNTimesWith({ args: ["hello", "world"], howMuch: 1 });
     *
     * mock("hello", "world");
     * mock("hello", "world");
     *
     * verifyThat(mock).wasCalledNTimesWith({ args: ["hello", "world"], howMuch: 3 });
     */
    wasCalledNTimesWith({
      args,
      howMuch,
    }: {
      howMuch: number;
      args: Parameters<TFunc>;
    }) {
      if (!mockHistory.wasCalledNTimesWith({ args, howMuch })) {
        throw new Error(
          `Function was not called exactly ${howMuch} times with parameters ${args}`
        );
      }
    },
    /**
     * Asserts that the mocked function was never called.
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * verifyThat(mock).wasNeverCalled();
     *
     * mock();
     *
     * // this will throw an error
     * verifyThat(mock).wasNeverCalled();
     * ```
     */
    wasNeverCalled() {
      if (!mockHistory.wasNeverCalled()) {
        throw new Error(`Function was called.`);
      }
    },

    /**
     * Asserts that the mocked function was never called with the specified arguments.
     * @param args the arguments that the mocked function should not have been called with
     * @returns nothing: this function will throw an error if the assertion fails
     * @example
     * ```ts
     * function myFunction(...args: any[]) { return; }
     *
     * const mock = Mock(myFunction);
     *
     * verifyThat(mock).wasNeverCalledWith("hello", "world");
     *
     * mock("hello", "world");
     *
     * // this will throw an error
     * verifyThat(mock).wasNeverCalledWith("hello", "world");
     * ```
     */
    wasNeverCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasNeverCalledWith(...args)) {
        throw new Error(`Function was called with parameters ${args}`);
      }
    },
  };
}

export function then<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  return verifyThat(mockedFunction);
}

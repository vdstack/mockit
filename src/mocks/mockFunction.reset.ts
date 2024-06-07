/**
 * This file contains the reset functions dedicated to the mockFunction proxy object.
 * It does not contain much logic, because it gives orders via the Reflect.set method.
 * The implementation of the reset is located in the mockFunction file.
 */

/**
 * Reset the history of calls of the mocked function.
 * It does not reset the default, custom and zod-based behaviours.
 * @param mocks any number of mocked functions to reset the history of
 */
export function resetHistory(...mocks: any[]) {
  for (const mock of mocks) {
    Reflect.set(mock, "resetHistory", []);
  }
}

/**
 * Resets any default, custom and zod-based behaviours of the mocked function.
 * The mocked function will then return undefined.
 * It does not reset the history of calls.
 * @param mocks any number of mocked functions to reset the behaviour of
 */
export function resetBehaviour(...mocks: any) {
  for (const mock of mocks) {
    Reflect.set(mock, "resetBehaviour", []);
  }
}

/**
 * Resets the history of calls and any default, custom and zod-based behaviours of the mocked function.
 * The mocked function will then return undefined and have an empty history.
 * @param mocks any number of mocked functions to reset the behaviour and history of
 */
export function resetCompletely(...mocks: any[]) {
  for (const mock of mocks) {
    resetBehaviour(mock);
    resetHistory(mock);
  }
}

export const Reset = {
  behaviourOf: resetBehaviour,
  historyOf: resetHistory,
  completely: resetCompletely,
};

import { Call } from "../types";

/**
 * Chainable methods available on mocked functions (Jest-style API).
 * All methods return the mock itself to enable chaining.
 */
export interface MockFunctionMethods<T extends (...args: any[]) => any> {
  // Default behavior setters
  mockReturnValue(value: ReturnType<T>): MockedFunction<T>;
  mockThrow(error: any): MockedFunction<T>;
  mockResolvedValue(value: Awaited<ReturnType<T>>): MockedFunction<T>;
  mockRejectedValue(value: any): MockedFunction<T>;
  mockImplementation(
    fn: (...args: Parameters<T>) => ReturnType<T>
  ): MockedFunction<T>;
  mockReturnThis(): MockedFunction<T>;

  // Once behaviors (FIFO queue, then fallback to default)
  mockReturnValueOnce(value: ReturnType<T>): MockedFunction<T>;
  mockResolvedValueOnce(value: Awaited<ReturnType<T>>): MockedFunction<T>;
  mockRejectedValueOnce(value: any): MockedFunction<T>;
  mockImplementationOnce(
    fn: (...args: Parameters<T>) => ReturnType<T>
  ): MockedFunction<T>;
  mockThrowOnce(error: any): MockedFunction<T>;

  // Reset methods
  mockClear(): MockedFunction<T>; // Clears call history
  mockReset(): MockedFunction<T>; // Clears history + behaviors
  mockRestore(): MockedFunction<T>; // Clears + restores original

  // Naming (for debugging)
  mockName(name: string): MockedFunction<T>;
  getMockName(): string;

  // Existing mockit properties
  readonly calls: Call<T>[];
  readonly lastCall: Parameters<T> | undefined;
  readonly isMockitMock: true;
}

/**
 * A mocked function: the original function signature intersected with mock methods.
 * This allows the mock to be used anywhere the original function is expected,
 * while also providing the mock configuration methods.
 */
export type MockedFunction<T extends (...args: any[]) => any> = T &
  MockFunctionMethods<T>;

/**
 * A mocked object where each method is a MockedFunction.
 */
export type MockedObject<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K];
};

import { Call } from "../types";

/**
 * Options for configuring a mock function at creation time.
 * This is a discriminated union - only one behavior can be set at a time.
 */
export type FnOptions<T extends (...args: any[]) => any> =
  | { returns: ReturnType<T> }
  | { resolves: Awaited<ReturnType<T>> }
  | { rejects: any }
  | { throws: any }
  | { calls: (...args: Parameters<T>) => ReturnType<T> };

/**
 * Configuration for object/class/interface mocks.
 * Maps method names to their FnOptions configuration.
 * Only methods (functions) can be configured, not regular properties.
 */
export type ObjectConfig<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? K
    : never]?: T[K] extends (...args: any[]) => any ? FnOptions<T[K]> : never;
};

/**
 * Chainable methods available on mocked functions (Jest-style API).
 * All methods return the mock itself to enable chaining.
 */
export interface MockFunctionMethods<T extends (...args: any[]) => any> {
  // Default behavior setters
  mockReturnValue(value: ReturnType<T>): MockedFunction<T>;
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

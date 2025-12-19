import { AbstractClass, Class } from "../types";
import { mockFunction } from "./mockFunction";
import { resetBehaviourOf, resetHistoryOf } from "./mockFunction.reset";
import {
  FnOptions,
  ObjectConfig,
  MockedFunction,
  MockedObject,
} from "../types/inline-api.types";
import { optionsToBehaviour } from "../behaviours/helpers";

/**
 * Creates a standalone mock function, similar to jest.fn().
 * Accepts an optional implementation function.
 * @example
 * ```ts
 * const fn = fn();
 * fn.mockReturnValue(42);
 * fn(); // returns 42
 *
 * // With implementation
 * const fn2 = fn((x: number) => x * 2);
 * fn2(5); // returns 10
 * ```
 */
export function fn<T extends (...args: any[]) => any = (...args: any[]) => any>(
  implementation?: T
): MockedFunction<T> {
  const mock = mockFunction(() => {}) as MockedFunction<T>;
  if (implementation) {
    mock.mockImplementation(implementation);
  }
  return mock;
}

/**
 * Creates a mock of a function with optional configuration.
 * @example
 * ```ts
 * const fn = Mock(someFunc, { returns: 42 });
 * fn.mockReturnValueOnce(1).mockReturnValue(99);
 * ```
 */
export function Mock<T extends (...args: any[]) => any>(
  fn: T,
  options: FnOptions<T>
): MockedFunction<T>;

/**
 * Creates a mock of a function.
 * @example
 * ```ts
 * const fn = Mock(someFunc);
 * fn.mockReturnValue(42);
 * ```
 */
export function Mock<T extends (...args: any[]) => any>(
  fn: T
): MockedFunction<T>;

/**
 * Creates a mock of a class with optional method configuration.
 * @example
 * ```ts
 * const mock = Mock(UserService, { getUser: { returns: userData } });
 * ```
 */
export function Mock<T>(
  classRef: Class<T> | AbstractClass<T>,
  config: ObjectConfig<T>
): MockedObject<T>;

/**
 * Creates a mock of a class.
 * @example
 * ```ts
 * const mock = Mock(UserService);
 * ```
 */
export function Mock<T>(classRef: Class<T> | AbstractClass<T>): MockedObject<T>;

/**
 * Creates a mock from a plain object.
 * @example
 * ```ts
 * const mock = Mock({ getUser: () => user });
 * ```
 */
export function Mock<T extends object>(obj: T): MockedObject<T>;

/**
 * Creates a mock from a type/interface with optional method configuration.
 * @example
 * ```ts
 * const mock = Mock<UserService>({ getUser: { returns: userData } });
 * ```
 */
export function Mock<T>(config: ObjectConfig<T>): MockedObject<T>;

/**
 * Creates a mock from a type/interface.
 * @example
 * ```ts
 * const mock = Mock<UserService>();
 * ```
 */
export function Mock<T>(): MockedObject<T>;

/**
 * Implementation that handles all overloads.
 */
export function Mock<T>(_param?: any, _options?: any): T {
  // Case: Mock<Type>() - no arguments, create object mock
  if (_param === undefined) {
    return ProxyMockBase<T>();
  }

  // Case: Mock<Type>({ config }) - first param is an ObjectConfig
  if (isObjectConfig(_param)) {
    return ProxyMockBase<T>(undefined, _param as ObjectConfig<T>);
  }

  // Case: function or class
  if (typeof _param === "function") {
    if (isClass(_param)) {
      // Class or Abstract Class with optional config
      return ProxyMockBase<T>(_param, _options as ObjectConfig<T> | undefined);
    }

    // Regular function with optional FnOptions
    if (_options) {
      const behaviour = optionsToBehaviour(_options as FnOptions<any>);
      return mockFunction(_param, { defaultBehaviour: behaviour }) as T;
    }
    return mockFunction(_param) as T;
  }

  // Case: plain object
  return ProxyMockBase<T>(_param);
}

/**
 * Checks if a value looks like an ObjectConfig (method configs).
 * ObjectConfig values are objects with { returns, resolves, rejects, throws, calls }.
 */
function isObjectConfig(value: any): boolean {
  if (typeof value !== "object" || value === null) return false;

  const configKeys = ["returns", "resolves", "rejects", "throws", "calls"];

  // Check if any value in the object is a config-like object
  return Object.values(value).some(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      configKeys.some((key) => key in (v as object))
  );
}

function ProxyMockBase<T>(
  _param: Class<T> | AbstractClass<T> | T | void = undefined,
  config?: ObjectConfig<T>
): T {
  // Pre-create mocked functions for configured methods
  const preconfiguredMethods: Record<string, any> = {};

  if (config) {
    for (const [methodName, methodConfig] of Object.entries(config)) {
      if (methodConfig) {
        const behaviour = optionsToBehaviour(methodConfig as FnOptions<any>);
        preconfiguredMethods[methodName] = mockFunction(() => {}, {
          defaultBehaviour: behaviour,
        });
      }
    }
  }

  return new Proxy({} as any, {
    get(target, prop, receiver) {
      // Check preconfigured methods first
      if (typeof prop === "string" && prop in preconfiguredMethods) {
        if (!(prop in target)) {
          Reflect.set(target, prop, preconfiguredMethods[prop], receiver);
        }
        return preconfiguredMethods[prop];
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      if (typeof prop === "string") {
        const mockedFn = mockFunction(() => {});
        Reflect.set(target, prop, mockedFn, receiver);
        return mockedFn;
      }
    },
    set(target, prop, _value, _receiver) {
      if (prop === "resetBehaviourOf") {
        for (const key in target) {
          if (Reflect.get(target[key], "isMockitMock")) {
            resetBehaviourOf(target[key]);
          }
        }
        return true;
      }

      if (prop === "resetHistoryOf") {
        for (const key in target) {
          if (Reflect.get(target[key], "isMockitMock")) {
            resetHistoryOf(target[key]);
          }
        }
        return true;
      }

      return false;
    },
  }) as T;
}

// Source: https://stackoverflow.com/questions/30758961/how-to-check-if-a-variable-is-an-es6-class-declaration
// is "class" or "function"?
function isClass(obj: Function) {
  // if not a function, return false.
  if (typeof obj !== "function") return false;

  // ⭐ is a function, has a `prototype`, and can't be deleted!

  // ⭐ although a function's prototype is writable (can be reassigned),
  //   it's not configurable (can't update property flags), so it
  //   will remain writable.
  //
  // ⭐ a class's prototype is non-writable.
  //
  // Table: property flags of function/class prototype
  // ---------------------------------
  //   prototype  write  enum  config
  // ---------------------------------
  //   function     v      .      .
  //   class        .      .      .
  // ---------------------------------
  const descriptor = Object.getOwnPropertyDescriptor(obj, "prototype");

  // ❗functions like `Promise.resolve` do have NO `prototype`.
  //   (I have no idea why this is happening, sorry.)
  if (!descriptor) return false;

  return !descriptor.writable;
}

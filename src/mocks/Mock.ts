import { AbstractClass, Class } from "../types";
import { mockFunction } from "./mockFunction";
import { resetBehaviourOf, resetHistoryOf } from "./mockFunction.reset";
import { MockedFunction, MockedObject } from "../types/inline-api.types";
import { NoInfer } from "../behaviours/matchers";

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

export function stubReturning<T>(value: T): () => T {
  return fn().mockReturnValue(value);
}

export function stubThrowing<T>(error: any): () => T {
  return fn().mockThrow(error);
}

export function stubResolving<T>(value: T): () => Promise<T> {
  return fn().mockResolvedValue(value);
}

export function stubRejecting<T>(error: any): () => Promise<T> {
  return fn().mockRejectedValue(error);
}

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
 * Creates a mock of a class.
 * @example
 * ```ts
 * const mock = Mock(UserService);
 * ```
 */
export function Mock<T>(classRef: Class<T> | AbstractClass<T>, partial?: Partial<NoInfer<T>>): MockedObject<T>;

/**
 * Creates a mock from a plain object.
 * @example
 * ```ts
 * const mock = Mock({ getUser: () => user });
 * ```
 */
export function Mock<T extends object>(obj: T): MockedObject<T>;

/**
 * Creates a mock from a type/interface.
 * @example
 * ```ts
 * const mock = Mock<UserService>();
 * ```
 */
export function Mock<T>(partial?: Partial<NoInfer<T>>): MockedObject<T>;

/**
 * Implementation that handles all overloads.
 */
export function Mock<T>(_param?: any): T {
  // Case: Mock<Type>() - no arguments, create object mock
  if (_param === undefined) {
    return ProxyMockBase<T>();
  }

  // Case: function or class
  if (typeof _param === "function") {
    if (isClass(_param)) {
      // Class or Abstract Class
      return ProxyMockBase<T>(_param);
    }

    // Regular function
    return mockFunction(_param) as T;
  }

  // Case: plain object
  return ProxyMockBase<T>(_param);
}

function ProxyMockBase<T>(
  _param: Class<T> | AbstractClass<T> | T | void = undefined
): T {
  const target: any = {};

  // If _param is a plain object, only copy properties that are already mock functions
  // This allows Mock<Type>({ get: m.resolves(42) }) while keeping Mock(realObject) behavior
  if (_param && typeof _param === "object") {
    for (const key of Object.keys(_param)) {
      const value = (_param as any)[key];
      if (value && value.isMockitMock) {
        target[key] = value;
      }
    }
  }

  return new Proxy(target, {
    get(target, prop, receiver) {
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

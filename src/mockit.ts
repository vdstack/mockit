import { z } from "zod";

import {
  Behaviour,
  FunctionMock,
  FunctionMockUtils,
  FunctionSpy,
} from "./internal";

import {
  AbstractClassMock,
  ConcreteClassMock,
  InterfaceClassMock,
  type AbstractClass,
  type Class,
} from "./classMocks";

import { suppose } from "./suppose";
import { verify } from "./suppose/verify";
import { verifyThat } from "./suppose/verifyThat";

import { Reset } from "./reset";

export function mockAbstract<T>(
  _original: AbstractClass<T>, // it's here to activate the generic type
  propertiesToMock: Array<keyof T>
): T {
  return new AbstractClassMock<T>(propertiesToMock) as T;
}

export function mock<T>(_original: Class<T>): T {
  return new ConcreteClassMock<T>(_original) as T;
}

function generateRandomFunctionName() {
  return `mockedFunction${Math.random().toString().slice(2)}`;
}

export function mockFunction<T extends (...args: any[]) => any>(
  original: T
): T {
  return FunctionMock(
    original.name.length ? original.name : generateRandomFunctionName(),
    original
  ) as T;
}

export function mockInterface<T>(...functionsToMock: Array<keyof T>): T {
  const mock = new InterfaceClassMock(functionsToMock as string[]);
  return mock as T;
}

export function when<TFunc extends (...args: any[]) => any>(method: TFunc) {
  return {
    /**
     * This function sets up the behaviour of the mocked method.
     * If the mocked method is called with parameters that are not setup for custom behaviour, this will be the default behaviour
     */
    get isCalled() {
      const utils = new FunctionMockUtils<TFunc>(method);
      return utils.defaultBehaviourController();
    },
    isCalledWithUnsafe(...args: any[]) {
      const utils = new FunctionMockUtils<TFunc>(method);
      return utils.callController(...args);
    },
    isCalledWith(...args: Parameters<TFunc>) {
      const utils = new FunctionMockUtils<TFunc>(method);
      return utils.callController(...args);
    },
  };
}

export { suppose, verify, verifyThat, Reset };
export { Behaviour };

export function spy<T extends (...args: any[]) => any>(
  mockedFunctionInstance: T
) {
  // Here, you should provide a FunctionMock instance, not a real function
  // This generic type is here to make it look like it accepts a real function
  return new FunctionSpy(mockedFunctionInstance);
}

export class Mockit {
  static Behaviours = Behaviour;

  /**
   * @param original abstract class to mock
   * @param propertiesToMock list of properties that
   * will be mocked. If not provided, all properties
   * will be undefined.
   * It's required because we cannot dynamically access abstract properties.
   * (they're not compiled in the JS code)
   */
  static mockAbstract<T>(
    _original: AbstractClass<T>, // it's here to activate the generic type
    propertiesToMock: Array<keyof T>
  ): T {
    return mockAbstract(_original, propertiesToMock);
  }

  static when<TFunc extends (...args: any[]) => any>(method: TFunc) {
    return when<TFunc>(method);
  }

  static mock<T>(_original: Class<T>): T {
    return mock(_original);
  }

  static mockInterface<T>(...functionsToMock: Array<keyof T>): T {
    return mockInterface(...functionsToMock);
  }

  static mockFunction<T extends (...args: any[]) => any>(original: T): T {
    return mockFunction(original);
  }

  static spy<T extends (...args: any[]) => any>(mockedFunctionInstance: T) {
    // Here, you should provide a FunctionMock instance, not a real function
    // This generic type is here to make it look like it accepts a real function
    return spy(mockedFunctionInstance);
  }

  static suppose = suppose;
  static verify = verify;
  static verifyThat = verifyThat;
  static reset = Reset;
}

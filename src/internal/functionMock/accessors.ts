import { SuppositionRegistry } from "../../suppose";
import { HashingMap } from "../../utils/HashingMap";
import { Call, FunctionCalls } from "../functionSpy";

import { type NewBehaviourParam } from "./behaviour";

/**
 * This function extracts the mockMap from the proxy's target
 * @param target the proxy's target
 */
function getMocksMap(target: any) {
  const mockMap: HashingMap = Reflect.get(target, "mockMap");
  if (!mockMap) {
    throw new Error("The target is not a mock");
  }

  return mockMap;
}

/**
 * This function extracts the callsMap from the proxy's target
 * It is used by the spy to access and manipulates the map between arguments and calls
 * @param target the proxy's target
 * @returns the callsMap from the proxy's target
 */
function getCallsMap(target: any) {
  const callsMap: FunctionCalls = Reflect.get(target, "callsMap");
  if (!callsMap) {
    throw new Error("The target is not a mock");
  }

  return callsMap;
}

function getDefaultBehaviour(target: any) {
  const defaultBehaviour: NewBehaviourParam = Reflect.get(
    target,
    "defaultBehaviour"
  );
  if (!defaultBehaviour) {
    throw new Error("The target is not a mock");
  }

  return defaultBehaviour;
}

function getCalls(target: any) {
  const calls: Call[] = Reflect.get(target, "calls");
  if (!calls) {
    throw new Error("The target is not a mock");
  }

  return calls;
}

function getFunctionName(target: any) {
  const functionName: string = Reflect.get(target, "functionName");
  if (!functionName) {
    throw new Error("The target is not a mock");
  }

  return functionName;
}

function getSuppositionsRegistry(target: any) {
  const suppositionsRegistry: SuppositionRegistry = Reflect.get(
    target,
    "suppositionsRegistry"
  );

  // Not throwing an error here because the suppositionsRegistry is optional
  // And we're using its absence to know if requested target is a mock or not

  return suppositionsRegistry;
}

/**
 * This function is here to abstract the Reflect.get API calls from the rest of the code.
 * @param mock The mock to extract information from
 * @returns A list of getters from which you can access data from the mock, in a more readable way
 * and with types to help you.
 */
export function MockGetters(mock: any) {
  return {
    get defaultBehaviour() {
      return getDefaultBehaviour(mock);
    },
    get callsMap() {
      return getCallsMap(mock);
    },
    get mockMap() {
      return getMocksMap(mock);
    },
    get calls() {
      return getCalls(mock);
    },
    get functionName() {
      return getFunctionName(mock);
    },
    get suppositionsRegistry() {
      return getSuppositionsRegistry(mock);
    },
  };
}

export function setMockMap(target: any, mockMap: HashingMap) {
  Reflect.set(target, "mockMap", mockMap);
}

export function setCallsMap(target: any, callsMap: FunctionCalls) {
  Reflect.set(target, "callsMap", callsMap);
}

export function setCalls(target: any, callsMap: Call[]) {
  Reflect.set(target, "calls", callsMap);
}

export function setFunctionName(target: any, functionName: string) {
  Reflect.set(target, "functionName", functionName);
}

export function setSuppositionsRegistry(
  target: any,
  suppositionsRegistry: SuppositionRegistry
) {
  Reflect.set(target, "suppositionsRegistry", suppositionsRegistry);
}

export function setDefaultBehaviour(
  target: any,
  defaultBehaviour: NewBehaviourParam
) {
  Reflect.set(target, "defaultBehaviour", defaultBehaviour);
}

export function registerNewCustomBehaviour(
  target: any,
  params: {
    behaviour: NewBehaviourParam;
    args: any[];
  }
) {
  Reflect.set(target, "newCustomBehaviour", {
    customBehaviour: params.behaviour,
    args: params.args,
  });
}

export function MockSetters(mock: any) {
  return {
    set mockMap(mockMap: HashingMap) {
      setMockMap(mock, mockMap);
    },
    set callsMap(callsMap: FunctionCalls) {
      setCallsMap(mock, callsMap);
    },
    set calls(calls: Call[]) {
      setCalls(mock, calls);
    },
    set functionName(functionName: string) {
      setFunctionName(mock, functionName);
    },
    set suppositionsRegistry(suppositionsRegistry: SuppositionRegistry) {
      setSuppositionsRegistry(mock, suppositionsRegistry);
    },
    set defaultBehaviour(defaultBehaviour: NewBehaviourParam) {
      setDefaultBehaviour(mock, defaultBehaviour);
    },
    registerNewCustomBehaviour(params: {
      behaviour: NewBehaviourParam;
      args: any[];
    }) {
      registerNewCustomBehaviour(mock, params);
    },
  };
}

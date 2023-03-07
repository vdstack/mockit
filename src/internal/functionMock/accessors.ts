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
    "suppositionsMap"
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

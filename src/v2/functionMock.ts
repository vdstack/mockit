import { Behaviour, NewBehaviourParam } from "../types/behaviour";

export const Behaviours = {
  Return: "Return",
  Throw: "Throw",
  Call: "Call",
  Resolve: "Resolve",
  Reject: "Reject",
} as const;

export type BehaviourType = typeof Behaviours[keyof typeof Behaviours];

export function FunctionMock(functionName: string) {
  const proxy = new Proxy(() => {}, {
    apply: function (_target, _thisArg, argumentsList) {
      const behaviour: NewBehaviourParam = Reflect.get(
        _target,
        "defaultBehaviour"
      );

      switch (behaviour.behaviour) {
        case Behaviour.Return:
          return behaviour.returnedValue;
        case Behaviour.Throw:
          throw behaviour.error;
        case Behaviour.Call:
          return behaviour.callback(...argumentsList);
        case Behaviour.Resolve:
          return Promise.resolve(behaviour.resolvedValue);
        case Behaviour.Reject:
          return Promise.reject(behaviour.rejectedValue);
        default:
          throw new Error("Mock logic not implemented yet");
      }
    },

    get: function (target, prop, _receiver) {
      return Reflect.get(target, "functionName");
    },

    set: function (target, prop, newValue, receiver) {
      if (prop === "init") {
        Reflect.set(target, "defaultBehaviour", newValue.defaultBehaviour);
        Reflect.set(target, "calls", []);
        Reflect.set(target, "functionName", newValue.functionName);
        return true;
      }

      // this will list authorized properties
      switch (prop) {
        case "defaultBehaviour":
        case "calls":
        case "functionName": {
          Reflect.set(target, prop, newValue);
          break;
        }
        default:
          throw new Error("Unauthorized property");
      }

      return;
    },
  });

  initializeProxy(proxy, functionName);
  return proxy;
}

const defaultBehaviour: NewBehaviourParam = {
  behaviour: Behaviour.Return,
  returnedValue: undefined,
};

export function initializeProxy(proxy: any, functionName: string) {
  Reflect.set(proxy, "init", {
    defaultBehaviour,
    functionName,
    calls: [],
  });
}

export function changeDefaultBehaviour(
  proxy: any,
  newBehaviour: NewBehaviourParam
) {
  Reflect.set(proxy, "defaultBehaviour", newBehaviour);
}

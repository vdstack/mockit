import { HashingMap } from "../HashingMap";
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
      // Checking if there is a custom behaviour for this call
      const mockMap: HashingMap = Reflect.get(_target, "mockMap");

      const behaviourWithTheseArguments = mockMap.get(argumentsList) as {
        calls: any[];
        customBehaviour: NewBehaviourParam;
      };

      let behaviour = behaviourWithTheseArguments?.customBehaviour;

      // Default behaviour
      if (!behaviour) {
        behaviour = Reflect.get(_target, "defaultBehaviour");
      }

      // Adding the call to the list of calls, for the spy
      const calls = Reflect.get(_target, "calls");
      calls.push({
        args: argumentsList,
        behaviour,
      });

      const callsMap: FunctionCalls = Reflect.get(_target, "callsMap");
      callsMap.registerCall(argumentsList, behaviour);
      Reflect.set(_target, "callsMap", callsMap);

      Reflect.set(_target, "calls", calls);

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
      switch (prop) {
        case "calls":
        case "defaultBehaviour":
        case "functionName":
          return Reflect.get(target, prop);
        case "mockMap":
          const mockMap = Reflect.get(target, "mockMap") as HashingMap;
          return mockMap;
        case "callsMap":
          const callsMap = Reflect.get(target, "callsMap") as FunctionCalls;
          return callsMap;
        default:
          throw new Error("Unauthorized property");
      }
    },

    set: function (target, prop, newValue, receiver) {
      if (prop === "init") {
        Reflect.set(target, "defaultBehaviour", newValue.defaultBehaviour);
        Reflect.set(target, "calls", []);
        Reflect.set(target, "functionName", newValue.functionName);
        Reflect.set(target, "mockMap", newValue.mockMap);
        Reflect.set(target, "callsMap", newValue.callsMap);
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
        case "newCustomBehaviour": {
          const { args, customBehaviour } = newValue as {
            args: any[];
            customBehaviour: NewBehaviourParam;
          };

          const mockMap: HashingMap = Reflect.get(target, "mockMap");
          const existingCustomBehaviour = mockMap.get(args) as {
            calls: any[];
            customBehaviour: NewBehaviourParam;
          };
          mockMap.set(args, {
            customBehaviour,
            calls: existingCustomBehaviour?.calls ?? [],
            // This is important to keep track of calls in case of multiple behaviours
          });
          break;
        }
        default:
          throw new Error("Unauthorized property");
      }

      return;
    },
  });

  new FunctionMockUtils(proxy).initialize(functionName);
  return proxy;
}

const defaultBehaviour: NewBehaviourParam = {
  behaviour: Behaviour.Return,
  returnedValue: undefined,
};

type Call = {
  behaviour: NewBehaviourParam;
};

export class FunctionCalls {
  private calls: HashingMap = new HashingMap();
  constructor() {}

  public registerCall(args: any[], behaviour: NewBehaviourParam) {
    const existingCalls = (this.calls.get(args) ?? []) as Call[];
    this.calls.set(args, existingCalls.concat({ behaviour }));
  }

  public hasBeenCalledWith(...args: any[]) {
    return this.calls.has(args);
  }

  public hasBeenCalledNTimesWith(n: number, ...args: any[]) {
    const calls = this.calls.get<Call[] | undefined>(args);
    return calls?.length === n;
  }

  public getCalls(): Call[] {
    // Remember, the values are arrays of call for each args combination
    // So we need to flatten them
    return this.calls.values<Call[]>().flat();
  }
}

export function initializeProxy(proxy: any, functionName: string) {
  Reflect.set(proxy, "init", {
    defaultBehaviour,
    functionName,
    calls: [],
    mockMap: new HashingMap(),
    callsMap: new FunctionCalls(),
  });
}

function changeDefaultBehaviour(proxy: any, newBehaviour: NewBehaviourParam) {
  Reflect.set(proxy, "defaultBehaviour", newBehaviour);
}

export class FunctionMockUtils {
  constructor(private proxy: any) {}

  public initialize(functionName: string) {
    initializeProxy(this.proxy, functionName);
  }

  public changeDefaultBehaviour(newBehaviour: NewBehaviourParam) {
    changeDefaultBehaviour(this.proxy, newBehaviour);
  }

  public defaultBehaviourController() {
    const self = this;
    return {
      /**
       * @param value value to return when the method is called
       */
      thenReturn(value: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Return,
          returnedValue: value,
        });
      },
      /**
       * @param error error to throw when the method is called
       */
      thenThrow(error: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Throw,
          error,
        });
      },
      /**
       * @param value value to resolve when the method is called
       */
      thenResolve(value: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Resolve,
          resolvedValue: value,
        });
      },
      /**
       * @param error error to reject when the method is called
       */
      thenReject(error: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Reject,
          rejectedValue: error,
        });
      },
      /**
       * @param callback callback to call when the method is called
       */
      thenCall(callback: (...args: any[]) => any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Call,
          callback,
        });
      },
    };
  }

  public callController(...args: any[]) {
    const self = this;
    return {
      thenReturn(value: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Return,
            returnedValue: value,
          },
          args,
        });
      },
      thenThrow(error: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Throw,
            error,
          },
          args,
        });
      },
      thenCall(callback: (...args: any[]) => any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Call,
            callback,
          },
          args,
        });
      },
      thenResolve(value: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Resolve,
            resolvedValue: value,
          },
          args,
        });
      },

      thenReject(error: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Reject,
            rejectedValue: error,
          },
          args,
        });
      },
    };
  }
}

export class FunctionSpy {
  constructor(private proxy: any) {}

  private get callsMap() {
    return Reflect.get(this.proxy, "callsMap") as FunctionCalls;
  }

  public get calls() {
    return Reflect.get(this.proxy, "calls") as {
      args: any[];
      behaviour: NewBehaviourParam;
    }[];
  }

  public get hasBeenCalled() {
    const callsMap = this.callsMap;
    return {
      get atleastOnce() {
        return callsMap.getCalls().length > 0;
      },
      get once() {
        return callsMap.getCalls().length === 1;
      },
      get twice() {
        return callsMap.getCalls().length === 2;
      },
      get thrice() {
        return callsMap.getCalls().length === 3;
      },
      nTimes(howMuch: number) {
        return callsMap.getCalls().length === howMuch;
      },
      withArgs(...args: any[]) {
        return {
          get atleastOnce() {
            return callsMap.hasBeenCalledWith(...args);
          },
          get once() {
            return callsMap.hasBeenCalledNTimesWith(1, ...args);
          },
          get twice() {
            return callsMap.hasBeenCalledNTimesWith(2, ...args);
          },
          get thrice() {
            return callsMap.hasBeenCalledNTimesWith(3, ...args);
          },
          nTimes(howMuch: number) {
            return callsMap.hasBeenCalledNTimesWith(howMuch, ...args);
          },
        };
      },
    };
  }
}

import { z } from "zod";
import { HashingMap } from "../HashingMap";
import { NewBehaviourParam } from "../types/behaviour";

export type Call = {
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
    // Remember, the values are arrays of calls for each args combination
    // So we need to flatten them to get the whole list as a single array
    return this.calls.values<Call[]>().flat();
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

export function argsContainZodSchema(...args: any[]) {
  return args.some((arg) => arg instanceof z.ZodSchema);
}

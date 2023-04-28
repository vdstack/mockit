import { HashingMap } from "../../utils/HashingMap";
import { countMatchingCalls } from "../../utils/countMatchingCalls";
import { argsContainZodSchema } from "../../utils/argsContainZodSchema";

import { NewBehaviourParam } from "../functionMock/behaviour";
import { MockGetters, MockSetters } from "../functionMock/accessors";

export class FunctionSpy {
  constructor(private proxy: any) {}

  private get callsMap() {
    return MockGetters(this.proxy).callsMap;
  }

  public get calls() {
    return MockGetters(this.proxy).calls;
  }

  /**
   * Reset the spy data of the mock
   * BEWARE: any "verify" call will be affected by this reset
   * because the mock itself will reset its data
   */
  public reset() {
    MockSetters(this.proxy).calls = [];
    MockSetters(this.proxy).callsMap = new FunctionCalls();
  }

  public get wasCalled() {
    const callsMap = this.callsMap;
    return {
      get atLeastOnce() {
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
    };
  }

  public wasCalledWith(...expectedArgs: any[]) {
    const callsMap = this.callsMap;
    const argscontainZodSchema = argsContainZodSchema(...expectedArgs);
    const calledArgsList = callsMap.getArgs();

    return {
      get atLeastOnce() {
        if (argscontainZodSchema) {
          return (
            countMatchingCalls({
              STOP_ONCE_MATCHES_TIMES: 1, // hehe :D
              expectedArgs,
              calledArgsList,
            }) > 0
          );
        }
        return callsMap.wasCalledWith(...expectedArgs);
      },
      get once() {
        if (argscontainZodSchema) {
          return (
            countMatchingCalls({
              expectedArgs,
              calledArgsList,
            }) === 1
          );
        }

        return callsMap.wasCalledNTimesWith(1, ...expectedArgs);
      },
      get twice() {
        if (argscontainZodSchema) {
          return (
            countMatchingCalls({
              expectedArgs,
              calledArgsList,
            }) === 2
          );
        }

        return callsMap.wasCalledNTimesWith(2, ...expectedArgs);
      },
      get thrice() {
        if (argscontainZodSchema) {
          return (
            countMatchingCalls({
              expectedArgs,
              calledArgsList,
            }) === 3
          );
        }

        return callsMap.wasCalledNTimesWith(3, ...expectedArgs);
      },
      nTimes(howMuch: number) {
        if (argscontainZodSchema) {
          return (
            countMatchingCalls({
              expectedArgs,
              calledArgsList,
            }) === howMuch
          );
        }

        return callsMap.wasCalledNTimesWith(howMuch, ...expectedArgs);
      },
    };
  }
}

export type Call = {
  args?: any[];
  behaviour: NewBehaviourParam;
};

export class FunctionCalls {
  private calls: HashingMap = new HashingMap();
  constructor() {}

  public registerCall(args: any[], behaviour: NewBehaviourParam) {
    const existingCalls = (this.calls.get(args) ?? []) as Call[];
    this.calls.set(args, existingCalls.concat({ behaviour }));
  }

  public wasCalledWith(...args: any[]) {
    return this.calls.has(args);
  }

  public wasCalledNTimesWith(n: number, ...args: any[]) {
    const calls = this.calls.get<Call[] | undefined>(args);
    return calls?.length === n;
  }

  public getCalls(): Call[] {
    // Remember, the values are arrays of calls for each args combination
    // So we need to flatten them to get the whole list as a single array
    return this.calls.values<Call[]>().flat();
  }

  public getArgs() {
    return this.calls.getOriginalKeys();
  }
}

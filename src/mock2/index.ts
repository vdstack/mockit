import { Behaviour, NewBehaviourParam } from "../mock/Copy";
import { GetClassMethods } from "../types/GetClassMethods";

import { Calls } from "./calls";
import { Stubies } from "./stubies";

export class Mock2<T> {
    public calls: Calls<T> = new Calls<T>();
    private stubies: Stubies<T>;
    private behaviour: Behaviour = Behaviour.Return;
  
    constructor(private readonly original: new () => T) {
      this.propagateBehaviour();
      this.stubies = new Stubies<T>(
        original,
        this.getActionByBehaviour({
          behaviour: this.behaviour as Behaviour.Return,
          returnedValue: undefined,
        })
      );
    }
  
    setupBehaviour(newBehaviour: NewBehaviourParam) {
      this.behaviour = newBehaviour.behaviour;
      this.stubies.changeDefaultBehaviour(
        this.getActionByBehaviour(newBehaviour)
      );
  
      return this;
    }
  
    setupFunctionBehaviour({
      funcName,
      newBehaviour,
      args,
    }: {
      funcName: GetClassMethods<T>;
      args?: any[];
      newBehaviour: Function;
    }) {
      this.stubies.registerMock(funcName, args, newBehaviour);
      return this;
    }
  
    private getActionByBehaviour(newBehaviour: NewBehaviourParam) {
      if (newBehaviour.behaviour === Behaviour.Call) {
        return newBehaviour.callback;
      }
  
      if (newBehaviour.behaviour === Behaviour.Return) {
        return () => newBehaviour.returnedValue;
      }
  
      if (newBehaviour.behaviour === Behaviour.Resolve) {
        return () => Promise.resolve(newBehaviour.resolvedValue);
      }
  
      if (newBehaviour.behaviour === Behaviour.Reject) {
        return () => Promise.reject(newBehaviour.rejectedValue);
      }
  
      if (newBehaviour.behaviour === Behaviour.Throw) {
        return () => {
          throw newBehaviour.error;
        };
      }
  
      return () => {
        throw new Error("Behaviour not implemented");
      };
    }
  
    private propagateBehaviour() {
      const keys = Object.getOwnPropertyNames(
        this.original.prototype
      ) as GetClassMethods<T>[];
      keys.forEach((key) => {
        if (key !== "constructor") {
          this[String(key)] = (...args: any[]) => {
            this.calls.registerCall(key, args);
            const whatToDo = this.stubies.getMock(key, args);
            return whatToDo(...args);
          };
        }
      });
    }
  
    getStubsInstance() {
      return this.stubies;
    }
  
    getCallsInstance() {
      return this.calls;
    }
  }
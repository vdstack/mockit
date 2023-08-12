import { MockSetters } from "./accessors";
import { Behaviour, NewBehaviourParam } from "./behaviour";
import { initializeProxy, changeDefaultBehaviour } from "./index";

export class FunctionMockUtils<TFunc extends (...args: any[]) => any> {
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
      thenReturnUnsafe(value: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Return,
          returnedValue: value,
        });
      },
      thenReturn(value: ReturnType<TFunc>) {
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
      thenResolveSafe(value: Awaited<ReturnType<TFunc>>) {
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
    const Setters = MockSetters(this.proxy);
    return {
      thenReturnUnsafe<T>(value: T) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Return,
            returnedValue: value,
          },
        });
      },
      thenReturn(value: ReturnType<TFunc>) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Return,
            returnedValue: value,
          },
        });
      },
      thenThrow(error: any) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Throw,
            error,
          },
        });
      },
      thenCall(callback: (...args: any[]) => any) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Call,
            callback,
          },
        });
      },
      thenResolve(value: any) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Resolve,
            resolvedValue: value,
          },
        });
      },
      thenResolveSafe(value: Awaited<ReturnType<TFunc>>) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Resolve,
            resolvedValue: value,
          },
        });
      },

      thenReject(error: any) {
        Setters.registerNewCustomBehaviour({
          args,
          behaviour: {
            behaviour: Behaviour.Reject,
            rejectedValue: error,
          },
        });
      },
    };
  }
}

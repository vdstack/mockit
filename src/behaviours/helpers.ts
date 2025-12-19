import { Behaviours, NewBehaviourParam } from "./behaviours";
import { FnOptions } from "../types/inline-api.types";

/**
 * Converts the simplified FnOptions format to the internal NewBehaviourParam format.
 * FnOptions is a discriminated union, so only one behavior can be set at a time.
 */
export function optionsToBehaviour<T extends (...args: any[]) => any>(
  options: FnOptions<T>
): NewBehaviourParam<T> {
  if ("returns" in options) {
    return { kind: Behaviours.Return, returnedValue: options.returns };
  }
  if ("resolves" in options) {
    return { kind: Behaviours.Resolve, resolvedValue: options.resolves };
  }
  if ("rejects" in options) {
    return { kind: Behaviours.Reject, rejectedValue: options.rejects };
  }
  if ("throws" in options) {
    return { kind: Behaviours.Throw, error: options.throws };
  }
  if ("calls" in options) {
    return { kind: Behaviours.Custom, customBehaviour: options.calls };
  }

  // This should never happen if TypeScript is enforcing the FnOptions type
  throw new Error("Invalid FnOptions: must specify one of returns, resolves, rejects, throws, or calls");
}

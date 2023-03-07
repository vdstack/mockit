// I'm still wondering if I should just used a restricted string type instead of an enum.
export enum Behaviour {
  Resolve,
  Reject,
  Return,
  Call,
  Throw,
}

/**
 * This is a discriminated union type that will be used to define behaviours, either
 * by default or for a call with a specific set of arguments.
 */
export type NewBehaviourParam =
  | { behaviour: Behaviour.Throw; error?: any }
  | { behaviour: Behaviour.Call; callback: (...args: any[]) => any }
  | { behaviour: Behaviour.Return; returnedValue: any }
  | { behaviour: Behaviour.Resolve; resolvedValue: any }
  | { behaviour: Behaviour.Reject; rejectedValue: any };

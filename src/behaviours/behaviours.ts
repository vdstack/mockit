export const Behaviours = {
  Resolve: "resolve",
  Reject: "reject",
  Return: "return",
  Call: "call",
  Throw: "throw",
  ReturnResultOf: "returnResultOf",
  ResolveResultOf: "resolveResultOf",
  RejectResultOf: "rejectResultOf",
  Custom: "custom",
  Preserve: "preserve",
} as const;

export type Behaviour = typeof Behaviours[keyof typeof Behaviours];

/**
 * This is a discriminated union type that will be used to define behaviours, either
 * by default or for a call with a specific set of arguments.
 */
export type NewBehaviourParam<T extends (...args) => any> =
  | { kind: typeof Behaviours.Throw; error?: any }
  | { kind: typeof Behaviours.Call; callback: (...args: any[]) => any }
  | { kind: typeof Behaviours.Return; returnedValue: any }
  | { kind: typeof Behaviours.Resolve; resolvedValue: any }
  | { kind: typeof Behaviours.Reject; rejectedValue: any }
  | {
      kind: typeof Behaviours.ReturnResultOf;
      returnedFunction: (params: Parameters<T>) => any;
    }
  | {
      kind: typeof Behaviours.ResolveResultOf;
      resolvedFunction: (params: Parameters<T>) => any;
    }
  | {
      kind: typeof Behaviours.RejectResultOf;
      rejectedFunction: (params: Parameters<T>) => any;
    }
  | { kind: typeof Behaviours.Preserve }
  | {
      kind: typeof Behaviours.Custom;
      customBehaviour: (params: Parameters<T>) => any;
    };

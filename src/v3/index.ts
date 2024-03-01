import hash from "node-object-hash";
import { ZodSchema, z } from "zod";

const hasher =  hash({ coerce: { set: true, symbol: true } });

export type Call<T extends (...args: any) => any> = {
    args: Parameters<T>;
    date: Date;
}

export type UnsafeCall = {
    args: any[];
    date: Date;
}

export function mockFunction<T extends (...args: any[]) => any>(
    original: T
): T {
    const calls: Call<T>[] = [];
    const defaultBehaviour: NewBehaviourParam<T> = { behaviour: Behaviours.Return, returnedValue: undefined } as const;
    const customBehaviours: Array<NewBehaviourParam<T>> = [];
    // Each set of arguments will have a list of behaviours, so we can have multiple behaviours for the same set of arguments.

    return new Proxy(original, {
        apply: (original, _thisArg, ...callArgs) => {
            // What is thisArg ?
            calls.push({ args: callArgs as unknown as Parameters<T>, date: new Date() });

            return; // add custom behaviour here
        },
        get: (target, prop, receiver) => {
            if (prop === 'calls') {
                return calls;
            }

            if (prop === "isMockitMock") {
                return true;
            }

            return Reflect.get(target, prop, receiver);
        }
    })
};

type wasUnsafe = {
    wasCalledOnceWith: (...args: any[]) => boolean;
    wasNeverCalledWith: (...args: any[]) => boolean;
    wasCalledWith: (...args: any[]) => boolean;
    wasCalledNTimesWith: (howMuch: number, args: any[]) => boolean;
}

type wasZod = {
    wasCalledOnceWith: (...args: Array<ZodSchema | any>) => boolean;
    wasNeverCalledWith: (...args: Array<ZodSchema | any>) => boolean;
    wasCalledWith: (...z: Array<ZodSchema | any>) => boolean;
    wasCalledNTimesWith: (howMuch: number, args: Array<ZodSchema | any>) => boolean;
}

// This spies the mocked function !
export function spyMockedFunction<T extends (...args: any[]) => any>(
    original: T
): {
    getCalls: () =>  Call<T>[];
    getUnsafeCalls: () =>  UnsafeCall;
    wasCalledOnce(): boolean;
    wasCalledOnceWith: (...args: Parameters<T>) => boolean;
    wasCalledNTimes(howMuch: number): boolean;
    wasCalledNTimesWith: (howMuch: number, args: Parameters<T>) => boolean;
    wasCalled: () => boolean;
    wasCalledWith: (...args: Parameters<T>) => boolean;
    wasNeverCalled: () => boolean;
    wasNeverCalledWith: (...args: Parameters<T>) => boolean;
    unsafe: wasUnsafe;
    zod: wasZod;
} {
    if (!Reflect.get(original, 'isMockitMock')) {
        throw new Error('spy can only be used with functions created by mockit');
    }

    const calls = Reflect.get(original, 'calls') as Call<T>[];
    return {
        getCalls: () => calls,
        getUnsafeCalls: () => calls as unknown as UnsafeCall,
        wasCalledOnce: () => calls.length === 1,
        wasCalledOnceWith: (...args: Parameters<T>) => {
            return calls.some(call => hasher.hash(call.args) === hasher.hash(args));
        },
        wasCalledNTimes: (howMuch: number) => calls.length === howMuch,
        wasCalledNTimesWith: (howMuch: number, args: Parameters<T>) => {
            return calls.filter(call => hasher.hash(call.args) === hasher.hash(args)).length === howMuch;
        },
        wasCalled: () => {
            return calls.length > 0;
        },
        wasCalledWith: (...args: Parameters<T>) => {
            return calls.some(call => hasher.hash(call.args) === hasher.hash(args));
        },
        wasNeverCalled: () => calls.length === 0,
        wasNeverCalledWith: (...args: Parameters<T>) => {
            return !calls.some(call => hasher.hash(call.args) === hasher.hash(args));
        },
        unsafe: {
            wasCalledOnceWith: (...args: any[]) => {
                return calls.some(call => hasher.hash(call.args) === hasher.hash(args));
            },
            wasNeverCalledWith: (...args: any[]) => {
                return !calls.some(call => hasher.hash(call.args) === hasher.hash(args));
            },
            wasCalledWith: (...args: any[]) => {
                return calls.some(call => hasher.hash(call.args) === hasher.hash(args));
            },
            wasCalledNTimesWith: (howMuch: number, args: any[]) => {
                return calls.filter(call => hasher.hash(call.args) === hasher.hash(args)).length === howMuch;
            },        
        },
        zod: {
            wasCalledOnceWith: (...args: Array<ZodSchema | any>) => {
                return calls.some(call => args.every(arg => {
                    if (arg instanceof z.ZodType) {
                        return arg.safeParse(call.args).success;
                    }

                    return hasher.hash(call.args) === hasher.hash(arg);
                }));
            },
            wasNeverCalledWith: (...args: Array<ZodSchema | any>) => {
                return !calls.some(call => args.every(arg => {
                    if (arg instanceof z.ZodType) {
                        return arg.safeParse(call.args).success;
                    }

                    return hasher.hash(call.args) === hasher.hash(arg);
                }));
            },
            wasCalledWith: (...args: Array<ZodSchema | any>) => {
                return calls.some(call => args.every(arg => {
                    if (arg instanceof z.ZodType) {
                        return arg.safeParse(call.args).success;
                    }

                    return hasher.hash(call.args) === hasher.hash(arg);
                }));
            },
            wasCalledNTimesWith: (howMuch: number, args: Array<ZodSchema | any>) => {
                return calls.filter(call => args.every(arg => {
                    if (arg instanceof z.ZodType) {
                        return arg.safeParse(call.args).success;
                    }

                    return hasher.hash(call.args) === hasher.hash(arg);
                })).length === howMuch;
            },
        }
    }
}

const a = mockFunction((x: 1) => x +1 );

a(1)
a(1);

spyMockedFunction(a).wasCalledNTimes(2); // true
spyMockedFunction(a).wasCalledOnce(); // false

// @ts-expect-error
a(1, { x: 2 });

spyMockedFunction(a).zod.wasCalledOnceWith(
    1,
    z.object({ x: z.number() }),
)

// I'm still wondering if I should just used a restricted string type instead of an enum.
export const Behaviours = {
    Resolve: 'resolve',
    Reject: 'reject',
    Return: 'return',
    Call: 'call',
    Throw: 'throw',
    ReturnResultOf: 'returnResultOf',
    ResolveResultOf: 'resolveResultOf',
    RejectResultOf: 'rejectResultOf',
    Preserve: 'preserve',
} as const;

export type Behaviour = typeof Behaviours[keyof typeof Behaviours];
  
/**
 * This is a discriminated union type that will be used to define behaviours, either
 * by default or for a call with a specific set of arguments.
 */
export type NewBehaviourParam<T extends (...args) => any> =
| { behaviour: typeof Behaviours.Throw; error?: any }
| { behaviour: typeof Behaviours.Call; callback: (...args: any[]) => any }
| { behaviour: typeof Behaviours.Return; returnedValue: any }
| { behaviour: typeof Behaviours.Resolve; resolvedValue: any }
| { behaviour: typeof Behaviours.Reject; rejectedValue: any }
| { behaviour: typeof Behaviours.ReturnResultOf; returnedFunction: (params: Parameters<T>) => any }
| { behaviour: typeof Behaviours.ResolveResultOf; resolvedFunction: (params: Parameters<T>) => any }
| { behaviour: typeof Behaviours.RejectResultOf; rejectedFunction: (params: Parameters<T>) => any }
| { behaviour: typeof Behaviours.Preserve };


/**
 * What is changing
 * 
 * - The behaviour is now a discriminated union type based on the Behaviours object as const
 * - new behaviours
 *  - ReturnResultOf
 *  - ResolveResultOf
 *  - RejectResultOf
 *  - Preserve
 * 
 * - The defaultBehaviour is separated from the customBehaviours
 * - the system is WAY simpler to read & maintain.
 * 
 * - the spies now require a zod schema OR a value, not zod schemas nested in objects.
 * - this is a breaking change, but it's a good one, because it simplifies everything, is way less error prone, and
 * performs way better.
 * - It requires a bit more work from the user, with .refine calls for exact values.
 * - I split the unsafe and zod based calls assertions, because they're less common cases (we usually check for exact values)
 * 
 */
import { MockGetters } from "../internal/functionMock/accessors";

export type SuppositionCount = "atLeastOnce" | "NEVER" | number;
export type Supposition = {
  args: any[] | undefined;
  count: SuppositionCount;
};

export class SuppositionRegistry {
  private suppositions: Supposition[] = [];

  public addSupposition(supposition: Supposition) {
    this.suppositions.push(supposition);
  }

  public getSuppositions() {
    return this.suppositions;
  }
}

export function suppose<Params extends any[]>(
  mock: (...args: Params) => any
): SupposeResponse<Params> {
  const suppositionsRegistry = MockGetters(mock).suppositionsRegistry;

  const followup: {
    and: SupposeResponse<Params>;
  } = {
    get and() {
      return suppose(mock);
    },
  };

  return {
    willNotBeCalled() {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: "NEVER",
      });

      return followup;
    },
    willNotBeCalledWith(...args: any[]) {
      suppositionsRegistry.addSupposition({
        args,
        count: "NEVER",
      });

      return followup;
    },
    willNotBeCalledWithSafe(...args: Params) {
      suppositionsRegistry.addSupposition({
        args,
        count: "NEVER",
      });

      return followup;
    },

    /** Will be called XXXX */
    willBeCalledAtLeastOnce() {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: "atLeastOnce",
      });

      return suppose(mock);
    },
    willBeCalledOnce() {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: 1,
      });

      return suppose(mock);
    },

    willBeCalledTwice() {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: 2,
      });

      return suppose(mock);
    },

    willBeCalledThrice() {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: 3,
      });

      return suppose(mock);
    },

    willBeCalledNTimes(n: number) {
      suppositionsRegistry.addSupposition({
        args: undefined,
        count: n,
      });

      return suppose(mock);
    },

    /** Will be called  */

    willBeCalled: {
      atLeastOnce() {
        suppositionsRegistry.addSupposition({
          args: undefined,
          count: "atLeastOnce",
        });

        return followup;
      },
      once() {
        suppositionsRegistry.addSupposition({
          args: undefined,
          count: 1,
        });

        return followup;
      },
      twice() {
        suppositionsRegistry.addSupposition({
          args: undefined,
          count: 2,
        });

        return followup;
      },
      thrice() {
        suppositionsRegistry.addSupposition({
          args: undefined,
          count: 3,
        });

        return followup;
      },
      nTimes(n: number) {
        suppositionsRegistry.addSupposition({
          args: undefined,
          count: n,
        });

        return followup;
      },
    },
    willBeCalledWith(...args: any[]) {
      return {
        atLeastOnce() {
          suppositionsRegistry.addSupposition({
            args,
            count: "atLeastOnce",
          });

          return followup;
        },
        once() {
          suppositionsRegistry.addSupposition({
            args,
            count: 1,
          });

          return followup;
        },
        twice() {
          suppositionsRegistry.addSupposition({
            args,
            count: 2,
          });

          return followup;
        },
        thrice() {
          suppositionsRegistry.addSupposition({
            args,
            count: 3,
          });

          return followup;
        },
        nTimes(n: number) {
          suppositionsRegistry.addSupposition({
            args,
            count: n,
          });

          return followup;
        },
      };
    },
  };
}

type SuppositionSugar<Params extends any[]> = {
  atLeastOnce(): {
    and: SupposeResponse<Params>;
  };
  once(): {
    and: SupposeResponse<Params>;
  };
  twice(): {
    and: SupposeResponse<Params>;
  };
  thrice(): {
    and: SupposeResponse<Params>;
  };
  nTimes(n: number): {
    and: SupposeResponse<Params>;
  };
};

type SupposeResponse<Params extends any[]> = {
  willNotBeCalled(): {
    and: SupposeResponse<Params>;
  };
  willNotBeCalledWith(...args: any[]): {
    and: SupposeResponse<Params>;
  };
  willNotBeCalledWithSafe(...args: Params): {
    and: SupposeResponse<Params>;
  };

  willBeCalledAtLeastOnce(): SupposeResponse<Params>;
  willBeCalledOnce(): SupposeResponse<Params>;
  willBeCalledTwice(): SupposeResponse<Params>;
  willBeCalledThrice(): SupposeResponse<Params>;
  willBeCalledNTimes(n: number): SupposeResponse<Params>;

  willBeCalledAtLeastOnceWith: (...args: any[]) => SupposeResponse<Params>;
  willBeCalledOnceWith: (...args: any[]) => SupposeResponse<Params>;
  willBeCalledTwiceWith: (...args: any[]) => SupposeResponse<Params>;
  willBeCalledThriceWith: (...args: any[]) => SupposeResponse<Params>;
  willBeCalledNTimesWith: (
    howMuch: number,
    ...args: any[]
  ) => SupposeResponse<Params>;

  willBeCalledAtLeastOnceWithSafe: (...args: Params) => SupposeResponse<Params>;
  willBeCalledOnceWithSafe: (...args: Params) => SupposeResponse<Params>;
  willBeCalledTwiceWithSafe: (...args: Params) => SupposeResponse<Params>;
  willBeCalledThriceWithSafe: (...args: Params) => SupposeResponse<Params>;
  willBeCalledNTimesWithSafe: (
    howMuch: number,
    ...args: Params
  ) => SupposeResponse<Params>;

  willBeCalled: SupposeResponse<Params>;
  willBeCalledWith(...args: any[]): SupposeResponse<Params>;
};

suppose((a: string, b: number, c: object) => {}).willNotBeCalledWithSafe(
  "a",
  1,
  {}
);

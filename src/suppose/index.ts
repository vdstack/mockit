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

export function suppose(mock: any): SupposeResponse {
  const suppositionsRegistry = MockGetters(mock).suppositionsRegistry;

  const followup: {
    and: SupposeResponse;
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

type SuppositionSugar = {
  atLeastOnce(): {
    and: SupposeResponse;
  };
  once(): {
    and: SupposeResponse;
  };
  twice(): {
    and: SupposeResponse;
  };
  thrice(): {
    and: SupposeResponse;
  };
  nTimes(n: number): {
    and: SupposeResponse;
  };
};

type SupposeResponse = {
  willNotBeCalled(): {
    and: SupposeResponse;
  };
  willNotBeCalledWith(...args: any[]): {
    and: SupposeResponse;
  };

  willBeCalled: SuppositionSugar;
  willBeCalledWith(...args: any[]): SuppositionSugar;
};

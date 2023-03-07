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
  const suppositionsMap = Reflect.get(
    mock,
    "suppositionsMap"
  ) as SuppositionRegistry;

  const followup: {
    and: SupposeResponse;
  } = {
    get and() {
      return suppose(mock);
    },
  };

  return {
    willNotBeCalled() {
      suppositionsMap.addSupposition({
        args: undefined,
        count: "NEVER",
      });

      return followup;
    },
    willNotBeCalledWith(...args: any[]) {
      suppositionsMap.addSupposition({
        args,
        count: "NEVER",
      });

      return followup;
    },
    willBeCalled: {
      atLeastOnce() {
        suppositionsMap.addSupposition({
          args: undefined,
          count: "atLeastOnce",
        });

        return followup;
      },
      once() {
        suppositionsMap.addSupposition({
          args: undefined,
          count: 1,
        });

        return followup;
      },
      twice() {
        suppositionsMap.addSupposition({
          args: undefined,
          count: 2,
        });

        return followup;
      },
      thrice() {
        suppositionsMap.addSupposition({
          args: undefined,
          count: 3,
        });

        return followup;
      },
      nTimes(n: number) {
        suppositionsMap.addSupposition({
          args: undefined,
          count: n,
        });

        return followup;
      },
    },
    willBeCalledWith(...args: any[]) {
      return {
        atLeastOnce() {
          suppositionsMap.addSupposition({
            args,
            count: "atLeastOnce",
          });

          return followup;
        },
        once() {
          suppositionsMap.addSupposition({
            args,
            count: 1,
          });

          return followup;
        },
        twice() {
          suppositionsMap.addSupposition({
            args,
            count: 2,
          });

          return followup;
        },
        thrice() {
          suppositionsMap.addSupposition({
            args,
            count: 3,
          });

          return followup;
        },
        nTimes(n: number) {
          suppositionsMap.addSupposition({
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

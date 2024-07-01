import { getMockHistory } from "./getMockHistory";

export function verifyThat<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc
) {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  const mockHistory = getMockHistory(mockedFunction);
  return {
    wasCalled() {
      if (!mockHistory.wasCalled()) {
        throw new Error(`Function was never called.`);
      }
    },
    wasCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledWith(...args)) {
        throw new Error(`Function was not called with parameters ${args}`);
      }
    },
    wasCalledOnce() {
      if (!mockHistory.wasCalledOnce()) {
        throw new Error(`Function was not called exactly once.`);
      }
    },
    wasCalledOnceWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasCalledOnceWith(...args)) {
        throw new Error(
          `Function was not called exactly once with parameters ${args}`
        );
      }
    },
    wasCalledNTimes(howMuch: number) {
      if (!mockHistory.wasCalledNTimes(howMuch)) {
        throw new Error(`Function was not called exactly ${howMuch} times.`);
      }
    },
    wasCalledNTimesWith({
      args,
      howMuch,
    }: {
      howMuch: number;
      args: Parameters<TFunc>;
    }) {
      if (!mockHistory.wasCalledNTimesWith({ args, howMuch })) {
        throw new Error(
          `Function was not called exactly ${howMuch} times with parameters ${args}`
        );
      }
    },
    wasNeverCalled() {
      if (!mockHistory.wasNeverCalled()) {
        throw new Error(`Function was called.`);
      }
    },
    wasNeverCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasNeverCalledWith(...args)) {
        throw new Error(`Function was called with parameters ${args}`);
      }
    }
  };
}

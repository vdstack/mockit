import { FunctionCalls, FunctionSpy } from "../internal/functionSpy";
import { MockGetters } from "../internal/functionMock/accessors";
import { Supposition, SuppositionCount } from ".";

export function verify(...mocks: any[]) {
  for (const mock of mocks) {
    const suppositionsRegistry = MockGetters(mock).suppositionsRegistry;

    if (suppositionsRegistry == null) {
      // We're in the class or abstract class or interface mock case
      const properties = Object.getOwnPropertyNames(mock);
      for (const property of properties) {
        verify(mock[property]);
      }

      return;
    }

    const spy = new FunctionSpy(mock);

    const defaultNever = suppositionsRegistry
      .getSuppositions()
      .find((s) => s.count === "NEVER" && s.args == null);

    // This means it should never be called PERIOD, not matter which suppositions you added.
    if (defaultNever != null) {
      if (spy.wasCalled.atLeastOnce) {
        throw new Error("Verification failed");
      }
    }

    const analysis = suppositionsRegistry
      .getSuppositions()
      .map((supposition) => {
        if (supposition.count === "NEVER") {
          if (supposition.args == null) {
            return {
              supposition,
              verified: !spy.wasCalled.atLeastOnce,
            };
          }

          return {
            supposition,
            verified: !spy.wasCalledWith(...supposition.args).atLeastOnce,
          };
        }

        if (supposition.count === "atLeastOnce") {
          if (supposition.args == null) {
            return {
              supposition,
              verified: spy.wasCalled.atLeastOnce,
            };
          }

          return {
            supposition,
            verified: spy.wasCalledWith(...supposition.args).atLeastOnce,
          };
        }

        if (supposition.args == null) {
          return {
            supposition,
            verified: spy.wasCalled.nTimes(supposition.count),
          };
        }

        return {
          supposition,
          verified: spy
            .wasCalledWith(...supposition.args)
            .nTimes(supposition.count),
        };
      });

    const failedSuppositions = analysis.filter((a) => a.verified === false);
    if (failedSuppositions.length) {
      const mockGetter = MockGetters(mock);
      const functionName = mockGetter.functionName;
      const suppositionsErrors = `
${failedSuppositions
  .map(
    (a, index) =>
      `Supposition ${index + 1}:${parseSuppositionText(
        a.supposition.count
      )}${parseSuppositionsArgs(a.supposition.args)}.`
  )
  .join("\n\n")}
      `;

      const calls = mockGetter.callsMap;

      const callsText = parseCallsText(calls);
      const helpText =
        "Small hint: You can setup a spy and use it to access the history arguments yourself.";
      const error = `Function "${functionName}" failed its verification\n${callsText}\n\nRegistered suppositions:${suppositionsErrors}\n${helpText}`;
      throw new Error(error);
    }
  }
}

function parseSuppositionText(supp: SuppositionCount) {
  if (supp === "NEVER") {
    return "\nIt was expected to never be called";
  }

  if (supp === "atLeastOnce") {
    return "\nIt was expected to be called at least once";
  }

  return `\nIt was expected to be called ${supp} time(s)`;
}

function parseSuppositionsArgs(suppArgs: Supposition["args"]) {
  if (suppArgs == null) {
    return "";
  }

  return ` with arguments: ${JSON.stringify(suppArgs, null, 2)}`;
}

export function parseCallsText(calls: FunctionCalls) {
  const args = calls.getArgs();

  if (!args.length) {
    return "It was never called";
  }

  if (args.length === 1) {
    return `It was called once with arguments:\n${JSON.stringify(
      args[0],
      null,
      2
    )}`;
  }

  const parsedArgs = args
    .map((a, index) => `Call ${index + 1}:\n ${JSON.stringify(a, null, 2)}`)
    .join("\n\n");
  return `It was called ${
    timesMap[args.length] ?? `${args.length} times`
  }.\n\nRegistered calls:\n${parsedArgs}`;
}

const timesMap = {
  1: "once",
  2: "twice",
};

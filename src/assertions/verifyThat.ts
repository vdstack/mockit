import { getMockHistory } from "./getMockHistory";
import { compareDetailed, CompareResult, formatValue } from "../argsComparisons/compare";
import { formatResult, formatVisualDiff } from "../argsComparisons/compare-v2/formatters";

/**
 * Options for verify assertions
 */
export interface VerifyOptions {
  /** Show everything without truncation */
  verbose?: boolean;
}

/**
 * Returns a list of assertion methods on the behaviour of a mocked function.
 */
export function verifyThat<TFunc extends (...args: any[]) => any>(
  mockedFunction: TFunc,
  options: VerifyOptions = {}
) {
  if (!Reflect.get(mockedFunction, "isMockitMock")) {
    throw new Error("This is not a mockit mock");
  }

  const mockHistory = getMockHistory(mockedFunction);
  const { verbose = false } = options;

  return {
    wasCalled() {
      if (!mockHistory.wasCalled()) {
        throw new Error(`Function was never called.`);
      }
    },

    wasCalledWith(...args: Parameters<TFunc>) {
      const calls = mockHistory.getCalls();

      // Compare each call and collect results with mismatch count
      const callResults: Array<{
        args: unknown[];
        result: CompareResult;
        mismatchCount: number;
      }> = [];

      for (const call of calls) {
        const result = compareDetailed(call.args, args);
        if (result.success) {
          return; // Found a match!
        }
        callResults.push({
          args: call.args as unknown[],
          result,
          mismatchCount: result.mismatches.length,
        });
      }

      // No match found - build error message
      throw new Error(buildError(args, callResults, verbose));
    },

    wasCalledOnce() {
      if (!mockHistory.wasCalledOnce()) {
        const calls = mockHistory.getCalls();
        throw new Error(
          `Function was not called exactly once. Called ${calls.length} time(s).`
        );
      }
    },

    wasCalledOnceWith(...args: Parameters<TFunc>) {
      const calls = mockHistory.getCalls();
      const matchingCalls = calls.filter(
        (call) => compareDetailed(call.args, args).success
      );

      if (matchingCalls.length !== 1) {
        throw new Error(
          `Function was not called exactly once with expected parameters. ` +
            `Found ${matchingCalls.length} matching call(s) out of ${calls.length} total call(s).`
        );
      }
    },

    wasCalledNTimes(howMuch: number) {
      if (!mockHistory.wasCalledNTimes(howMuch)) {
        const calls = mockHistory.getCalls();
        throw new Error(
          `Function was not called exactly ${howMuch} times. Called ${calls.length} time(s).`
        );
      }
    },

    wasCalledNTimesWith({
      args,
      howMuch,
    }: {
      howMuch: number;
      args: Parameters<TFunc>;
    }) {
      const calls = mockHistory.getCalls();
      const matchingCalls = calls.filter(
        (call) => compareDetailed(call.args, args).success
      );

      if (matchingCalls.length !== howMuch) {
        throw new Error(
          `Function was not called exactly ${howMuch} times with expected parameters. ` +
            `Found ${matchingCalls.length} matching call(s) out of ${calls.length} total call(s).`
        );
      }
    },

    wasNeverCalled() {
      if (!mockHistory.wasNeverCalled()) {
        const calls = mockHistory.getCalls();
        throw new Error(`Function was called ${calls.length} time(s).`);
      }
    },

    wasNeverCalledWith(...args: Parameters<TFunc>) {
      if (!mockHistory.wasNeverCalledWith(...args)) {
        throw new Error(
          `Function was called with parameters ${formatArgs(args)}`
        );
      }
    },
  };
}

/**
 * Build error message showing closest calls with diffs
 */
function buildError(
  expectedArgs: unknown[],
  callResults: Array<{ args: unknown[]; result: CompareResult; mismatchCount: number }>,
  verbose: boolean
): string {
  const parts: string[] = [];

  if (callResults.length === 0) {
    parts.push("Function was never called.");
    parts.push("");
    parts.push(`Expected: ${formatArgs(expectedArgs)}`);
    return parts.join("\n");
  }

  parts.push("Function was not called with expected parameters.");
  parts.push("");
  parts.push(`Expected: ${formatArgs(expectedArgs)}`);
  parts.push("");

  // Sort by mismatch count (closest first)
  const sorted = [...callResults].sort((a, b) => a.mismatchCount - b.mismatchCount);

  // Show top 3 closest calls with their diffs
  const closestCalls = verbose ? sorted : sorted.slice(0, 3);

  parts.push(`Closest call(s):`);
  parts.push("");

  closestCalls.forEach((call, i) => {
    parts.push(`--- Call ${i + 1} (${call.mismatchCount} difference(s)) ---`);
    parts.push(`Arguments: ${formatArgs(call.args)}`);
    parts.push("");
    parts.push(formatResult(call.result, expectedArgs, call.args, { verbose }));
    parts.push("");
  });

  if (!verbose && sorted.length > 3) {
    parts.push(`... and ${sorted.length - 3} other call(s)`);
  }

  return parts.join("\n");
}

function formatArgs(args: unknown[]): string {
  if (args.length === 0) return "()";
  return `(${args.map((a) => formatValue(a)).join(", ")})`;
}

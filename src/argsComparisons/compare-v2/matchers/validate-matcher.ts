/**
 * Handler for validation matchers
 * validates() with custom function or Zod schema
 */

import { CompareContext, CompareResult, MatcherInfo, formatValue } from "../types";
import { createSuccessResult, createFailureResult } from "../result";
import { Schema } from "../../../behaviours/matchers";

/**
 * Handle isSchema matcher (Zod validation)
 */
export function handleSchemaMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const schema = matcherInfo.payload.schema as Schema;

  try {
    const result = schema.safeParse(actual);

    if (result.success) {
      return createSuccessResult();
    }

    // Format Zod error - result.success is false here
    const errorMessage = formatZodError(result as { success: false; error?: unknown });

    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Zod validation failed: ${errorMessage}`,
      actual,
      expected: matcherInfo.payload,
    });
  } catch (error) {
    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Zod validation threw: ${error}`,
      actual,
      expected: matcherInfo.payload,
    });
  }
}

/**
 * Handle validate matcher (custom validation function)
 */
export function handleValidateMatcher(
  actual: unknown,
  matcherInfo: MatcherInfo,
  context: CompareContext
): CompareResult {
  const validationFunction = matcherInfo.payload.validationFunction as (
    value: unknown
  ) => boolean;

  try {
    const result = validationFunction(actual);

    if (result) {
      return createSuccessResult();
    }

    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Custom validation function returned false for ${formatValue(actual)}`,
      actual,
      expected: matcherInfo.payload,
    });
  } catch (error) {
    return createFailureResult(context, {
      kind: "matcher_failed",
      message: `Custom validation function threw: ${error}`,
      actual,
      expected: matcherInfo.payload,
    });
  }
}

/**
 * Format Zod error for display
 */
function formatZodError(result: { success: false; error?: unknown }): string {
  const error = result.error as {
    issues?: Array<{ path?: unknown[]; message?: string }>;
  };

  if (!error || !error.issues || error.issues.length === 0) {
    return "validation failed";
  }

  const firstIssue = error.issues[0];
  const path = firstIssue.path?.join(".") || "";
  const message = firstIssue.message || "invalid";

  if (path) {
    return `at "${path}": ${message}`;
  }

  return message;
}

/**
 * Format the validation matcher for display
 */
export function formatValidateMatcher(matcherInfo: MatcherInfo): string {
  if (matcherInfo.type === "isSchema") {
    return "validates(ZodSchema)";
  }
  return "validates(fn)";
}

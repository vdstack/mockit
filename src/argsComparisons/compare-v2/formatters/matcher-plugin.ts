/**
 * Pretty-format plugin for mockit matchers
 *
 * This plugin allows jest-diff to display matchers like anyString()
 * instead of { "mockit__any": true, "what": "string" }
 */

import type { NewPlugin } from "pretty-format";

/**
 * Check if a value is a mockit matcher
 */
function isMockitMatcher(val: unknown): val is Record<string, unknown> {
  if (typeof val !== "object" || val === null) return false;
  return Object.keys(val).some((k) => k.startsWith("mockit__"));
}

/**
 * Format a matcher for display in diffs
 */
function formatMatcherForDiff(matcher: Record<string, unknown>): string {
  const matcherKey = Object.keys(matcher).find((k) => k.startsWith("mockit__"));
  if (!matcherKey) return "[Matcher]";

  const type = matcherKey.replace("mockit__", "");

  switch (type) {
    case "any":
      return `any${capitalize(matcher.what as string)}()`;

    case "isContaining":
      if (typeof matcher.original === "string")
        return `stringContaining("${matcher.original}")`;
      if (Array.isArray(matcher.original)) return `arrayContaining([...])`;
      if (matcher.original instanceof Map) return `mapContaining(Map)`;
      if (matcher.original instanceof Set) return `setContaining(Set)`;
      return `objectContaining({...})`;

    case "isContainingDeep":
      if (Array.isArray(matcher.original)) return `arrayContainingDeep([...])`;
      if (matcher.original instanceof Map) return `mapContainingDeep(Map)`;
      if (matcher.original instanceof Set) return `setContainingDeep(Set)`;
      return `objectContainingDeep({...})`;

    case "isSchema":
      return `validates(ZodSchema)`;

    case "validate":
      return `validates(fn)`;

    case "or_operator":
      return `or(...)`;

    case "isOneOf":
      return `isOneOf([...])`;

    case "instanceOf":
      return `instanceOf(${(matcher.class as { name: string })?.name || "Class"})`;

    case "startsWith":
      return `stringStartingWith("${matcher.original}")`;

    case "endsWith":
      return `stringEndingWith("${matcher.original}")`;

    case "matchesRegex":
      return `stringMatching(${matcher.regexp})`;

    default:
      return `[Matcher: ${type}]`;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Pretty-format plugin for mockit matchers
 */
export const mockitMatcherPlugin: NewPlugin = {
  test: isMockitMatcher,
  serialize: (val: unknown) => formatMatcherForDiff(val as Record<string, unknown>),
};

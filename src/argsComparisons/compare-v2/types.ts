/**
 * Types for the compare-v2 implementation
 */

// =============================================================================
// Path Types
// =============================================================================

/**
 * Represents a single segment in the path to a value
 */
export type PathSegment =
  | { type: "property"; key: string }
  | { type: "index"; index: number }
  | { type: "mapKey"; key: unknown }
  | { type: "setValue"; value: unknown };

/**
 * A full path from root to current position
 */
export type Path = PathSegment[];

/**
 * Formats a path for human-readable output
 * e.g., [{ type: "property", key: "user" }, { type: "index", index: 0 }] -> "user[0]"
 */
export function formatPath(path: Path): string {
  if (path.length === 0) return "<root>";

  return path.reduce((acc, segment) => {
    switch (segment.type) {
      case "property":
        return acc ? `${acc}.${segment.key}` : segment.key;
      case "index":
        return `${acc}[${segment.index}]`;
      case "mapKey":
        return `${acc}.get(${formatValue(segment.key)})`;
      case "setValue":
        return `${acc}.has(${formatValue(segment.value)})`;
    }
  }, "");
}

// =============================================================================
// Mismatch Types
// =============================================================================

/**
 * Types of mismatches that can occur during comparison
 */
export type MismatchKind =
  | "type_mismatch"
  | "value_mismatch"
  | "missing_property"
  | "extra_property"
  | "array_length"
  | "matcher_failed"
  | "circular_reference"
  | "max_depth_exceeded"
  | "map_key_missing"
  | "set_value_missing";

/**
 * Describes a single mismatch between expected and actual values
 */
export interface MismatchInfo {
  /** Path where the mismatch occurred */
  path: Path;
  /** Human-readable formatted path */
  pathString: string;
  /** The actual value found */
  actual: unknown;
  /** The expected value/matcher */
  expected: unknown;
  /** Type of mismatch */
  kind: MismatchKind;
  /** Human-readable message */
  message: string;
}

// =============================================================================
// Compare Result
// =============================================================================

/**
 * The result of a comparison
 */
export interface CompareResult {
  /** Whether the comparison succeeded */
  success: boolean;
  /** List of all mismatches found (empty if success) */
  mismatches: MismatchInfo[];
}

// =============================================================================
// Compare Options
// =============================================================================

/**
 * Options for the comparison
 */
export interface CompareOptions {
  /**
   * When true, treat { a: 1 } and { a: 1, b: undefined } as equal
   * Default: true (new behavior)
   */
  treatUndefinedAsAbsent: boolean;

  /**
   * Maximum recursion depth (prevents stack overflow)
   * Default: 100
   */
  maxDepth: number;

  /**
   * Collect all mismatches (true) or stop at first (false)
   * Default: true for better error messages
   */
  collectAllMismatches: boolean;
}

/**
 * Default options for comparison
 */
export const DEFAULT_OPTIONS: CompareOptions = {
  treatUndefinedAsAbsent: true,
  maxDepth: 100,
  collectAllMismatches: true,
};

// =============================================================================
// Compare Context
// =============================================================================

/**
 * Internal context passed through the comparison
 */
export interface CompareContext {
  /** Current options */
  options: CompareOptions;
  /** Current path in the object tree */
  path: Path;
  /** Visited objects from actual (for circular ref detection) */
  visitedActual: WeakSet<object>;
  /** Visited objects from expected (for circular ref detection) */
  visitedExpected: WeakSet<object>;
  /** Current depth */
  depth: number;
}

// =============================================================================
// Matcher Types
// =============================================================================

/**
 * All supported matcher types
 */
export type MatcherType =
  | "any"
  | "isContaining"
  | "isContainingDeep"
  | "isSchema"
  | "validate"
  | "or_operator"
  | "isOneOf"
  | "instanceOf"
  | "startsWith"
  | "endsWith"
  | "matchesRegex";

/**
 * Detection result for a matcher
 */
export interface MatcherInfo {
  type: MatcherType;
  payload: Record<string, unknown>;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format a value for display in error messages
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") return "[Function]";
  if (typeof value === "symbol") return value.toString();
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  if (Array.isArray(value)) {
    if (value.length <= 3) {
      return `[${value.map(formatValue).join(", ")}]`;
    }
    return `[${value.slice(0, 3).map(formatValue).join(", ")}, ... (${value.length} items)]`;
  }
  if (typeof value === "object") {
    // Check if it's a matcher
    const keys = Object.keys(value);
    const matcherKey = keys.find((k) => k.startsWith("mockit__"));
    if (matcherKey) {
      return formatMatcherValue(value as Record<string, unknown>, matcherKey);
    }
    const keyCount = keys.length;
    if (keyCount <= 2) {
      return `{ ${keys.map((k) => `${k}: ${formatValue((value as Record<string, unknown>)[k])}`).join(", ")} }`;
    }
    return `{ ${keys.slice(0, 2).map((k) => `${k}: ${formatValue((value as Record<string, unknown>)[k])}`).join(", ")}, ... (${keyCount} keys) }`;
  }
  return String(value);
}

/**
 * Format a matcher for display
 */
function formatMatcherValue(
  matcher: Record<string, unknown>,
  matcherKey: string
): string {
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
      return `matcher(${type})`;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Context management for compare-v2
 */

import {
  CompareContext,
  CompareOptions,
  DEFAULT_OPTIONS,
  Path,
  PathSegment,
} from "./types";

/**
 * Create a new compare context with the given options
 */
export function createContext(
  options?: Partial<CompareOptions>
): CompareContext {
  return {
    options: { ...DEFAULT_OPTIONS, ...options },
    path: [],
    visitedActual: new WeakSet(),
    visitedExpected: new WeakSet(),
    depth: 0,
  };
}

/**
 * Create a new context with an extended path
 */
export function pushPath(
  context: CompareContext,
  segment: PathSegment
): CompareContext {
  return {
    ...context,
    path: [...context.path, segment],
    depth: context.depth + 1,
  };
}

/**
 * Check if an object has already been visited (circular reference detection)
 */
export function isCircularActual(
  context: CompareContext,
  obj: object
): boolean {
  return context.visitedActual.has(obj);
}

/**
 * Check if an expected object has already been visited
 */
export function isCircularExpected(
  context: CompareContext,
  obj: object
): boolean {
  return context.visitedExpected.has(obj);
}

/**
 * Mark objects as visited and return the context
 * Note: We mutate the WeakSets since they're shared through the comparison tree
 * This is intentional - we want to detect cycles across all branches
 */
export function markVisited(
  context: CompareContext,
  actual: object | null,
  expected: object | null
): CompareContext {
  if (actual !== null) {
    context.visitedActual.add(actual);
  }
  if (expected !== null) {
    context.visitedExpected.add(expected);
  }

  return context;
}

/**
 * Check if we've exceeded the maximum depth
 */
export function isMaxDepthExceeded(context: CompareContext): boolean {
  return context.depth >= context.options.maxDepth;
}

/**
 * Get the current path as a string
 */
export function getCurrentPathString(context: CompareContext): string {
  return formatPathToString(context.path);
}

/**
 * Format a path array to a string
 */
function formatPathToString(path: Path): string {
  if (path.length === 0) return "<root>";

  return path.reduce((acc, segment) => {
    switch (segment.type) {
      case "property":
        return acc ? `${acc}.${segment.key}` : segment.key;
      case "index":
        return `${acc}[${segment.index}]`;
      case "mapKey":
        return `${acc}.get(${JSON.stringify(segment.key)})`;
      case "setValue":
        return `${acc}.has(${JSON.stringify(segment.value)})`;
    }
  }, "");
}

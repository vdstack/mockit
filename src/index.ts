export { Mock, fn, MockStrict } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

// Export inline API types
export type {
  MockedFunction,
  MockedObject,
  MockFunctionMethods,
} from "./types";

import { Mock, fn, MockStrict, stubReturning, stubThrowing, stubResolving, stubRejecting } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import { verifyThat } from "./assertions";
import { when } from "./behaviours";
export const m = { ...matchers, ...resets, verifyThat, when, Mock, fn, MockStrict, returns: stubReturning, throws: stubThrowing, resolves: stubResolving, rejects: stubRejecting };

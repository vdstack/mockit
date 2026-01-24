export { Mock, fn, StrictMock } from "./mocks/Mock";
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

import { Mock, fn, StrictMock, stubReturning, stubThrowing, stubResolving, stubRejecting } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import * as verifications from "./assertions";
import { when } from "./behaviours";
export const m = { ...matchers, ...resets, ...verifications, when, Mock, fn, StrictMock, returns: stubReturning, throws: stubThrowing, resolves: stubResolving, rejects: stubRejecting };

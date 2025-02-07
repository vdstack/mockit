export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

import { Mock } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import * as verifications from "./assertions";
import { when } from "./behaviours";
import { assertEqual, assertNotEqual } from "./argsComparisons/compare";
export const m = { ...matchers, ...resets, ...verifications, when, Mock, assertEqual, assertNotEqual };

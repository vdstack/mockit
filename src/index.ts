export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

import { Mock } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import * as verifications from "./assertions";
import { when } from "./behaviours";
export const m = { ...matchers, ...resets, ...verifications, when, Mock };
// TODO: take feedback on the export with everything at level 1 versus any.xxx for the anyXXX matchers.

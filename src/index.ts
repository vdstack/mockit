export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
export { matchers };

import { matchers } from "./behaviours/matchers";
import { Mock } from "./mocks/Mock";
import { resetCompletely, resetBehaviourOf, resetHistoryOf } from "./mocks";
import { verifyThat, getMockHistory } from "./assertions";
import { when } from "./behaviours";

export const m = { ...matchers, resetCompletely, resetBehaviourOf, resetHistoryOf, verifyThat, getMockHistory, when, Mock };

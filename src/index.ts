export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory } from "./assertions/getMockHistory";
export { verifyThat } from "./assertions/verifyThat";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

import { Mock } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import { when } from "./behaviours";
import { getMockHistory } from "./assertions/getMockHistory";
import { verifyThat } from "./assertions/verifyThat";
import { expect } from "./assertions/expect";

export const m = {
  ...matchers,
  ...resets,
  getMockHistory,
  verifyThat,
  when,
  Mock,
  expect,
};

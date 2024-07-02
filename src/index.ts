import { resetBehaviour, resetCompletely, resetHistory } from "./mocks";
import { when } from "./behaviours";
import { Mock } from "./mocks/Mock";
import { verifyThat, getMockHistory } from "./assertions";
import { matchers } from "./behaviours/matchers";

export { Mock };
export { when };
export { getMockHistory, verifyThat };

export const m = {
  reset: {
    completely: resetCompletely,
    behaviourOf: resetBehaviour,
    historyOf: resetHistory,
  },
  Mock,
  when,
  verifyThat,
  getMockHistory,
  match: { ...matchers },
};

export { matchers } from "./behaviours/matchers";

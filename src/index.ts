import { matchers } from "./behaviours/matchers";

export { Mock } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviour, resetCompletely, resetHistory } from "./mocks";

export const m = { ...matchers };

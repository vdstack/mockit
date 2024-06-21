import { Reset, resetBehaviour, resetCompletely, resetHistory } from "./mocks";

export { Mock, Reset, resetBehaviour, resetCompletely, resetHistory };

import { when } from "./behaviours";
export { when };

import { Mock } from "./mocks/Mock";

import { verifyThat, getMockHistory } from "./assertions";
import { partial, schema, unsafe } from "./behaviours/when";
export { getMockHistory, verifyThat };

export const Mockit = {
  Reset,
  resetBehaviour,
  resetCompletely,
  resetHistory,
  Mock,
  when,
  verifyThat,
  getMockHistory,
  partial,
  schema,
  unsafe,
};

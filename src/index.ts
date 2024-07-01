import { Reset, resetBehaviour, resetCompletely, resetHistory } from "./mocks";

export { Mock, Reset, resetBehaviour, resetCompletely, resetHistory };

import { when } from "./behaviours";
export { when };

import { Mock } from "./mocks/Mock";

import { verifyThat, getMockHistory } from "./assertions";
import {
  arrayContaining,
  containing,
  containingDeep,
  isOneOf,
  mapContaining,
  objectContaining,
  schema,
  setContaining,
  stringContaining,
  stringEndingWith,
  stringStartingWith,
  unsafe,
  any,
} from "./behaviours/matchers";

export {
  any,
  arrayContaining,
  containing,
  containingDeep,
  isOneOf,
  mapContaining,
  objectContaining,
  schema,
  setContaining,
  stringContaining,
  stringEndingWith,
  stringStartingWith,
  unsafe,
};

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
  schema,
  unsafe,
  containing,
  containingDeep,
  objectContaining,
  arrayContaining,
  mapContaining,
  setContaining,
  any,
  stringContaining,
  isOneOf,
};

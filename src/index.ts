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
  setContainingDeep,
  mapContainingDeep,
  arrayContainingDeep,
  objectContainingDeep,
  stringMatchingRegex,
  stringStartingWith,
  unsafe,
  any,
  anyObject,
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
  stringMatchingRegex,
  arrayContainingDeep,
  mapContainingDeep,
  objectContainingDeep,
  setContainingDeep,
};

export { getMockHistory, verifyThat };

export const m = {
  reset: {
    completely: resetCompletely,
    behaviour: resetBehaviour,
    history: resetHistory,
  },
  Mock,
  when,
  verifyThat,
  getMockHistory,
  match: {
    objectContaining,
    objectContainingDeep,
    arrayContaining,
    arrayContainingDeep,
    mapContaining,
    mapContainingDeep,
    setContaining,
    setContainingDeep,
    any,
    stringContaining,
    stringStartingWith,
    stringEndingWith,
    stringMatchingRegex,
    isOneOf,
    schema,
    unsafe,
  }
}

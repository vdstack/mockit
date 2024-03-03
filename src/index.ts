import {
  mockAbstract,
  mockClass,
  mockFunction,
  mockInterface,
  mockType,
  Reset,
  resetBehaviour,
  resetCompletely,
  resetHistory,
} from "./mocks";

export {
  mockAbstract,
  mockClass,
  mockFunction,
  mockInterface,
  mockType,
  Reset,
  resetBehaviour,
  resetCompletely,
  resetHistory,
};

import { when } from "./behaviours";
export { when };

import { verifyThat, getMockHistory } from "./spies";
export { getMockHistory, verifyThat };

export const Mockit = {
  Reset,
  resetBehaviour,
  resetCompletely,
  resetHistory,
  mockAbstract,
  mockClass,
  mockFunction,
  mockInterface,
  mockType,
  when,
  verifyThat,
  getMockHistory,
};

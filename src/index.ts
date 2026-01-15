export { Mock, fn } from "./mocks/Mock";
export { when } from "./behaviours";
export { getMockHistory, verifyThat } from "./assertions";
export { resetBehaviourOf, resetCompletely, resetHistoryOf } from "./mocks";
import * as matchers from "./behaviours/matchers";

// Export inline API types
export type {
  FnOptions,
  ObjectConfig,
  MockedFunction,
  MockedObject,
  MockFunctionMethods,
} from "./types";

import { Mock, fn } from "./mocks/Mock";
import * as resets from "./mocks/mockFunction.reset";
import * as verifications from "./assertions";
import { when, given } from "./behaviours";

export const m = {
  ...matchers,
  ...resets,
  ...verifications,
  when,
  given,
  Mock,
  fn,
};

interface UserService {
  getUser(id: string): Promise<{ id: string; name: string } | undefined>;
  insertUser(user: { id: string; name: string }): Promise<void>;

  updateUser(user: { id: string; name?: string }): Promise<void>;
}

async function upsertUser(userService: UserService, id: string, name: string) {
  const user = await userService.getUser(id);
  if (!user) {
    await userService.insertUser({ id, name });
  } else {
    await userService.updateUser({ id, name });
  }
}

const userService = m.Mock<UserService>();

describe("then 1", () => {
  beforeEach(() => {
    m.resetCompletely(userService);
  });

  test("original without BDD syntax", () => {
    m.when(userService.getUser).isCalled.thenResolve(undefined);
    upsertUser(userService, "123", "John Doe");

    m.verifyThat(userService.insertUser).wasCalledWith({
      id: "123",
      name: "John Doe",
    });
    m.verifyThat(userService.updateUser).wasNeverCalled();
  });

  test("upsertUser should insert user if user is not found", () => {
    userService.getUser.mockResolvedValueOnce(undefined);
    m.given(userService.getUser).whenCalledWith("123").willResolve(undefined);
    upsertUser(userService, "123", "John Doe");
    m.then(userService.insertUser).wasCalledWith({
      id: "123",
      name: "John Doe",
    });
    m.then(userService.updateUser).wasNeverCalled();
  });
});

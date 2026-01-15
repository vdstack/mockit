/**
 * This file displays all the types of mocks that can be created with Mockit.
 */

// TODO: preserve

import { m } from "..";

test("mocking a function", () => {
  function funcToMock() {
    return "Hello, World!";
  }

  const mockedFunction = m.Mock(funcToMock);
  expect(mockedFunction()).toBeUndefined();
});

test("mocking a type or an interface", () => {
  type UserRepository = {
    getUser: (id: number) => string;
  };

  const userRepositoryMock = m.Mock<UserRepository>();
  expect(userRepositoryMock.getUser(1)).toBeUndefined();
});

test("mocking a class", () => {
  class UserRepository {
    getUser(id: number) {
      return "User 1";
    }
  }

  const userRepositoryMock = m.Mock(UserRepository);
  expect(userRepositoryMock.getUser(1)).toBeUndefined();
});

test("mocking an object", () => {
  const userRepository = {
    getUser: (id: number) => "User 1",
  };

  const userRepositoryMock = m.Mock(userRepository);
  expect(userRepositoryMock.getUser(1)).toBeUndefined();
});

test("mocking an abstract class", () => {
  abstract class UserRepository {
    abstract getUser(id: number): string;
    public concreteMethod() {
      return 2;
    }
  }

  const userRepositoryMock = m.Mock(UserRepository);
  expect(userRepositoryMock.getUser(1)).toBeUndefined();

  // The concrete method should mocked as well.
  expect(userRepositoryMock.concreteMethod()).toBeUndefined();
});

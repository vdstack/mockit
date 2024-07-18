/**
 * This file's objective is to show how to setup the custom behaviours of a mock so that it can 
 * act specifically for a given set of arguments.
 */

import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
}

const userRepositoryMock = m.Mock<UserRepository>();

test("a mock should respond differently for different arguments", () => {
    /**
     * For the sake of the demonstration, the mock will throw if the id is not 1 or 2.
     * If the id is 1, it will return "User 1".
     * If the id is 2, it will return "User 2".
     */
    m.when(userRepositoryMock.getUser).isCalledWith(1).thenReturn("User 1");
    m.when(userRepositoryMock.getUser).isCalledWith(2).thenReturn("User 2");
    m.when(userRepositoryMock.getUser).isCalled.thenThrow(new Error("User not found"));

    expect(userRepositoryMock.getUser(1)).toBe("User 1");
    expect(userRepositoryMock.getUser(2)).toBe("User 2");
    expect(() => userRepositoryMock.getUser(3)).toThrow("User not found");
});

/**
 * In this file you will learn how to access the raw history of a mock.
 */

import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
}

const userRepositoryMock = m.Mock<UserRepository>();

test("I should access the raw history of a mock via .calls", () => {
    userRepositoryMock.getUser(1);
    userRepositoryMock.getUser(2);

    // Access call history directly via .calls property
    const calls = userRepositoryMock.getUser.calls;

    expect(calls[0].args[0]).toBe(1);
    expect(calls[1].args[0]).toBe(2);

    // the calls are type-safe to help you explore the history of the mock
    // Uncomment the next line: it will not compile because the argument is expected to be a number
    // calls[0].args[0] === "Victor"
});
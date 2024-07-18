/**
 * In this file you will learn how to access the raw history of a mock.
 */

import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
}

const userRepositoryMock = m.Mock<UserRepository>();

test("I should access the raw history of a mock", () => {
    userRepositoryMock.getUser(1);
    userRepositoryMock.getUser(2);

    const history = m.getMockHistory(userRepositoryMock.getUser);

    expect(history.getCalls()[0].args[0]).toBe(1);
    expect(history.getCalls()[1].args[0]).toBe(2);

    // the calls are type-safe to help you explore the history of the mock
    // Uncomment the next line: it will not compile because the argument is expected to be a number
    // history.getCalls()[0].args[0] === "Victor"
});
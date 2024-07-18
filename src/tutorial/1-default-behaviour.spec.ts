/**
 * This file objective is to show how to setup the default behaviour of a mock.
 */

import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
}

const userRepositoryMock = m.Mock<UserRepository>();

/**
 * By default, all mocked functions will return undefined. This is a trade-off to generate dummy versions of the functions
 * that pass the compilation and do nothing.
 */
test("should return undefined by default", () => {
    expect(userRepositoryMock.getUser(1)).toBeUndefined();
});

/**
 * You can setup how the mock should behave when called with any arguments using the m.when(mockedFunction).isCalled syntax.
 */
test("the mock should be controlled by the isCalled syntax", async () => {
    // You can setup a return value.
    m.when(userRepositoryMock.getUser).isCalled.thenReturn("222");
    expect(userRepositoryMock.getUser(1)).toBe("222");

    // You can make the mock throw.
    m.when(userRepositoryMock.getUser).isCalled.thenThrow(new Error("An error"));
    expect(() => userRepositoryMock.getUser(1)).toThrow("An error");

    // You can make the mock resolve a value.
    m.when(userRepositoryMock.getUser).isCalled.thenResolve("222");
    expect(await userRepositoryMock.getUser(1)).toBe("222");

    // You can make the mock reject a value.
    m.when(userRepositoryMock.getUser).isCalled.thenReject(new Error("An error"));
    await expect(userRepositoryMock.getUser(1)).rejects.toThrow("An error");

    // You can make the mock behave like you want.
    m.when(userRepositoryMock.getUser).isCalled.thenBehaveLike((id) => id);
    expect(userRepositoryMock.getUser(1)).toBe(1);
});

/** thenReturn is type-safe, so you can't pass an unsafe value */
// Uncomment the next line: it will not compile
// m.when(userRepositoryMock.getUser).isCalled.thenReturn(222);

/**
 * You can override this type-safety by using the `unsafe` matcher
*/
test("should return a number despite the return type of the function", () => {
    m.when(userRepositoryMock.getUser).isCalled.thenReturn(m.unsafe(222));
    expect(userRepositoryMock.getUser(1)).toBe(222);
});

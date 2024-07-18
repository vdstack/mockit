/**
 * This file's objective is to showcase how to setup custom behaviours of a mock that will 
 * match a given set of rules instead of exact values.
 * These sets of rules are provided by Mockit in the form of matchers.
 * 
 * The library provides a wide range of matchers that can be used in various ways, see below.
 */

import { z } from "zod";
import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
}


/**
 * anyXXX matchers are used to match any value of the given category.
*/
test("work for any number", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    /**
     * In this example, we're setting up the mock to return "User 1" as long as the id is a number.
     */
    m.when(userRepositoryMock.getUser).isCalledWith(m.anyNumber()).thenReturn("User 1");
    expect(userRepositoryMock.getUser(1)).toBe("User 1");
    expect(userRepositoryMock.getUser(2)).toBe("User 1");
    expect(userRepositoryMock.getUser(NaN)).toBeUndefined();
});

/**
 * There are a lot of anyXXX matchers available:
 * - anyString
 * - anyNumber
 * - anyBoolean
 * - anyObject
 * - anyArray
 * - anyFunction
 * - anySet
 * - anyMap
 * - anyFalsy
 * - anyTruthy
 * - anyNullish
 */


/**
 * Using the m.validates matcher, you can create your own matcher.
 */
test("custom matchers can be created with the validates matcher", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    const isEven = (value: number) => value % 2 === 0;

    m.when(userRepositoryMock.getUser).isCalledWith(m.validates(isEven)).thenReturn("Even");
    m.when(userRepositoryMock.getUser).isCalledWith(m.validates((value) => !isEven(value))).thenReturn("Odd");

    expect(userRepositoryMock.getUser(2)).toBe("Even");
    expect(userRepositoryMock.getUser(3)).toBe("Odd");
    expect(userRepositoryMock.getUser(4)).toBe("Even");
    expect(userRepositoryMock.getUser(5)).toBe("Odd");

    // The validates matcher is type-safe: you will get type-hinting for the parameters of the function
    // Uncomment the next line: it will not compile because the parseInt function expects a string, not a number
    // m.when(userRepositoryMock.getUser).isCalledWith(m.validates((value) => parseInt(value, 10) === 2)).thenReturn("Even");
});


test("validates integration with Zod", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    const positiveInteger = z.number().int().positive();
    const negativeInteger = z.number().int().negative();

    m.when(userRepositoryMock.getUser).isCalledWith(m.validates(positiveInteger)).thenReturn("Positive");
    m.when(userRepositoryMock.getUser).isCalledWith(m.validates(negativeInteger)).thenReturn("Negative");

    expect(userRepositoryMock.getUser(1)).toBe("Positive");
    expect(userRepositoryMock.getUser(-1)).toBe("Negative");

    // fallback to the default behaviour
    expect(userRepositoryMock.getUser(0)).toBeUndefined();
});


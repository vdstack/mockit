/**
 * This file demonstrates how to verify that a function how many times a function was called.
 */
import { m } from "..";

type UserRepository = {
    getUser: (id: number) => string;
    saveUser: (data: {
        id: number;
        name: string;
        email: string;
        hobbies: string[];
        certifications: Array<{ name: string; date: Date;}>
    }) => void;
}

test("you should be able to validate that a function was never called", () => {
    const userRepositoryMock = m.Mock<UserRepository>();
    m.verifyThat(userRepositoryMock.saveUser).wasNeverCalled();
});

test("you should be able to validate that a function was called", () => {
    const userRepositoryMock = m.Mock<UserRepository>();
    userRepositoryMock.saveUser({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading", "Writing"],
        certifications: []
    });

    m.verifyThat(userRepositoryMock.saveUser).wasCalled();
    m.verifyThat(userRepositoryMock.saveUser).wasCalledOnce();
    m.verifyThat(userRepositoryMock.saveUser).wasCalledNTimes(1);
});
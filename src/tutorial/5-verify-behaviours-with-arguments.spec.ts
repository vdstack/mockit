/**
 * This file demonstrates how to verify that a function was called with a given set of arguments.
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


test("you should be able to check that a function was called with specific arguments", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    const date = new Date();
    userRepositoryMock.saveUser({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading", "Writing"],
        certifications: [{ name: "Cert 1", date }]
    });

    m.verifyThat(userRepositoryMock.saveUser).wasCalledWith({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading", "Writing"],
        certifications: [{ name: "Cert 1", date }]
    });

    m.verifyThat(userRepositoryMock.saveUser).wasNeverCalledWith({
        id: 2,
        name: "User 2",
        email: "user2@example.com",
        hobbies: ["Reading", "Writing"],
        certifications: [{ name: "Cert 1", date }]
    });

    /**
     * Mockit will provide type hinting for the parameters of the function.
     */
    // Uncomment the next line: it will not compile.
    // m.verifyThat(userRepositoryMock.saveUser).wasCalledWith({ id: 2, name: 0 });
});


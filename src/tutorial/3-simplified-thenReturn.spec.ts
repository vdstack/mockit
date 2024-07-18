/**
 * This file demonstrates how to simplify the setup of a mock using a combination of the `thenReturn` and the m.partial helper
 */

import { m } from "..";

type User = {
    id: number;
    name: string;
    email: string;
    hobbies: string[];
    certifications: Array<{ name: string; date: Date;}>
};

type UserRepository = {
    getUser: (id: number) => User;
}

type Mailer = {
    sendEmail: (to: string, subject: string, body: string) => void;
}

function sendWelcomeEmail(userId: number, userRepository: UserRepository, mailer: Mailer) {
    const user = userRepository.getUser(userId);
    if (!user) {
        throw new Error("User not found");
    }

    mailer.sendEmail(user.email, "Welcome!", `Hello ${user.name}, welcome to our platform!`);
}

/**
 * BEFORE: you had to provide all the required fields of the User object in the mock setup.
 * ==> if the User object signature is changed, all tests like this one break.
 */
test("you should be able to test the mailer usage without having to mock the entire User object in the UserRepository", () => {
    const userRepositoryMock = m.Mock<UserRepository>();
    const mailerMock = m.Mock<Mailer>();

    m.when(userRepositoryMock.getUser).isCalledWith(1).thenReturn({
        id: 1,
        email: "user1@example.com",
        name: "User 1",
        hobbies: [],
        certifications: []
    });

    sendWelcomeEmail(1, userRepositoryMock, mailerMock);

    m.verifyThat(mailerMock.sendEmail).wasCalledWith("user1@example.com", "Welcome!", "Hello User 1, welcome to our platform!");
});

/**
 * You should be able to test the mailer usage without having to mock the entire User object in the UserRepository.
 * Note that the following test is now decoupled from any potential change in the User object, as long as the 
 * "email" and "name" keys are provided.
 * 
 * ==> no need to adapt the test on every new field added to the User object.
 */

test("you should be able to test the mailer usage without having to mock the entire User object in the UserRepository", () => {
    const userRepositoryMock = m.Mock<UserRepository>();
    const mailerMock = m.Mock<Mailer>();

    m.when(userRepositoryMock.getUser).isCalledWith(1).thenReturn(m.partial({
        email: "user1@example.com",
        name: "User 1",
        // It is deeply type-safe: you can provide only the keys you need for nested objects as well
        // uncomment next line => it will compile
        // certifications: [{ name: "aeaz" }]
        
        // it is still type-safe => it will refuse invalid keys
        // uncomment the next line to see the error
        // x: 2
    }));

    sendWelcomeEmail(1, userRepositoryMock, mailerMock);

    m.verifyThat(mailerMock.sendEmail).wasCalledWith("user1@example.com", "Welcome!", "Hello User 1, welcome to our platform!");
});

/**
 * In last resort, you can pass completely unsafe data to the `thenReturn` method.
 * This is not recommended, as it will not provide any type hinting and will not break on any change.
 * It can be useful when you're not the owner of the mocked module, and the type signature is insufficiently detailed.
 * Most common use-case: a function returns either X or undefined, but the type signature says it returns X only.
*/
test("you can still pass unsafe data", () => {
    const userRepositoryMock = m.Mock<UserRepository>();
    // m.when(userRepositoryMock.getUser).isCalled.thenReturn(undefined);
    // m.when(userRepositoryMock.getUser).isCalled.thenReturn(m.unsafe(undefined));

    expect(() => sendWelcomeEmail(1, userRepositoryMock, m.Mock<Mailer>())).toThrow("User not found");
});

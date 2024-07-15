/**
 * You might need to return an unsafe value from a function, to simulate some weird behaviour.
 * Usually it would be recommended not to do this, but it can be necessary, especially when you're mocking a library or an API that 
 * you do not control, and whose signature is not correct.
 */

import { m } from "..";

type User = {
    id: string;
    fullName: string;
}

type UserRepository = {
    getUserById(id: string): User;
}

// The previous code is not valid, because the getUserById method could return undefined if the ID is not found.
// Normally you would just change the type signature of the function, but let's say that you cannot do that for the sake of the example.

// You can use the unsafe matcher to return an unsafe value from a function.

async function welcomeUser(userID: string, userRepository: UserRepository): Promise<string> {
    const user = await userRepository.getUserById(userID);
    if (!user) {
        return "User not found";
    }

    return `Welcome, ${user.fullName}`;
}

it("should handle undefined values", async () => {
    const userRepository = m.Mock<UserRepository>();

    // UNCOMMENT this: This will return undefined, but your compiler will complain about it.
    // m.when(userRepository.getUserById).isCalledWith("1").thenResolve(undefined);

    // This will return undefined, and TypeScript does not complain about it.
    m.when(userRepository.getUserById).isCalledWith("1").thenReturn(m.unsafe(undefined));

    const welcome = await welcomeUser("1", userRepository);
    expect(welcome).toBe("User not found");
});




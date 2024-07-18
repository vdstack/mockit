/**
 * This file demonstrates how to use matchers to reduce the complexity of your assertions, make them less brittle by not relying
 * on exact values, and make your tests more readable.
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
    saveUser: (data: {
        id: number;
        name: string;
        email: string;
        hobbies: string[];
        certifications: Array<{ name: string; date: Date;}>
    }) => void;
}

function addDataToUser(params: {
    hobbies: string[];
    certifications: Array<{ name: string; date: Date }>;
    id: number;
}, userRepository: UserRepository) {
    const user = userRepository.getUser(params.id);
    if (!user) {
        throw new Error("User not found");
    }
    
    const newHobbies = Array.from(new Set([...user.hobbies, ...params.hobbies]));
    const newCerts = Array.from(new Set([...user.certifications, ...params.certifications]));

    userRepository.saveUser({
        ...user,
        hobbies: newHobbies,
        certifications: newCerts
    });
}

/**
 * Here we use the same example as in tutorial 4, and we will gradually simplify the assertions using matchers.
 */

test("you should be able to check that a function was called with specific arguments", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    m.when(userRepositoryMock.getUser).isCalledWith(1).thenReturn({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading"],
        certifications: []
    });

    const date = new Date();
    addDataToUser({
        id: 1,
        hobbies: ["Reading", "Writing"],
        certifications: [{ name: "Cert 1", date }]
    }, userRepositoryMock);

    /**
     * Here we verify how the Set helped to uniquely identify the hobbies and certifications.
     */

    m.verifyThat(userRepositoryMock.saveUser).wasCalledWith({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading", "Writing"],
        certifications: [{ name: "Cert 1", date }]
    });

    /**
     * Let's say that you want to specifically test the hobbies unification logic.
     * With m.objectContaining you can focus on the relevant part of the object.
     */

    m.verifyThat(userRepositoryMock.saveUser).wasCalledWith(m.objectContaining({
        hobbies: ["Reading", "Writing"],
    }));
});

/**
 * Sometimes your test only cares about a very specific part of the object, deep in the hierarchy.
 * For this you can either compose matchers or use the m.objectContainingDeep matcher.
 */

test("you should be able to check that a function was called with specific arguments, even if they are deeply nested", () => {
    const userRepositoryMock = m.Mock<UserRepository>();

    const date = new Date();
    
    userRepositoryMock.saveUser({
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        hobbies: ["Reading"],
        certifications: [{ name: "Cert 1", date }]
    });

    m.verifyThat(userRepositoryMock.saveUser).wasCalledWith(m.objectContainingDeep({
        certifications: [{ date }],
    }));

    m.verifyThat(userRepositoryMock.saveUser).wasCalledOnceWith(m.objectContaining({
        certifications: [m.objectContaining({ date })]
    }));

    m.verifyThat(userRepositoryMock.saveUser).wasCalledWith(m.objectContaining({
        certifications: m.arrayContaining([m.anyObject()])
    }))
});


/**
 * In extreme cases, it can work with APIs like this:
 */

type DeeplyNested = {
    x: {
        y: {
            z: {
                w: {
                    a: {
                        b: number
                    }
                },
                gg: { m: number }
            }
        },
        e: { f: number },
    },
};

type DeeplyNestedArray = Array<Array<Array<number>>>;

function takesDeepObject(data: DeeplyNested) {
    // does something
}

function takesDeepArray(data: DeeplyNestedArray) {
    // does something
}

test("it should work deeply", () => {
    const mockedFunc = m.Mock(takesDeepObject);
    mockedFunc({
        x: { e: { f: 2 }, y: { z: { gg: {m: 2}, w: { a: {b: 2}}}}}
    });

    m.verifyThat(mockedFunc).wasCalledWith(m.objectContainingDeep({
        x: { y: { z: { w: { a: { b: 2 } } } } }
    }));

    const mockedArrayFunc = m.Mock(takesDeepArray);
    mockedArrayFunc([[[1, 2], [3, 4], [5, 6]]]);

    m.verifyThat(mockedArrayFunc).wasCalledWith(
        m.arrayContainingDeep([[[2]]])
    )

    m.verifyThat(mockedArrayFunc).wasNeverCalledWith([[[666]]])
});

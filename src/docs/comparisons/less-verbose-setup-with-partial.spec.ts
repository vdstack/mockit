import { m } from "../..";

interface User {
  createdAt: Date;
  name: string;
  id: string;
  updatedAt: Date;
  email: string;
  isActive: boolean;
  role: "admin" | "user";
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  isPhoneVerified: boolean;
  phone: string;
  avatarUrl: string;
  lastLogin?: Date;
  lastLoginIp?: string;
  lastLoginLocation?: string;
  lastLoginDevice?: string;
}

interface UserRepository {
  getUser(id: string): User;
}

function getUserDisplayName(params: {
  id: string;
  deps: { getUser: (id: string) => User };
}): string {
  const { id, deps } = params;
  const user = deps.getUser(id);
  return user.name;
}

describe("JEST version", () => {
  test("No type-safety", () => {
    const repository: UserRepository = {
      // parameters are not type-safe here: id is typed as any...
      getUser: jest.fn().mockImplementation((_id) => ({
        // The response is not type-safe either: your IDE won't help you here...
        name: "John Doe",
        id: "123",
        createdAt: new Date(),
        updatedAt: new Date(),
        email: "john.doe@example.com",
        isActive: true,
        role: "admin",
        isEmailVerified: true,
        is2FAEnabled: true,
        isPhoneVerified: true,
        phone: "+1234567890",
        avatarUrl: "https://example.com/avatar.png",
        lastLogin: new Date(),
        lastLoginIp: "123.456.789.0",
        lastLoginLocation: "New York",
      })),
    };

    const displayName = getUserDisplayName({ id: "123", deps: repository });
    expect(displayName).toBe("John Doe");
  });

  test("trying to make it type-safe with jest", () => {
    // Well now it's type-safe, but you need to manually provide ALL the fields...
    const user: User = {
      name: "John Doe",
      id: "123",
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "john.doe@example.com",
      isActive: true,
      role: "admin",
      isEmailVerified: true,
      is2FAEnabled: true,
      isPhoneVerified: true,
      phone: "+1234567890",
      avatarUrl: "https://example.com/avatar.png",
      lastLogin: new Date(),
      lastLoginIp: "123.456.789.0",
      lastLoginLocation: "New York",
    };

    const repository: UserRepository = {
      getUser: jest.fn().mockImplementation((_id) => user),
    };

    const displayName = getUserDisplayName({ id: "123", deps: repository });
    expect(displayName).toBe("John Doe");
  });
});

describe("Mockit version", () => {
  test("Type-safe, provide only the field you need in your test => easier to write and read", () => {
    const repository = m.Mock<UserRepository>();

    // m.partial helps you create a partial mock of the object that TypeScript will be happy with...
    m.when(repository.getUser).isCalled.thenReturn(
      m.partial({
        // ... while still giving you help from your IDE with partial type-safety !!
        name: "John Doe",
      })
    );

    const displayName = getUserDisplayName({ id: "123", deps: repository });
    expect(displayName).toBe("John Doe");
  });

  // In this example, whatever property changes in the User object will not affect the test (except for the name of course)
  // => The test is way more stable, and you won't need to update it unless you modify the User.name property or the getUser function,
  // => your test is as decoupled as can be from the implementation details, and is laser-focused on the business logic only.
});

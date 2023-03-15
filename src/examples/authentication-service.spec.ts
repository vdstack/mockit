/** For this example, we'll create a simple user authentication system that allows users to register and authenticate using email and password. We will then use Mockit to test the behavior of the system.**/
interface UserRepository {
  createUser(email: string, password: string): Promise<void>;
  getUserByEmail(
    email: string
  ): Promise<{ email: string; password: string } | null>;
}

class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(email: string, password: string): Promise<void> {
    // Add additional validations and hashing if necessary
    return this.userRepository.createUser(email, password);
  }

  async authenticate(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) return false;

    // Compare the given password with the stored one (hashing should be considered)
    return user.password === password;
  }
}

import { Mockit } from "../";

// Test the register method
describe("AuthService", () => {
  let authService: AuthService;
  let userRepositoryMock: UserRepository;

  beforeEach(() => {
    // Create a mock instance of the UserRepository interface
    userRepositoryMock = Mockit.mockInterface<UserRepository>(
      "createUser",
      "getUserByEmail"
    );

    // Create an AuthService instance with the mocked UserRepository
    authService = new AuthService(userRepositoryMock);
  });

  it("should create a user on registration", async () => {
    const email = "test@example.com";
    const password = "test_password";

    // Register a new user
    await authService.register(email, password);

    // Verify if the userRepositoryMock's createUser method was called with the correct arguments
    Mockit.suppose(userRepositoryMock.createUser)
      .willBeCalledWith(email, password)
      .once();

    Mockit.verify(userRepositoryMock);
  });

  it("should return true if the user is registered", async () => {
    const USER_EMAIL = "test@example.com";
    const USER_PASSWORD = "test_password";

    // Set up the behavior for the userRepositoryMock's getUserByEmail method
    Mockit.when(userRepositoryMock.getUserByEmail)
      .isCalledWith(USER_EMAIL)
      .thenResolve({ email: USER_EMAIL, password: USER_PASSWORD });

    // Authenticate the user
    const isAuthenticated = await authService.authenticate(
      USER_EMAIL,
      USER_PASSWORD
    );

    // Verify if the userRepositoryMock's getUserByEmail method was called with the correct arguments
    Mockit.suppose(userRepositoryMock.getUserByEmail)
      .willBeCalledWith(USER_EMAIL)
      .once();
    Mockit.verify(userRepositoryMock);

    // Check if the user was authenticated successfully
    expect(isAuthenticated).toBe(true);
  });

  it("should return false if the user is not registered", async () => {
    const USER_EMAIL = "test@example.com";
    const USER_PASSWORD = "test_password";

    // Set up the behavior for the userRepositoryMock's getUserByEmail method
    Mockit.when(userRepositoryMock.getUserByEmail)
      .isCalledWith(USER_EMAIL)
      .thenResolve(null);

    // Authenticate the user
    const isAuthenticated = await authService.authenticate(
      USER_EMAIL,
      USER_PASSWORD
    );

    // Verify if the userRepositoryMock's getUserByEmail method was called with the correct arguments
    Mockit.suppose(userRepositoryMock.getUserByEmail)
      .willBeCalledWith(USER_EMAIL)
      .once();
    Mockit.verify(userRepositoryMock);

    // Check if the user was authenticated successfully
    expect(isAuthenticated).toBe(false);
  });

  it("should return false if the password is incorrect", async () => {
    const USER_EMAIL = "test@example.com";

    // Set up the behavior for the userRepositoryMock's getUserByEmail method
    Mockit.when(userRepositoryMock.getUserByEmail)
      .isCalledWith(USER_EMAIL)
      .thenResolve(null);

    // Authenticate the user
    const isAuthenticated = await authService.authenticate(
      USER_EMAIL,
      "NOT THE RIGHT PASSWORD"
    );

    // Verify if the userRepositoryMock's getUserByEmail method was called with the correct arguments
    Mockit.suppose(userRepositoryMock.getUserByEmail)
      .willBeCalledWith(USER_EMAIL)
      .once();
    Mockit.verify(userRepositoryMock);

    // Check if the user was authenticated successfully
    expect(isAuthenticated).toBe(false);
  });
});

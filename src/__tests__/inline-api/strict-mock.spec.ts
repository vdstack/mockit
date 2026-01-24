import { StrictMock, m } from "../../index";

interface UserService {
  getUser(id: number): { id: number; name: string };
  deleteUser(id: number): void;
}

class UserServiceClass {
  getUser(id: number): { id: number; name: string } {
    return { id, name: "Real User" };
  }
  deleteUser(id: number): void {
    console.log(`Deleting user ${id}`);
  }
}

describe("StrictMock", () => {
  describe("with interface mock", () => {
    it("throws when an unconfigured method is called", () => {
      const mock = StrictMock<UserService>();

      expect(() => mock.getUser(1)).toThrow("No behavior configured for 'getUser'");
    });

    it("includes the method name in the error message", () => {
      const mock = StrictMock<UserService>();

      expect(() => mock.deleteUser(1)).toThrow("No behavior configured for 'deleteUser'");
    });

    it("works normally when the method is configured", () => {
      const mock = StrictMock<UserService>();
      mock.getUser.mockReturnValue({ id: 1, name: "Test User" });

      const result = mock.getUser(1);

      expect(result).toEqual({ id: 1, name: "Test User" });
    });

    it("works with partial configuration", () => {
      const mock = StrictMock<UserService>({
        getUser: m.returns({ id: 42, name: "Configured User" }),
      });

      expect(mock.getUser(1)).toEqual({ id: 42, name: "Configured User" });
      expect(() => mock.deleteUser(1)).toThrow("No behavior configured for 'deleteUser'");
    });
  });

  describe("with class mock", () => {
    it("throws when an unconfigured method is called", () => {
      const mock = StrictMock(UserServiceClass);

      expect(() => mock.getUser(1)).toThrow("No behavior configured for 'getUser'");
    });

    it("works normally when the method is configured", () => {
      const mock = StrictMock(UserServiceClass);
      mock.getUser.mockReturnValue({ id: 1, name: "Test User" });

      const result = mock.getUser(1);

      expect(result).toEqual({ id: 1, name: "Test User" });
    });
  });

  describe("with function mock", () => {
    it("throws when called without configuration", () => {
      const fn = (x: number) => x * 2;
      const mock = StrictMock(fn);

      expect(() => mock(5)).toThrow("No behavior configured");
    });

    it("works normally when configured", () => {
      const fn = (x: number) => x * 2;
      const mock = StrictMock(fn);
      mock.mockReturnValue(100);

      expect(mock(5)).toBe(100);
    });
  });

  describe("accessible via m.StrictMock", () => {
    it("is available on the m namespace", () => {
      const mock = m.StrictMock<UserService>();

      expect(() => mock.getUser(1)).toThrow("No behavior configured for 'getUser'");
    });
  });
});

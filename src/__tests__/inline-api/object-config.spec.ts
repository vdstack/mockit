import { Mock } from "../..";

interface UserService {
  getUser(id: number): { id: number; name: string };
  saveUser(user: { name: string }): Promise<boolean>;
  deleteUser(id: number): void;
}

class UserRepository {
  getUser(id: number): { id: number; name: string } {
    return { id, name: "Real User" };
  }
  save(user: { name: string }): boolean {
    return true;
  }
}

describe("Object/Class/Interface mock with config", () => {
  describe("Mock<Interface>({ config })", () => {
    it("should create mock with configured methods", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 1, name: "Mocked User" } },
      });

      expect(mock.getUser(1)).toEqual({ id: 1, name: "Mocked User" });
      expect(mock.getUser(999)).toEqual({ id: 1, name: "Mocked User" });
    });

    it("should support resolves for async methods", async () => {
      const mock = Mock<UserService>({
        saveUser: { resolves: true },
      });

      expect(await mock.saveUser({ name: "Test" })).toBe(true);
    });

    it("should support multiple method configs", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 42, name: "Answer" } },
        deleteUser: { throws: new Error("Not allowed") },
      });

      expect(mock.getUser(1)).toEqual({ id: 42, name: "Answer" });
      expect(() => mock.deleteUser(1)).toThrow("Not allowed");
    });

    it("should return undefined for unconfigured methods", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 1, name: "Test" } },
      });

      // saveUser is not configured, should return undefined
      expect(mock.saveUser({ name: "Test" })).toBe(undefined);
    });
  });

  describe("Mock(Class, { config })", () => {
    it("should create mock with configured methods", () => {
      const mock = Mock(UserRepository, {
        getUser: { returns: { id: 100, name: "From Class" } },
      });

      expect(mock.getUser(1)).toEqual({ id: 100, name: "From Class" });
    });

    it("should allow chainable methods on configured mocks", () => {
      const mock = Mock(UserRepository, {
        getUser: { returns: { id: 1, name: "Initial" } },
      });

      expect(mock.getUser(1)).toEqual({ id: 1, name: "Initial" });

      // Can still use chainable methods to modify behavior
      mock.getUser.mockReturnValue({ id: 2, name: "Updated" });
      expect(mock.getUser(1)).toEqual({ id: 2, name: "Updated" });
    });
  });

  describe("Mock(plainObject)", () => {
    it("should mock plain objects", () => {
      const service = {
        getData: () => "real data",
        processData: (x: number) => x * 2,
      };

      const mock = Mock(service);
      expect(mock.getData()).toBe(undefined);
      expect(mock.processData(5)).toBe(undefined);

      // Can configure via chainable methods
      mock.getData.mockReturnValue("mocked data");
      expect(mock.getData()).toBe("mocked data");
    });
  });

  describe("Configured methods have chainable API", () => {
    it("should expose mockReturnValue on configured methods", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 1, name: "First" } },
      });

      // Initial config
      expect(mock.getUser(1)).toEqual({ id: 1, name: "First" });

      // Override with chainable method
      mock.getUser.mockReturnValue({ id: 2, name: "Second" });
      expect(mock.getUser(1)).toEqual({ id: 2, name: "Second" });
    });

    it("should expose once methods on configured mocks", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 0, name: "Default" } },
      });

      mock.getUser
        .mockReturnValueOnce({ id: 1, name: "First" })
        .mockReturnValueOnce({ id: 2, name: "Second" });

      expect(mock.getUser(1)).toEqual({ id: 1, name: "First" });
      expect(mock.getUser(1)).toEqual({ id: 2, name: "Second" });
      expect(mock.getUser(1)).toEqual({ id: 0, name: "Default" });
    });

    it("should track calls on configured methods", () => {
      const mock = Mock<UserService>({
        getUser: { returns: { id: 1, name: "Test" } },
      });

      mock.getUser(1);
      mock.getUser(2);
      mock.getUser(3);

      expect(mock.getUser.calls.length).toBe(3);
      expect(mock.getUser.calls[0].args).toEqual([1]);
      expect(mock.getUser.calls[1].args).toEqual([2]);
      expect(mock.getUser.calls[2].args).toEqual([3]);
    });
  });
});

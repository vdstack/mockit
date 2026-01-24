import { verifyThat } from "../../assertions";
import { when } from "../../behaviours";
import { Mock } from "../..";

type User = {
  name: string;
  age: number;
};

type UserRepository = {
  getUser: (name: string) => User;
  saveUser: (user: User) => void;
};

describe("Mock", () => {
  it("should mock the type and automatically mock the functions when you set them up", () => {
    const mock = Mock<UserRepository>();
    when(mock.getUser)
      .isCalledWith("Victor")
      .thenReturn({ name: "Victor", age: 22 });

    const user = mock.getUser("Victor");

    verifyThat(mock.getUser).wasCalledWith("Victor");
    expect(user).toEqual({ name: "Victor", age: 22 });
  });

  it("If no setup was done, it should return undefined", () => {
    const mock = Mock<UserRepository>();
    const user = mock.getUser("Victor");

    expect(user).toBeUndefined();
  });

  it("should be equivalent for Mock", () => {
    const mockT = Mock<UserRepository>();
    const mockI = Mock<UserRepository>();

    expect(mockT.getUser("Victor")).toBeUndefined();
    expect(mockI.getUser("Victor")).toBeUndefined();

    when(mockT.getUser)
      .isCalledWith("Victor")
      .thenReturn({ name: "Victor", age: 22 });

    when(mockI.getUser)
      .isCalledWith("Victor")
      .thenReturn({ name: "Victor", age: 22 });

    const user = mockT.getUser("Victor");
    const userI = mockI.getUser("Victor");

    verifyThat(mockT.getUser).wasCalledWith("Victor");
    verifyThat(mockI.getUser).wasCalledWith("Victor");

    expect(user).toEqual(userI);
  });
});

test("MOCK should work", () => {
  type User = { name: string; age: number };
  class UserRepoConcrete {
    getUser(name: string): User {
      return { name: "Victor", age: 22 };
    }

    saveUser(user: User): void {
      // Do nothing
    }
  }

  const UserRepo = Mock(UserRepoConcrete);
  UserRepo.getUser("Victor");
  UserRepo.saveUser({ name: "Victor", age: 22 });

  verifyThat(UserRepo.getUser).wasCalledWith("Victor");
  verifyThat(UserRepo.saveUser).wasCalledWith({ name: "Victor", age: 22 });

  abstract class AbstractUserRepo {
    abstract getUser(name: string): User;
    abstract saveUser(user: User): void;
  }

  const abstractRepoMock = Mock(AbstractUserRepo);
  abstractRepoMock.getUser("Victor");
  abstractRepoMock.saveUser({ name: "Victor", age: 22 });

  verifyThat(abstractRepoMock.getUser).wasCalledWith("Victor");
  verifyThat(abstractRepoMock.saveUser).wasCalledWith({
    name: "Victor",
    age: 22,
  });

  const objectRepository = {
    getUser: (_name: string) => ({ name: "Victor", age: 22 }),
    saveUser: (_user: User) => {
      // Do nothing
    },
  };

  const objectRepoMock = Mock(objectRepository);

  objectRepoMock.getUser("Victor");
  objectRepoMock.saveUser({ name: "Victor", age: 22 });

  function testFunction(a: string) {
    return `${a} test` as const;
  }

  const functionMock = Mock(testFunction);
  expect(functionMock("hello")).toBe(undefined);

  when(functionMock).isCalledWith("hello").thenReturn("hello test");

  expect(functionMock("hello")).toBe("hello test");
});

import { randomUUID } from "crypto";
import { m } from "../..";

interface User {
  id: string;
  properties: {
    name: string;
    age: number;
    address: string;
    location: {
      lat: number;
      lng: number;
      city: string;
      country: string;
    };
  };
}

type UserService = {
  getUser: (id: string) => Promise<User>;
};

async function getUserBasicInfo(id: string, userService: UserService) {
  const user = await userService.getUser(id);
  return {
    id,
    properties: {
      name: user.properties.name,
      age: user.properties.age,
      address: user.properties.address,
      // Here, we're using the location object but changing the name of some properties & ommiting others.
      latitude: user.properties.location.lat,
      longitude: user.properties.location.lng,
    },
  };
}

test("should work with no wrapper", async () => {
  const userService = m.Mock<UserService>();
  m.when(userService.getUser).isCalled.thenResolve({
    id: randomUUID(),
    properties: {
      name: "John Doe",
      age: 30,
      address: "123 Main St",
      location: m.partial({
        lat: m.anyNumber(),
        lng: m.anyNumber(),
      }),
    },
  });

  const user = await getUserBasicInfo("123", userService);

  expect(user).toEqual({
    id: expect.any(String),
    properties: {
      name: expect.any(String),
      age: expect.any(Number),
      address: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    },
  });
});

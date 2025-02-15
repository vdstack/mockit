import { randomUUID } from "crypto";
import { m } from "../..";
import { z } from "zod";

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

test("veeeery deep matchers in plain object", async () => {
  function hi(): any {}

  const mock = m.Mock(hi);

  m.when(mock).isCalled.thenResolve({
    x: 1,
    y: {
      z: {
        a: {
          b: {
            c: {
              d: {
                e: {
                  age: m.anyNumber(),
                  f: {
                    g: {
                      h: {
                        i: {
                          j: {
                            name: m.anyString(),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      k: [[[[[{ key: m.validates(z.string()) }]]]]],
    },
    k2: [{ key: m.validates(z.string()) }],
  });

  const result = await mock();

  expect(result.x).toEqual(1);
  expect(result.y.z.a.b.c.d.e.age).toEqual(expect.any(Number));
  expect(result.y.z.a.b.c.d.e.f.g.h.i.j.name).toEqual(expect.any(String));
  expect(result.y.k[0][0][0][0][0].key).toEqual(expect.any(String));
  expect(result.k2[0].key).toEqual(expect.any(String));
});

test("should work with maps", async () => {
  function hi(): Map<string, any> {
    return new Map();
  }
  const mock = m.Mock(hi);
  m.when(mock).isCalled.thenResolve(
    new Map([
      ["key", m.anyString()],
      [
        "key2",
        {
          x: m.anyString(),
          y: m.anyNumber(),
          z: [m.anyString()],
          w: {
            a: {
              b: {
                name: m.anyString(),
              },
            },
          },
        },
      ],
    ])
  );

  const result = await mock();
  expect(result.get("key")).toEqual(expect.any(String));
  expect(result.get("key2")).toEqual({
    x: expect.any(String),
    y: expect.any(Number),
    z: [expect.any(String)],
    w: {
      a: {
        b: {
          name: expect.any(String),
        },
      },
    },
  });
});

test("should work with sets", async () => {
  function hi(): Set<any> {
    return new Set();
  }
  const mock = m.Mock(hi);
  m.when(mock).isCalled.thenResolve(new Set([m.anyString()]));
  const result = await mock();
  for (const item of result) {
    expect(item).toEqual(expect.any(String));
  }
});

import z from "zod";
import { verifyThat } from "../../assertions";
import {
  schema,
  unsafe,
  containing,
  containingDeep,
} from "../../behaviours/constructs";
import { Mock } from "../../mocks";

function func(params: {
  name: string;
  age: number;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}) {
  return params;
}

const funcMock = Mock(func);
funcMock({
  address: "123",
  age: 123,
  location: { lat: 123, lng: 123 },
  name: "123",
});

test("wasCalledWith should accept partial construct", () => {
  verifyThat(funcMock).wasCalledOnceWith(containing({ address: "123" }));
  verifyThat(funcMock).wasNeverCalledWith(containing({ address: "1234" }));
});

test("wasCalledWith should accept zod schema construct", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    schema(
      z.object({
        address: z.string(),
      })
    )
  );
  verifyThat(funcMock).wasNeverCalledWith(schema(z.string().uuid()));
});

test("should accept unsafe construct", () => {
  verifyThat(funcMock).wasNeverCalledWith(unsafe(2));
  verifyThat(funcMock).wasNeverCalledWith(unsafe({ address: "1234" }));
});

test("should accept partials in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    containing({
      location: containing({ lat: 123 }),
      age: schema(z.number()),
    })
  );
});

test("should accept schemas in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    containing({
      location: containing({ lat: 123 }),
      age: schema(z.number()),
    })
  );
});

test("should accept unsafe in partials", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    containing({
      address: unsafe(2),
    })
  );
});

test("should accept partials in objects", () => {
  verifyThat(funcMock).wasCalledOnceWith({
    location: containing({ lat: 123 }),
    age: schema(z.number()),
    address: "123",
    name: "123",
  });
});

test("should accept partialDeep constructs", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    containingDeep({
      location: { lat: 123 },
    })
  );
});

test("should accept partialDeep in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    containing({
      location: containingDeep({ lat: 123 }),
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    containing({
      location: containingDeep({ lat: 1234 }),
    })
  );
});

test("should acces partialDeep in unsafe", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    unsafe({
      location: containingDeep({ lat: 123 }),
      address: "123",
      age: 123,
      name: "123",
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    unsafe({
      location: containingDeep({ lat: 1234 }),
      address: "123",
      age: 123,
      name: "123",
    })
  );
});

test("should accept unsafe in partialDeep", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    containingDeep({
      location: unsafe({ lat: "Victor" }),
    })
  );

  verifyThat(funcMock).wasCalledOnceWith(
    containingDeep({
      location: unsafe({
        lat: (() => {
          return 123;
        })(),
      }),
    })
  );
});

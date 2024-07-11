import z from "zod";
import { verifyThat } from "../../assertions";
import { validates, unsafe } from "../../behaviours/matchers";
import { Mock } from "../../mocks";
import { m } from "../..";

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
  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContaining({ address: "123" })
  );
  verifyThat(funcMock).wasNeverCalledWith(
    m.objectContaining({ address: "1234" })
  );
});

test("wasCalledWith should accept zod schema construct", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    validates(
      z.object({
        address: z.string(),
      })
    )
  );
  verifyThat(funcMock).wasNeverCalledWith(validates(z.string().uuid()));
});

test("should accept unsafe construct", () => {
  verifyThat(funcMock).wasNeverCalledWith(unsafe(2));
  verifyThat(funcMock).wasNeverCalledWith(unsafe({ address: "1234" }));
});

test("should accept partials in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContaining({
      location: m.objectContaining({ lat: 123 }),
      age: validates(z.number()),
    })
  );
});

test("should accept schemas in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContaining({
      location: m.objectContaining({ lat: 123 }),
      age: validates(z.number()),
    })
  );
});

test("should accept unsafe in partials", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    m.objectContaining({
      address: unsafe(2),
    })
  );
});

test("should accept partials in objects", () => {
  verifyThat(funcMock).wasCalledOnceWith({
    location: m.objectContaining({ lat: 123 }),
    age: validates(z.number()),
    address: "123",
    name: "123",
  });
});

test("should accept partialDeep constructs", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContainingDeep({
      location: { lat: 123 },
    })
  );
});

test("should accept partialDeep in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContaining({
      location: m.objectContainingDeep({ lat: 123 }),
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    m.objectContaining({
      location: m.objectContainingDeep({ lat: 1234 }),
    })
  );
});

test("should acces partialDeep in unsafe", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    unsafe({
      location: m.objectContainingDeep({ lat: 123 }),
      address: "123",
      age: 123,
      name: "123",
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    unsafe({
      location: m.objectContainingDeep({ lat: 1234 }),
      address: "123",
      age: 123,
      name: "123",
    })
  );
});

test("should accept unsafe in partialDeep", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    m.objectContainingDeep({
      location: unsafe({ lat: "Victor" }),
    })
  );

  verifyThat(funcMock).wasCalledOnceWith(
    m.objectContainingDeep({
      location: unsafe({
        lat: (() => {
          return 123;
        })(),
      }),
    })
  );
});

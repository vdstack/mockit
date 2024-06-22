import z from "zod";
import { verifyThat } from "../../assertions";
import {
  deepPartial,
  partial,
  schema,
  unsafe,
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
  verifyThat(funcMock).wasCalledOnceWith(partial({ address: "123" }));
  verifyThat(funcMock).wasNeverCalledWith(partial({ address: "1234" }));
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
    partial({
      location: partial({ lat: 123 }),
      age: schema(z.number()),
    })
  );
});

test("should accept schemas in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    partial({
      location: partial({ lat: 123 }),
      age: schema(z.number()),
    })
  );
});

test("should accept unsafe in partials", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    partial({
      address: unsafe(2),
    })
  );
});

test("should accept partials in objects", () => {
  verifyThat(funcMock).wasCalledOnceWith({
    location: partial({ lat: 123 }),
    age: schema(z.number()),
    address: "123",
    name: "123",
  });
});

test("should accept deepPartial constructs", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    deepPartial({
      location: { lat: 123 },
    })
  );
});

test("should accept deepPartial in partials", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    partial({
      location: deepPartial({ lat: 123 }),
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    partial({
      location: deepPartial({ lat: 1234 }),
    })
  );
});

test("should acces deepPartial in unsafe", () => {
  verifyThat(funcMock).wasCalledOnceWith(
    unsafe({
      location: deepPartial({ lat: 123 }),
    })
  );

  verifyThat(funcMock).wasNeverCalledWith(
    unsafe({
      location: deepPartial({ lat: 1234 }),
    })
  );
});

test("should accept unsafe in deepPartial", () => {
  verifyThat(funcMock).wasNeverCalledWith(
    deepPartial({
      location: unsafe({ lat: "Victor" }),
    })
  );

  verifyThat(funcMock).wasCalledOnceWith(
    deepPartial({
      location: unsafe({
        lat: (() => {
          return 123;
        })(),
      }),
    })
  );
});

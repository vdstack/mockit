import { z } from "zod";

import { mockFunction, verifyThat } from "..";

function registerAdultAccount(...args: any[]) {}
function registerMinorAccount(...args: any[]) {}

const adultSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().min(18),
});

const minorSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().max(17),
});

function createAccount(
  user: z.infer<typeof adultSchema | typeof minorSchema>,
  registry: {
    createAdult: typeof registerAdultAccount;
    createMinor: typeof registerMinorAccount;
  }
) {
  if (user.age < 18) {
    return registry.createMinor(user);
  }

  return registry.createAdult(user);
}

/**
 * The createAccount function should either:
 * - call the minor registration function if the user is a minor
 * - call the adult registration function if the user is an adult
 *
 * The following tests use zod schemas to make assertions about how the function will be called
 * They also check that the other function is not called.
 *
 * This is a good example of how to use suppositions verify business logic.
 */

it("should only call minor registration if user is minor", () => {
  const adultRegistrationMock = mockFunction(registerAdultAccount);
  const minorRegistrationMock = mockFunction(registerMinorAccount);

  createAccount(
    // real uuid plz
    {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "John",
      email: "hii@gmail.com",
      age: 17,
    },
    { createAdult: adultRegistrationMock, createMinor: minorRegistrationMock }
  );

  verifyThat(minorRegistrationMock).zod.wasCalledOnceWith(minorSchema);
  verifyThat(adultRegistrationMock).wasNeverCalled();
});

it("should only call adult registration if user is adult", () => {
  const adultRegistrationMock = mockFunction(registerAdultAccount);
  const minorRegistrationMock = mockFunction(registerMinorAccount);

  createAccount(
    {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "John",
      email: "adult@gmail.com",
      age: 18,
    },
    { createAdult: adultRegistrationMock, createMinor: minorRegistrationMock }
  );

  verifyThat(adultRegistrationMock).zod.wasCalledOnceWith(adultSchema);
  verifyThat(minorRegistrationMock).wasNeverCalled();
});

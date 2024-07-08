/**
 * Let's say you have a function that uses two dependencies.
 * Once of them is a repository connected to a database.
 * The other one is an EmailService that allows you to send emails.
 *
 * You might want to test the function with a real DB, but you don't want to send real emails.
 *
 * In this case, Mockit can help you by mocking only the email service and verifying that it was called correctly.
 */

import { Mock, when, verifyThat, m } from "..";

interface UserRepository {
  getUserById(id: number): Promise<{ id: number; email: string; name: string }>;
}

interface EmailService {
  sendEmail(p: {to: string[], content: string}): Promise<{ emailID: number }>;
}

async function sendWelcomeEmail(
  userId: number,
  deps: {
    userRepository: UserRepository;
    emailService: EmailService;
  }
) {
  const user = await deps.userRepository.getUserById(userId);
  if (!user) throw new Error("User not found");

  const { emailID } = await deps.emailService.sendEmail({
    to: [user.email],
    content: `Welcome ${user.name}!`
  });
  if (!emailID) throw new Error("Email not sent");

  return emailID;
}

/**
 * For this example I will use an inMemory version of the UserRepository.
 * In your case you would inject a real implementation connected to your DB.
 */
class DBUserRepository implements UserRepository {
  private users = [];
  constructor(users: { id: number; email: string; name: string }[]) {
    // in reality you would probably connect to a DB here or receive a transaction of some sort.
    this.users = users;
  }

  async getUserById(id: number) {
    // Here you would query the DB.
    return this.users.find((u) => u.id === id);
  }
}

test("it should send an email if the user exists and the mail ID", async () => {
  const user = {
    email: "user@gmail.com",
    id: 1,
    name: "User",
  };

  // We mock the email service to avoid sending real emails.
  const emailService = Mock<EmailService>();
  // We configure the mock to return a fake email ID that we will check as a return value.
  when(emailService.sendEmail).isCalled.thenResolve({ emailID: 1 });

  const userRepository = new DBUserRepository([
    {
      email: "user@gmail.com",
      id: 1,
      name: "User",
    },
  ]);

  const emailID = await sendWelcomeEmail(1, {
    emailService,
    userRepository,
  });

  // We check that the sendWelcomeEmail function returns the email ID provided by the emailService as expected.
  expect(emailID).toBe(1);

  // We verify that the email service was called with the correct arguments.
  verifyThat(emailService.sendEmail).wasCalledWith(
    m.objectContaining({
      to: [user.email],
      content: m.any.string() // changing the content won't break the test => it's more resilient to changes in the implementation
    })
  );
});

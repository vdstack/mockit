import { mock, when, suppose, verify, spy } from "../";

interface Notifier {
  send(to: string, message: string): Promise<void>;
}

class EmailNotifier implements Notifier {
  async send(to: string, message: string): Promise<void> {
    // Implementation for sending an email
  }
}

class SmsNotifier implements Notifier {
  async send(to: string, message: string): Promise<void> {
    // Implementation for sending an SMS
  }
}

class NotificationService {
  constructor(private emailNotifier: Notifier, private smsNotifier: Notifier) {}

  async sendEmail(to: string, message: string): Promise<void> {
    return this.emailNotifier.send(to, message);
  }

  async sendSms(to: string, message: string): Promise<void> {
    return this.smsNotifier.send(to, message);
  }

  async sendMessage(
    to: string,
    message: string,
    type: "email" | "sms"
  ): Promise<void> {
    switch (type) {
      case "email":
        return this.emailNotifier.send(to, message);
      case "sms":
        return this.smsNotifier.send(to, message);
      default:
        throw new Error("Invalid message type");
    }
  }
}

describe("NotificationService", () => {
  // Create a NotificationService instance with the mocked notifiers
  let notificationService: NotificationService;
  let emailNotifierMock: Notifier;
  let smsNotifierMock: Notifier;

  beforeEach(() => {
    // reset the mocks before each test
    emailNotifierMock = mock(EmailNotifier);
    smsNotifierMock = mock(SmsNotifier);
    notificationService = new NotificationService(
      emailNotifierMock,
      smsNotifierMock
    );
  });

  test("sendEmail should use the email notifier", async () => {
    const to = "test@example.com";
    const message = "Hello, Email!";

    // Set up the behavior for the emailNotifierMock's send method
    when(emailNotifierMock.send)
      .isCalledWith(to, message)
      .thenResolve(undefined);

    // Use the notification service to send an email
    await notificationService.sendEmail(to, message);

    // Verify if the emailNotifierMock's send method was called with the correct arguments
    suppose(emailNotifierMock.send).willBeCalledWith(to, message).once();
    verify(emailNotifierMock, smsNotifierMock);
  });

  test("sendSms should use the sms notifier", async () => {
    const to = "+1234567890";
    const message = "Hello, SMS!";

    // Set up the behavior for the smsNotifierMock's send method
    when(smsNotifierMock.send).isCalledWith(to, message).thenResolve(undefined);

    // Use the notification service to send an SMS
    await notificationService.sendSms(to, message);

    // Verify if the smsNotifierMock's send method was called with the correct arguments
    suppose(emailNotifierMock.send).willBeCalledWith(to, message).once();
    verify(smsNotifierMock, emailNotifierMock);
  });

  test("sendMessage should use the sms notifier if asked so", async () => {
    const to = "+1234567890";
    const message = "Hello, SMS!";

    // Set up the behavior for the smsNotifierMock's send method
    when(smsNotifierMock.send).isCalledWith(to, message).thenResolve(undefined);

    // Use the notification service to send an SMS
    await notificationService.sendMessage(to, message, "sms");

    // Verify if the smsNotifierMock's send method was called with the correct arguments
    suppose(smsNotifierMock.send).willBeCalledWith(to, message).once();
    suppose(emailNotifierMock.send).willNotBeCalled();
    verify(smsNotifierMock, emailNotifierMock);
  });

  test("sendMessage should use the email notifier if asked so", async () => {
    const to = "test@example.com";
    const message = "Hello, Email!";

    // Set up the behavior for the emailNotifierMock's send method
    when(emailNotifierMock.send)
      .isCalledWith(to, message)
      .thenResolve(undefined);

    // Use the notification service to send an email
    await notificationService.sendMessage(to, message, "email");

    // Verify if the emailNotifierMock's send method was called with the correct arguments
    suppose(emailNotifierMock.send).willBeCalledWith(to, message).once();
    suppose(smsNotifierMock.send).willNotBeCalled();
    verify(emailNotifierMock, smsNotifierMock);
  });

  test("sendMessage should throw an error if an invalid type is passed", async () => {
    const to = "+1234567890";
    const message = "Hello, SMS!";

    // Use the notification service to send an SMS
    await expect(
      notificationService.sendMessage(to, message, "invalid" as any)
    ).rejects.toThrowError("Invalid message type");
  });
});

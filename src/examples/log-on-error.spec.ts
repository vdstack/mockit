import { mockFunction, when, verifyThat, spyMockedFunction } from "../v3";

function log(_: string): void {
  // ... logs something
}
function broadCast(_: string): void {
  // ... broadcasts something
}

function sendMessage(
  message: string,
  {
    logger,
    broadcaster,
  }: {
    logger: (x: string) => void;
    broadcaster: (x: string) => void;
  }
): void {
  try {
    logger(`Sending message "${message}"`);
    broadcaster(message);
    logger(`Message "${message}" sent`);
  } catch (err) {
    logger(`Error while sending message "${message}"`);
  }
}

it("should log the error message if broadcast failed", () => {
  const logMock = mockFunction(log);
  const broadcastMock = mockFunction(broadCast);
  const MESSAGE = "hello";

  when(broadcastMock).isCalled.thenThrow("Error while broadcasting");

  sendMessage(MESSAGE, { logger: logMock, broadcaster: broadcastMock });

  verifyThat(logMock).wasCalledWith(`Sending message "${MESSAGE}"`);
  verifyThat(logMock).wasCalledWith(`Error while sending message "${MESSAGE}"`);
});

it("should log the success message if broadcast succeeded", () => {
  const logMock = mockFunction(log);
  const broadcastMock = mockFunction(broadCast);
  const MESSAGE = "hello";

  when(broadcastMock).isCalled.thenReturn(undefined);

  sendMessage(MESSAGE, { logger: logMock, broadcaster: broadcastMock });

  verifyThat(logMock).wasCalledWith(`Sending message "${MESSAGE}"`);
  verifyThat(logMock).wasCalledWith(`Message "${MESSAGE}" sent`);
});

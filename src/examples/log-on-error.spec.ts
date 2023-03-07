import { mockFunction, suppose, verify, when } from "..";

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

  suppose(logMock).willBeCalledWith(`Sending message ${MESSAGE}`);
  suppose(logMock).willBeCalledWith(`Error while sending message ${MESSAGE}`);

  sendMessage(MESSAGE, { logger: logMock, broadcaster: broadcastMock });

  verify(logMock);
});

it("should log the success message if broadcast succeeded", () => {
  const logMock = mockFunction(log);
  const broadcastMock = mockFunction(broadCast);
  const MESSAGE = "hello";

  when(broadcastMock).isCalled.thenReturn(undefined);

  suppose(logMock).willBeCalledWith(`Sending message ${MESSAGE}`);
  suppose(logMock).willBeCalledWith(`Message ${MESSAGE} sent`);

  sendMessage(MESSAGE, { logger: logMock, broadcaster: broadcastMock });

  verify(logMock);
});

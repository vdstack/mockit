import { z } from "zod";
import { Mock, Reset, when } from "../..";
import { schema, unsafe } from "../../behaviours/constructs";
import { randomUUID } from "crypto";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber(...args: any[]) {
  return 2;
}

describe("thenReturn", () => {
  it("should return undefined by default", () => {
    expect(Mock(hello)()).toBe(undefined);
  });

  it("should return the desired value", () => {
    const mock = Mock(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturn(999);
    expect(mock()).toBe(999);
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(returnNumber);
    when(mock).isCalled.thenReturn(999);
    when(mock).isCalledWith(2).thenReturn(777);

    expect(mock()).toBe(999);
    expect(mock(2)).toBe(777);
  });
});

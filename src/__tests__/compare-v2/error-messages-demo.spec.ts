/**
 * Demo file to showcase the new error messages
 *
 * To see the error messages, temporarily remove `.skip` and run:
 * pnpm test src/__tests__/compare-v2/error-messages-demo.spec.ts
 *
 * These tests are designed to FAIL to show the error messages.
 */

import { Mock } from "../../mocks";
import { verifyThat } from "../../assertions/verifyThat";
import { m } from "../..";

describe("Error Messages Demo", () => {
  it("placeholder to keep the file in CI", () => {
    expect(true).toBe(true);
  });

  // 1. Function never called
  it.skip("Demo: Function never called", () => {
    const mock = Mock((name: string) => `Hello ${name}`);
    verifyThat(mock).wasCalledWith("John");
  });

  // 2. Value mismatch - shows closest calls with diff
  it.skip("Demo: Value mismatch with multiple calls", () => {
    const mock = Mock((name: string, age: number) => `${name} is ${age}`);
    mock("Jane", 30);
    mock("Bob", 42);
    mock("John", 99); // Closest to expected

    verifyThat(mock).wasCalledWith("John", 25);
  });

  // 3. Object mismatch - nested diff
  it.skip("Demo: Object mismatch", () => {
    const mock = Mock((user: { name: string; address: { city: string } }) => user);
    mock({ name: "Victor", address: { city: "Paris" } });

    verifyThat(mock).wasCalledWith({
      name: "Victor",
      address: { city: "Lyon" },
    });
  });

  // 4. Matcher failed
  it.skip("Demo: Matcher failed", () => {
    const mock = Mock((id: string | number) => id);
    mock(12345);

    verifyThat(mock).wasCalledWith(m.anyString());
  });

  // 5. Verbose mode - shows all calls
  it.skip("Demo: Verbose mode", () => {
    const mock = Mock((x: number) => x * 2);
    mock(1);
    mock(2);
    mock(3);
    mock(4);
    mock(5);

    verifyThat(mock, { verbose: true }).wasCalledWith(100);
  });
});

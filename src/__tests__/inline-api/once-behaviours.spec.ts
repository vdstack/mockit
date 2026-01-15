import { Mock } from "../..";

describe("Once behaviours (FIFO queue)", () => {
  function getValue(): number {
    return 0;
  }

  async function fetchData(): Promise<string> {
    return "real";
  }

  describe("mockReturnValueOnce", () => {
    it("should return value once then fallback to default", () => {
      const mock = Mock(getValue);
      mock.mockReturnValueOnce(1);

      expect(mock()).toBe(1);
      expect(mock()).toBe(undefined); // fallback to default
    });

    it("should process multiple once values in FIFO order", () => {
      const mock = Mock(getValue);
      mock.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3);

      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(3);
      expect(mock()).toBe(undefined); // fallback
    });

    it("should combine with mockReturnValue for fallback", () => {
      const mock = Mock(getValue);
      mock.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99);

      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(99); // fallback to default
      expect(mock()).toBe(99);
      expect(mock()).toBe(99);
    });
  });

  describe("mockResolvedValueOnce", () => {
    it("should resolve once then fallback", async () => {
      const mock = Mock(fetchData);
      mock.mockResolvedValueOnce("first").mockResolvedValue("default");

      expect(await mock()).toBe("first");
      expect(await mock()).toBe("default");
    });
  });

  describe("mockRejectedValueOnce", () => {
    it("should reject once then fallback", async () => {
      const mock = Mock(fetchData);
      mock.mockRejectedValueOnce(new Error("once")).mockResolvedValue("ok");

      await expect(mock()).rejects.toThrow("once");
      expect(await mock()).toBe("ok");
    });
  });

  describe("mockImplementationOnce", () => {
    it("should use implementation once then fallback", () => {
      const mock = Mock(getValue);
      let count = 0;
      mock.mockImplementationOnce(() => ++count * 10).mockReturnValue(0);

      expect(mock()).toBe(10);
      expect(mock()).toBe(0);
      expect(mock()).toBe(0);
    });

    it("should stack multiple implementations", () => {
      const mock = Mock(getValue);
      mock
        .mockImplementationOnce(() => 100)
        .mockImplementationOnce(() => 200)
        .mockImplementationOnce(() => 300);

      expect(mock()).toBe(100);
      expect(mock()).toBe(200);
      expect(mock()).toBe(300);
      expect(mock()).toBe(undefined);
    });
  });

  describe("mockThrowOnce", () => {
    it("should throw once then fallback", () => {
      const mock = Mock(getValue);
      mock.mockThrowOnce(new Error("once")).mockReturnValue(0);

      expect(() => mock()).toThrow("once");
      expect(mock()).toBe(0);
    });
  });

  describe("mixing once behaviors", () => {
    it("should process different once behaviors in order", () => {
      const mock = Mock(getValue);
      mock
        .mockReturnValueOnce(1)
        .mockImplementationOnce(() => 2)
        .mockReturnValueOnce(3);

      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(3);
    });
  });

  describe("reset clears once queue", () => {
    it("mockReset should clear once behaviors", () => {
      const mock = Mock(getValue);
      mock.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99);

      expect(mock()).toBe(1);
      mock.mockReset();
      expect(mock()).toBe(undefined); // queue cleared, default reset
    });
  });
});

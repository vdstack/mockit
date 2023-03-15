import { Mockit } from "../";

interface Configuration {
  key: string;
  value: string;
}

interface ConfigurationLoader {
  load(): Promise<Configuration[]>;
}

class ConfigurationService {
  private configurations: Map<string, string>;

  constructor(private configurationLoader: ConfigurationLoader) {
    this.configurations = new Map<string, string>();
  }

  async loadConfigurations(): Promise<void> {
    const configs = await this.configurationLoader.load();
    configs.forEach((config) =>
      this.configurations.set(config.key, config.value)
    );
  }

  getConfiguration(key: string): string | undefined {
    return this.configurations.get(key);
  }
}

// Create a mock instance of the ConfigurationLoader interface
const configurationLoaderMock =
  Mockit.mockInterface<ConfigurationLoader>("load");

// Create a ConfigurationService instance with the mocked configuration loader
const configurationService = new ConfigurationService(configurationLoaderMock);

describe("ConfigurationService", () => {
  it("loads configurations correctly", async () => {
    const configs = [
      { key: "config1", value: "value1" },
      { key: "config2", value: "value2" },
    ];

    // Set up the behavior for the configurationLoaderMock's load method
    Mockit.when(configurationLoaderMock.load).isCalled.thenResolve(configs);

    // Load configurations
    await configurationService.loadConfigurations();

    // Verify if the configurationLoaderMock's load method was called
    Mockit.suppose(configurationLoaderMock.load).willBeCalled.once();
    Mockit.verify(configurationLoaderMock);

    // Check if the configurations were loaded correctly
    expect(configurationService.getConfiguration("config1")).toBe("value1");
    expect(configurationService.getConfiguration("config2")).toBe("value2");
  });
});

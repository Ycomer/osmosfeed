import yaml from "js-yaml";
import type { ParsableFile } from "./discover-files";
import { normalizeUrl } from "./normalize-url";
import { Config } from "../types";

export async function getConfig(configFile: ParsableFile | null): Promise<Config> {
  const userConfig = configFile ? parseUserConfig(configFile.rawText) : {};
  const mergedConfig: Config = { ...getDefaultConfig(), ...userConfig };
  const effectiveConfig: Config = {
    ...mergedConfig,
    sources: mergedConfig.sources.map((source) => ({
      ...source,
      href: normalizeUrl(source.href),
    })),
  };
  console.log(`[load-config] Effective config: `, effectiveConfig);
  return effectiveConfig;
}

function getDefaultConfig(): Config {
  return {
    sources: [],
  };
}

function parseUserConfig(configRawText: string) {
  return yaml.load(configRawText) as Partial<Config>;
}

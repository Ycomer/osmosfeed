import path from "path";
import { readFileAsync } from "../utils/fs";
import { CONFIG_FILENAME } from "./path-constants";

export interface SystemFiles {
  configFile: ParsableFile | null;
}

export interface ParsableFile extends PassthroughFile {
  rawText: string;
}

export interface PassthroughFile {
  filename: string;
  extension: string;
  path: string;
}

export async function discoverSystemFiles(): Promise<SystemFiles> {
  const configFile = await getParsableFile(path.resolve(CONFIG_FILENAME)).catch(() => null);
  return {
    configFile,
  };
}

export interface UserFiles {
  userStaticFiles: PassthroughFile[];
  userTemplateFiles: ParsableFile[];
  userSnippetFiles: ParsableFile[];
}

export async function getParsableFile(filePath: string): Promise<ParsableFile> {
  const rawText = await readFileAsync(filePath, "utf-8");
  return {
    filename: path.basename(filePath),
    extension: path.extname(filePath).toLowerCase(),
    path: filePath,
    rawText,
  };
}

export interface FileRequestFilter {
  (request: FileWithExtension): boolean;
}

export interface FileWithExtension {
  extension: string;
}

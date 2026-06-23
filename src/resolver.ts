// src/resolver.ts
import { promises as fs } from "fs";
import { log } from "./logger";

export interface FileSystemReader {
  read(path: string): Promise<string>;
  listAllFiles(): Promise<string[]>;
}

export interface FileSystem {
  readFile: (path: string, encoding: "utf-8") => Promise<string>;
}

export async function resolveSymbolLocation(
  filePaths: string[],
  symbol: string,
  fsProvider: FileSystem = fs,
): Promise<string | null> {
  for (const filePath of filePaths) {
    const content = await fsProvider.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    if (lines.some((line) => isDefinition(line, symbol))) {
      log(`[resolveSymbolLocation] ${filePath}`);
      return filePath;
    }
  }
  return null;
}

type SymbolMatch = {
  filePath: string;
  line: number;
  score: number;
};

export function scoreLine(line: string, symbol: string): number {
  const trimmed = line.trim();

  if (new RegExp(`\\bfn\\s+${symbol}\\b`).test(trimmed)) {
    return 100;
  }

  if (trimmed.startsWith("///")) return 10;
  if (trimmed.startsWith("//")) return 5;

  return 0;
}

export async function findBestDefinition(
  filePath: string,
  symbol: string,
): Promise<SymbolMatch | null> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  let bestMatch: SymbolMatch = { filePath, line: -1, score: 0 };

  for (let i = 0; i < lines.length; i++) {
    const score = scoreLine(lines[i], symbol);
    if (score > bestMatch.score) {
      bestMatch = { filePath, line: i, score };
    }
  }

  return bestMatch.score === 100 ? bestMatch : null;
}

export function getCommentDepth(line: string): number {
  const match = line.match(/^(\/\/+|\/\*+)/);
  return match ? match[0].length : 0;
}

/**
 * Determines if a line is a real function definition for a given symbol.
 * Layers:
 * - Returns false for // or /// comments
 * - Returns true for fn definitions
 */
export function isDefinition(line: string, symbol: string): boolean {
  const trimmed = line.trim();

  // 1. Layered comment check: If it starts with any number of slashes, it's a comment
  if (trimmed.startsWith("//")) {
    return false;
  }

  // 2. The Definition Check:
  // \b ensures we match 'run_agent_loop' but not 'my_run_agent_loop'
  const definitionRegex = new RegExp(`\\bfn\\s+${symbol}\\b`);

  return definitionRegex.test(trimmed);
}

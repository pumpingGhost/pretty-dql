import * as fs from 'fs';
import * as path from 'path';

export interface CollectTargetFilesOptions {
  extensions?: string[];
  recursive?: boolean;
}

const defaultExtensions = ['.txt', '.dql', '.js', '.jsx', '.ts', '.tsx'];

export function collectTargetFiles(
  inputPaths: string[],
  options: CollectTargetFilesOptions = {},
): string[] {
  const exts = options.extensions && options.extensions.length > 0 ? options.extensions : defaultExtensions;
  const recursive = options.recursive !== false; // default true

  const files = new Set<string>();

  for (const input of inputPaths) {
    const resolved = path.resolve(process.cwd(), input);

    if (!fs.existsSync(resolved)) {
      throw new Error(`Path not found: ${input}`);
    }

    const stat = fs.statSync(resolved);

    if (stat.isDirectory()) {
      collectFromDirectory(resolved, exts, recursive, files);
    } else if (stat.isFile()) {
      if (exts.includes(path.extname(resolved))) {
        files.add(resolved);
      }
    }
  }

  return Array.from(files).sort();
}

function collectFromDirectory(
  dirPath: string,
  extensions: string[],
  recursive: boolean,
  files: Set<string>,
): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (recursive) {
        collectFromDirectory(fullPath, extensions, recursive, files);
      }
    } else if (entry.isFile()) {
      if (extensions.includes(path.extname(fullPath))) {
        files.add(fullPath);
      }
    }
  }
}


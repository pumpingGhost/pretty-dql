import * as fs from 'fs';
import * as path from 'path';
import { extractDqlCommands } from './extractDqlCommands.util';
import { formatDqlCommand } from './formatDqlCommand.util';

export function parseFile(filename: string): void {
  const filePath = path.isAbsolute(filename)
    ? filename
    : path.resolve(process.cwd(), filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filename}`);
    process.exit(2);
  }

  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    const dqlCommands = extractDqlCommands(content);

    dqlCommands.forEach((command) => console.log(formatDqlCommand(command)));
  } catch (err) {
    console.error(
      `Error reading file ${filename}:`,
      err instanceof Error ? err.message : String(err),
    );
    process.exit(3);
  }
}

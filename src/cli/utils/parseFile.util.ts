import * as fs from 'fs';
import * as path from 'path';
import { extractDqlCommandLocations } from './extractDqlCommands.util';
import { formatDql } from '../../formatting/format-dql';

export function parseFile(filename: string, options?: { fix?: boolean }): void {
  const filePath = path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filename}`);
    process.exit(2);
  }

  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf-8');

    const dqlCommands = extractDqlCommandLocations(content);

    if (options?.fix) {
      // Sort descending by start index to replace from end to start
      dqlCommands.sort((a, b) => b.start - a.start);

      let modified = false;
      for (const cmd of dqlCommands) {
        const formatted = formatDql(cmd.dql);

        // We use backticks for the formatted string to support multi-line output
        // Escape backticks to ensure valid template literal syntax
        let escapedFormatted = formatted.replace(/`/g, '\\`');

        // If the original string was NOT a backtick string (template literal),
        // we must escape ${ to prevent it from being interpreted as an interpolation
        // when we wrap it in backticks.
        if (cmd.value[0] !== '`') {
          escapedFormatted = escapedFormatted.replace(/\$\{/g, '\\${');
        }

        const newRaw = `\`${escapedFormatted}\``;

        // Only replace if the content is different
        if (newRaw !== cmd.value) {
          content = content.substring(0, cmd.start) + newRaw + content.substring(cmd.end);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed ${filename}`);
      } else {
        console.log(`No changes needed for ${filename}`);
      }
    } else {
      dqlCommands.forEach((command) => console.log(formatDql(command.dql)));
    }
  } catch (err) {
    console.error(`Error reading file ${filename}:`, err instanceof Error ? err.message : String(err));
    process.exit(3);
  }
}

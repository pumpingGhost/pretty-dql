#!/usr/bin/env node

import { parseFile } from './utils/parseFile.util';
import { collectTargetFiles } from './utils/collectTargetFiles.util';
import { formatDqlCommand } from './utils/formatDqlCommand.util';
import { isDqlContent } from './utils/isDqlContent.util';

// CLI Entry Point - only execute when run directly, not when imported as a module
if (require.main === module) {
  const argv = process.argv.slice(2);

  // Raw-string mode: dql-format --raw "dql query" ["another query" ...]
  if (argv[0] === '--raw') {
    const rawValues = argv.slice(1);
    if (rawValues.length === 0) {
      console.error('Usage: dql-format --raw <dql-string...>');
      process.exit(1);
    }

    rawValues.forEach((value) => {
      if (!isDqlContent(value)) {
        return;
      }

      let s = value;
      if (s.length >= 2) {
        const first = s[0];
        const last = s[s.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
          s = s.substring(1, s.length - 1);
        }
      }

      const formatted = formatDqlCommand(s);
      if (formatted) {
        console.log(formatted);
      }
    });

    process.exit(0);
  }

  // Simple flag parsing for --ext=.ts,.tsx and positional paths
  const extensions: string[] = [];
  const paths: string[] = [];

  for (const arg of argv) {
    if (arg.startsWith('--ext=')) {
      const raw = arg.slice('--ext='.length).trim();
      if (raw.length > 0) {
        raw.split(',').forEach((ext) => {
          const normalized = ext.startsWith('.') ? ext : `.${ext}`;
          if (!extensions.includes(normalized)) {
            extensions.push(normalized);
          }
        });
      }
    } else {
      paths.push(arg);
    }
  }

  if (paths.length === 0) {
    console.error('Usage: dql-format <filename> [--ext=.ts,.tsx]');
    process.exit(1);
  }

  try {
    const files = collectTargetFiles(paths, {
      extensions: extensions.length > 0 ? extensions : undefined,
    });

    if (files.length === 0) {
      console.error('No matching files found');
      process.exit(1);
    }

    for (const file of files) {
      // collectTargetFiles returns absolute paths; parseFile can now handle them directly
      parseFile(file);
    }
  } catch (err) {
    if (err instanceof Error) {
      const match = err.message.match(/^Path not found:\s*(.+)$/);
      if (match) {
        const missingPath = match[1];
        console.error(`File not found: ${missingPath}`);
        process.exit(2);
      }
    }

    console.error(err instanceof Error ? err.message : String(err));
    process.exit(3);
  }
}
